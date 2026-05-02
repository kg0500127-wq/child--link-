<?php
// app/Controllers/FileController.php

class FileController {

    private const MAX_SIZE    = 10 * 1024 * 1024; // 10MB
    private const ALLOWED     = ['image/jpeg','image/png','image/gif','image/webp','application/pdf'];
    private const UPLOAD_DIR  = __DIR__ . '/../../public/uploads/';

    public static function upload(array $file, string $type = 'general', int $reportId = 0): array {

        // ── Validate ──
        if ($file['error'] !== UPLOAD_ERR_OK) {
            return ['success' => false, 'error' => 'خطأ في رفع الملف'];
        }
        if ($file['size'] > self::MAX_SIZE) {
            return ['success' => false, 'error' => 'الملف أكبر من 10MB'];
        }

        // ── Check real MIME (not just extension) ──
        $finfo    = finfo_open(FILEINFO_MIME_TYPE);
        $mimeType = finfo_file($finfo, $file['tmp_name']);
        finfo_close($finfo);

        if (!in_array($mimeType, self::ALLOWED)) {
            return ['success' => false, 'error' => 'نوع الملف غير مسموح'];
        }

        // ── Generate safe filename ──
        $ext      = match($mimeType) {
            'image/jpeg' => 'jpg', 'image/png' => 'png',
            'image/gif'  => 'gif', 'image/webp' => 'webp',
            'application/pdf' => 'pdf', default => 'bin'
        };
        $filename = bin2hex(random_bytes(16)) . '.' . $ext;
        $destPath = self::UPLOAD_DIR . $filename;

        // ── Move file ──
        if (!move_uploaded_file($file['tmp_name'], $destPath)) {
            return ['success' => false, 'error' => 'فشل حفظ الملف'];
        }

        // ── Strip EXIF from images (privacy) ──
        if (in_array($mimeType, ['image/jpeg','image/png'])) {
            self::stripExif($destPath, $mimeType);
        }

        // ── Save to DB ──
        try {
            $db = getDB();
            $db->prepare("INSERT INTO uploads (report_type, report_id, filename, original_name, mime_type, size_bytes)
                          VALUES (?,?,?,?,?,?)")
               ->execute([$type, $reportId, $filename, basename($file['name']), $mimeType, $file['size']]);
        } catch (Exception $e) { /* log silently */ }

        return ['success' => true, 'filename' => $filename, 'path' => 'uploads/' . $filename];
    }

    private static function stripExif(string $path, string $mime): void {
        if (!function_exists('imagecreatefromjpeg')) return;
        try {
            $img = $mime === 'image/jpeg' ? imagecreatefromjpeg($path) : imagecreatefrompng($path);
            if ($img) {
                $mime === 'image/jpeg' ? imagejpeg($img, $path, 90) : imagepng($img, $path, 8);
                imagedestroy($img);
            }
        } catch (Exception $e) {}
    }
}
