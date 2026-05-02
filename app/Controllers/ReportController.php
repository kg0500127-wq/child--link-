<?php
// app/Controllers/ReportController.php

class ReportController {

    // ── POST /api/report/missing ─────────────
    public static function submitMissing(): void {
        $ip = Security::getIP();

        // Rate limit: 3 reports per 5 minutes per IP
        if (!Security::rateLimit($ip, 'missing', 3, 300)) {
            Security::json(['success'=>false,'error'=>'تجاوزت الحد المسموح. انتظر 5 دقائق.'], 429);
        }

        $d = Security::cleanArray($_POST);

        // Validate required
        if (empty($d['name']) || strlen($d['name']) < 2) {
            Security::json(['success'=>false,'error'=>'اسم الطفل مطلوب'], 422);
        }
        if (empty($d['phone']) || !preg_match('/^01[0-9]{9}$/', $d['phone'])) {
            Security::json(['success'=>false,'error'=>'رقم هاتف غير صحيح'], 422);
        }

        // Handle image
        $imagePath = '';
        if (!empty($_FILES['image']['name'])) {
            $upload = FileController::upload($_FILES['image'], 'missing');
            if (!$upload['success']) {
                Security::json(['success'=>false,'error'=>$upload['error']], 422);
            }
            $imagePath = $upload['path'];
        }

        // Save to DB
        try {
            $db = getDB();
            $stmt = $db->prepare("
                INSERT INTO missing_reports
                (name, age, gender, area, region, guardian, phone, description, image_path, lost_at, ip_address)
                VALUES (?,?,?,?,?,?,?,?,?,?,?)
            ");
            $stmt->execute([
                $d['name']        ?? '',
                (int)($d['age']   ?? 0),
                $d['gender']      ?? null,
                $d['area']        ?? '',
                $d['region']      ?? '',
                $d['guardian']    ?? '',
                $d['phone']       ?? '',
                $d['description'] ?? '',
                $imagePath,
                !empty($d['lost_at']) ? $d['lost_at'] : null,
                $ip
            ]);
            $id = $db->lastInsertId();

            // ── إرسال البيانات لـ Google Sheets فوراً ──
            try {
                SheetsController::logMissing($d, $imagePath);
            } catch (Exception $se) {
                // لو فشل الشيت مش بنوقف التسجيل
            }

            Security::json(['success'=>true,'id'=>$id,'message'=>'تم استلام البلاغ بنجاح']);
        } catch (Exception $e) {
            Security::json(['success'=>false,'error'=>'خطأ في قاعدة البيانات'], 500);
        }
    }

    // ── POST /api/report/found ───────────────
    public static function submitFound(): void {
        $ip = Security::getIP();

        if (!Security::rateLimit($ip, 'found', 3, 300)) {
            Security::json(['success'=>false,'error'=>'تجاوزت الحد المسموح'], 429);
        }

        $d = Security::cleanArray($_POST);

        if (empty($d['phone']) || !preg_match('/^01[0-9]{9}$/', $d['phone'])) {
            Security::json(['success'=>false,'error'=>'رقم هاتف غير صحيح'], 422);
        }

        $imagePath = '';
        if (!empty($_FILES['image']['name'])) {
            $upload = FileController::upload($_FILES['image'], 'found');
            if (!$upload['success']) {
                Security::json(['success'=>false,'error'=>$upload['error']], 422);
            }
            $imagePath = $upload['path'];
        }

        try {
            $db = getDB();
            $stmt = $db->prepare("
                INSERT INTO found_reports
                (name, age, gender, area, region, reporter, phone, description, image_path, health, child_status, found_at, ip_address)
                VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?)
            ");
            $stmt->execute([
                $d['name']         ?? 'مجهول',
                $d['age']          ?? '',
                $d['gender']       ?? 'unknown',
                $d['area']         ?? '',
                $d['region']       ?? '',
                $d['reporter']     ?? '',
                $d['phone']        ?? '',
                $d['description']  ?? '',
                $imagePath,
                $d['health']       ?? 'good',
                $d['child_status'] ?? 'with_reporter',
                !empty($d['found_at']) ? $d['found_at'] : null,
                $ip
            ]);
            $id = $db->lastInsertId();

            // ── إرسال البيانات لـ Google Sheets فوراً ──
            try {
                SheetsController::logFound($d, $imagePath);
            } catch (Exception $se) {
                // لو فشل الشيت مش بنوقف التسجيل
            }

            Security::json(['success'=>true,'id'=>$id,'message'=>'شكراً! تم استلام البلاغ']);
        } catch (Exception $e) {
            Security::json(['success'=>false,'error'=>'خطأ في قاعدة البيانات'], 500);
        }
    }

    // ── GET /api/reports/missing ─────────────
    public static function getMissing(): void {
        try {
            $db     = getDB();
            $region = Security::clean($_GET['region'] ?? '');
            $search = Security::clean($_GET['q']      ?? '');
            $page   = max(1, (int)($_GET['page']      ?? 1));
            $limit  = 20;
            $offset = ($page - 1) * $limit;

            $sql    = "SELECT id, name, age, area, region, guardian, phone, description, image_path, lost_at, created_at
                       FROM missing_reports WHERE status='active'";
            $params = [];

            if ($region) { $sql .= " AND region=?"; $params[] = $region; }
            if ($search)  { $sql .= " AND (name LIKE ? OR area LIKE ?)"; $params[] = "%$search%"; $params[] = "%$search%"; }

            $sql .= " ORDER BY created_at DESC LIMIT $limit OFFSET $offset";

            $stmt = $db->prepare($sql);
            $stmt->execute($params);
            $rows = $stmt->fetchAll();

            Security::json(['success'=>true,'data'=>$rows,'page'=>$page]);
        } catch (Exception $e) {
            Security::json(['success'=>false,'error'=>'خطأ في جلب البيانات'], 500);
        }
    }

    // ── GET /api/reports/found ───────────────
    public static function getFound(): void {
        try {
            $db     = getDB();
            $region = Security::clean($_GET['region'] ?? '');
            $search = Security::clean($_GET['q']      ?? '');
            $page   = max(1, (int)($_GET['page']      ?? 1));
            $limit  = 20;
            $offset = ($page - 1) * $limit;

            $sql    = "SELECT id, name, age, area, region, reporter, phone, description, image_path, found_at, created_at
                       FROM found_reports WHERE status='active'";
            $params = [];

            if ($region) { $sql .= " AND region=?"; $params[] = $region; }
            if ($search)  { $sql .= " AND (name LIKE ? OR area LIKE ?)"; $params[] = "%$search%"; $params[] = "%$search%"; }

            $sql .= " ORDER BY created_at DESC LIMIT $limit OFFSET $offset";

            $stmt = $db->prepare($sql);
            $stmt->execute($params);
            $rows = $stmt->fetchAll();

            Security::json(['success'=>true,'data'=>$rows,'page'=>$page]);
        } catch (Exception $e) {
            Security::json(['success'=>false,'error'=>'خطأ في جلب البيانات'], 500);
        }
    }
}
