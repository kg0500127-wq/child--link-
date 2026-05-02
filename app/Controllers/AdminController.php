<?php
// app/Controllers/AdminController.php

// BUG FIX: كان بيستخدم Database::connect() اللي مش موجودة — استُبدل بـ getDB()

class AdminController {

    // ── GET /api/admin/stats ──
    public static function getStats(): void {
        self::requireAdmin();

        try {
            $pdo = getDB();

            $missing = $pdo->query("SELECT COUNT(*) FROM missing_reports WHERE status='active'")->fetchColumn();
            $found   = $pdo->query("SELECT COUNT(*) FROM found_reports WHERE status='active'")->fetchColumn();
            $closed  = $pdo->query("SELECT COUNT(*) FROM missing_reports WHERE status IN ('found','closed')")->fetchColumn();
            $today   = date('Y-m-d');
            $todayM  = $pdo->prepare("SELECT COUNT(*) FROM missing_reports WHERE DATE(created_at)=?");
            $todayM->execute([$today]);
            $todayF  = $pdo->prepare("SELECT COUNT(*) FROM found_reports WHERE DATE(created_at)=?");
            $todayF->execute([$today]);

            Security::json([
                'success' => true,
                'data' => [
                    'missing_active' => (int)$missing,
                    'found_active'   => (int)$found,
                    'closed'         => (int)$closed,
                    'total'          => (int)$missing + (int)$found,
                    'today'          => (int)$todayM->fetchColumn() + (int)$todayF->fetchColumn(),
                ]
            ]);
        } catch (Exception $e) {
            Security::json(['success' => false, 'error' => 'خطأ في الاتصال'], 500);
        }
    }

    // ── GET /api/admin/reports ──
    public static function getAllReports(): void {
        self::requireAdmin();

        try {
            $pdo    = getDB();
            $type   = Security::clean($_GET['type'] ?? 'all');
            $page   = max(1, (int)($_GET['page'] ?? 1));
            $limit  = 20;
            $offset = ($page - 1) * $limit;

            $reports = [];

            if ($type === 'all' || $type === 'missing') {
                $stmt = $pdo->prepare("SELECT *, 'missing' as type FROM missing_reports ORDER BY created_at DESC LIMIT ? OFFSET ?");
                $stmt->execute([$limit, $offset]);
                $reports = array_merge($reports, $stmt->fetchAll());
            }

            if ($type === 'all' || $type === 'found') {
                $stmt = $pdo->prepare("SELECT *, 'found' as type FROM found_reports ORDER BY created_at DESC LIMIT ? OFFSET ?");
                $stmt->execute([$limit, $offset]);
                $reports = array_merge($reports, $stmt->fetchAll());
            }

            Security::json(['success' => true, 'data' => $reports, 'page' => $page]);
        } catch (Exception $e) {
            Security::json(['success' => false, 'error' => 'خطأ في الاتصال'], 500);
        }
    }

    // ── DELETE /api/admin/report/:type/:id ──
    public static function deleteReport(string $type, int $id): void {
        self::requireAdmin();

        $id = (int)$id;
        if (!$id || !in_array($type, ['missing', 'found'])) {
            Security::json(['success' => false, 'error' => 'بيانات غير صحيحة'], 400);
        }

        try {
            $pdo   = getDB();
            $table = $type === 'missing' ? 'missing_reports' : 'found_reports';

            // حذف الصورة لو موجودة
            $stmt = $pdo->prepare("SELECT image_path FROM $table WHERE id = ?");
            $stmt->execute([$id]);
            $row = $stmt->fetch();
            if ($row && !empty($row['image_path'])) {
                $imgPath = __DIR__ . '/../../public/' . $row['image_path'];
                if (file_exists($imgPath)) unlink($imgPath);
            }

            $pdo->prepare("DELETE FROM $table WHERE id = ?")->execute([$id]);
            Security::json(['success' => true, 'message' => 'تم الحذف']);
        } catch (Exception $e) {
            Security::json(['success' => false, 'error' => 'خطأ في الحذف'], 500);
        }
    }

    // ── POST /api/admin/report/:type/:id/status ──
    public static function updateStatus(string $type, int $id): void {
        self::requireAdmin();

        $id   = (int)$id;
        $body = json_decode(file_get_contents('php://input'), true);
        $status = Security::clean($body['status'] ?? '');

        $allowedStatuses = ['active', 'found', 'matched', 'closed'];
        if (!$id || !in_array($type, ['missing', 'found']) || !in_array($status, $allowedStatuses)) {
            Security::json(['success' => false, 'error' => 'بيانات غير صحيحة'], 400);
        }

        try {
            $pdo   = getDB();
            $table = $type === 'missing' ? 'missing_reports' : 'found_reports';
            $pdo->prepare("UPDATE $table SET status = ?, updated_at = NOW() WHERE id = ?")
                ->execute([$status, $id]);
            Security::json(['success' => true, 'message' => 'تم تحديث الحالة']);
        } catch (Exception $e) {
            Security::json(['success' => false, 'error' => 'خطأ في التحديث'], 500);
        }
    }

    // ── التحقق من الـ Admin Token ──
    private static function requireAdmin(): void {
        $headers = function_exists('getallheaders') ? getallheaders() : [];
        $token   = $headers['X-Admin-Token']
                ?? $headers['x-admin-token']
                ?? $_GET['token']
                ?? '';

        $validToken = getenv('ADMIN_TOKEN') ?: 'childlink-admin-2026';

        if (!hash_equals($validToken, $token)) {
            Security::json(['success' => false, 'error' => 'غير مصرح'], 401);
        }
    }
}
