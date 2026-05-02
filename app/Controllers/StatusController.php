<?php
// app/Controllers/StatusController.php

// BUG FIX: كان بيستخدم Database::connect() اللي مش موجودة — استُبدل بـ getDB()

class StatusController {

    // ── POST /api/report/missing/:id/status ──
    public static function updateMissingStatus(int $id): void {
        $id     = (int)$id;
        $body   = json_decode(file_get_contents('php://input'), true);
        $status = Security::clean($body['status'] ?? '');
        $allowed = ['active', 'found', 'closed'];

        if (!$id || !in_array($status, $allowed)) {
            Security::json(['success' => false, 'error' => 'بيانات غير صحيحة'], 400);
        }

        try {
            $pdo = getDB();
            $pdo->prepare("UPDATE missing_reports SET status = ?, updated_at = NOW() WHERE id = ?")
                ->execute([$status, $id]);

            $messages = [
                'found'  => '🎉 تم العثور على الطفل',
                'closed' => '✅ تم إغلاق البلاغ',
                'active' => '🔄 تم إعادة تفعيل البلاغ',
            ];

            Security::json(['success' => true, 'message' => $messages[$status]]);
        } catch (Exception $e) {
            Security::json(['success' => false, 'error' => 'خطأ في التحديث'], 500);
        }
    }

    // ── POST /api/report/found/:id/status ──
    public static function updateFoundStatus(int $id): void {
        $id     = (int)$id;
        $body   = json_decode(file_get_contents('php://input'), true);
        $status = Security::clean($body['status'] ?? '');
        $allowed = ['active', 'matched', 'closed'];

        if (!$id || !in_array($status, $allowed)) {
            Security::json(['success' => false, 'error' => 'بيانات غير صحيحة'], 400);
        }

        try {
            $pdo = getDB();
            $pdo->prepare("UPDATE found_reports SET status = ?, updated_at = NOW() WHERE id = ?")
                ->execute([$status, $id]);

            $messages = [
                'matched' => '🎉 تم التعرف على الطفل',
                'closed'  => '✅ تم إغلاق البلاغ',
                'active'  => '🔄 تم إعادة تفعيل البلاغ',
            ];

            Security::json(['success' => true, 'message' => $messages[$status]]);
        } catch (Exception $e) {
            Security::json(['success' => false, 'error' => 'خطأ في التحديث'], 500);
        }
    }

    // ── DELETE /api/report/:type/:id ──
    public static function deleteReport(string $type, int $id): void {
        $id = (int)$id;
        if (!$id || !in_array($type, ['missing', 'found'])) {
            Security::json(['success' => false, 'error' => 'بيانات غير صحيحة'], 400);
        }

        try {
            $pdo   = getDB();
            $table = $type === 'missing' ? 'missing_reports' : 'found_reports';

            $stmt = $pdo->prepare("SELECT image_path FROM $table WHERE id = ?");
            $stmt->execute([$id]);
            $row = $stmt->fetch();
            if ($row && !empty($row['image_path'])) {
                $imgPath = __DIR__ . '/../../public/' . $row['image_path'];
                if (file_exists($imgPath)) unlink($imgPath);
            }

            $pdo->prepare("DELETE FROM $table WHERE id = ?")->execute([$id]);
            Security::json(['success' => true, 'message' => 'تم حذف البلاغ']);
        } catch (Exception $e) {
            Security::json(['success' => false, 'error' => 'خطأ في الحذف'], 500);
        }
    }

    // ── GET /api/report/:type/:id ──
    public static function getReport(string $type, int $id): void {
        $id = (int)$id;
        if (!$id || !in_array($type, ['missing', 'found'])) {
            Security::json(['success' => false, 'error' => 'بيانات غير صحيحة'], 400);
        }

        try {
            $pdo   = getDB();
            $table = $type === 'missing' ? 'missing_reports' : 'found_reports';
            $stmt  = $pdo->prepare("SELECT * FROM $table WHERE id = ?");
            $stmt->execute([$id]);
            $row = $stmt->fetch();

            if (!$row) {
                Security::json(['success' => false, 'error' => 'البلاغ غير موجود'], 404);
            }

            Security::json(['success' => true, 'data' => $row]);
        } catch (Exception $e) {
            Security::json(['success' => false, 'error' => 'خطأ في الاتصال'], 500);
        }
    }
}
