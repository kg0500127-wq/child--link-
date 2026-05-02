<?php
// public/index.php — API Entry Point

session_start();
error_reporting(0);
ini_set('display_errors', 0);

// ── Autoload ──
require_once __DIR__ . '/config/database.php';
require_once __DIR__ . '/app/Middleware/Security.php';
require_once __DIR__ . '/app/Controllers/SheetsController.php';
require_once __DIR__ . '/app/Controllers/FileController.php';
require_once __DIR__ . '/app/Controllers/ReportController.php';
require_once __DIR__ . '/app/Controllers/AdminController.php';
require_once __DIR__ . '/app/Controllers/StatusController.php';

// ── Secure Headers ──
Security::secureHeaders();

// ── CORS ──
$allowedOrigin = getenv('ALLOWED_ORIGIN') ?: '*';
header("Access-Control-Allow-Origin: $allowedOrigin");
header('Access-Control-Allow-Methods: GET, POST, DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, X-Requested-With, X-Admin-Token');
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') exit(0);

// ── Router ──
$uri    = parse_url($_SERVER['REQUEST_URI'], PHP_URL_PATH);
$uri    = rtrim(str_replace('/index.php', '', $uri), '/');
$method = $_SERVER['REQUEST_METHOD'];

// ── Static pages ──
if ($uri === '' || $uri === '/') { readfile(__DIR__ . '/index.html'); exit; }
if ($uri === '/admin')           { readfile(__DIR__ . '/admin.html'); exit; }

// ── Sheets Test ──
if ($uri === '/sheets-test') {
    $serviceAccount = [
        'client_email' => 'link-child@link-child.iam.gserviceaccount.com',
        'token_uri'    => 'https://oauth2.googleapis.com/token',
        'private_key'  => "-----BEGIN PRIVATE KEY-----\nMIIEvQIBADANBgkqhkiG9w0BAQEFAASCBKcwggSjAgEAAoIBAQChK+js0w2a7byV\neE/0RHtTzXY1QDCcAfjtrA1eMN3qYv8+kUh9pT/oHD2LbiI2URgZjNFgXR7Ro9XE\nhnkPt5JsXVRPs50E2jkIGXOZRHwJT3JTylMxDp7fVQOpTsxAKgC6QqbEkp3TH09y\nYp1kgaTo5Zs8e6ghvpmYIUfm/6vgnbNo8aH6mkkR7i6+eL/15DPLWF6u9m/Y0Qyh\nboB4lL/2wSWOv1sT6LN+b6ooaHQ0bByvRwiXBvos3JRx6hZSfso7qC7c/8kYqWvA\ncRRKwvddVcVcaYnIbDrNwRMOVZnFzF9qg+UdodyD9Yzkq42iwOpH8NiQyaY3MZI2\nJbx0DeOFAgMBAAECggEAAs1/AnH1IEbsFZ6pp/Ic7EB8GBb4AW6DWVa5m3QMF+Gw\nK0gJfliGUPn/aVJOo//Vrx66HAviglDFYeKDbm40d0/0LGKk42Bhci5HIAOHM1OU\nsGJUqgYQEIrWQnZ3/3xQ1kGxzA9PUUw6bHR3OjfgRJs25N6y9iCYuS2IUOW3TnOd\n3bYSxbstYbZrmD+d43KdQ3KkwaTBOlHz9HpWZKmE0mWZdBW6b3rTzxe9xGGE8Q6q\nSx+t7Ogn3j9BaiNIl8Z0BkCefRaGIrdopTUYRljClcJyKCHISG8X0c5zq4N0hERf\nFTPLnzBfSSJmaC5v8TTcBSE8wQg44SGu9yRkDde7TQKBgQDUb/ahLoGBNnZwZcKK\nfIvOxmctH6pq4D4Pimi5lRkPBl6PZgijGgRTz6RgymEfPX1OccvaZ1+x76BTI+Z0\nTGTqTuuh6nZdiU5qxiy09Dqo2wALKWunEGv0GV8W0SOhnP8bvM0rLkIwEiV9JAYu\ndei8Qq0zyLMCH2wsNDsm33eOpwKBgQDCOLabm/aJgrWr7Te2i5OvqArUf+hQWp7o\nLX6UknzHy4bI/uRs+pTwz1D4n7SFlEKWbigOrnmCQJO2BcCHp4XQyoYGPKkxLYU6\nMaiY986OL71y7/3eByKWUe9kssv7XdbFFaso+q5pPf6WZe5/YHp1mqiG/tPyVVeb\n4d1Jh3UN8wKBgQCe29siTRSq+382LeJ8jQY/aj5dkABwS6AdHvORU92ZTroHodVz\nolD6G5xghPZ71g+OSaqXeBYniXnqsj3zWe1dCgdK3XoGGFd7oRZtevUisCIoNqE6\nHR2dPBvPhDWQ9UYQB++lCsKUD/3YxseYlrOjlHjQ8JRsUfMiWyygtRtCoQKBgED8\nyxVsbWT7yKA7ot3A/GzVVLJgDjL875kOyAEctwX/cx1ENNjGTBn7tMNMZRIhVtqR\nB3RKKzxLMWHBsPdzNZJ0gb4KhC6BZcfgH+L3YDUxgjm4VgD58DfOOMVAEoMMljWi\nF4CByORMKyjV+KTEepVpZ6SsFe1LYyI0xF+7JI7DAoGASwbK7ISOjvwjHbGIsOrl\njMRF1EhsLrzUfdGOPIEfcwaGriQ4E3EfgX8cFgvZj8XFBAe0tzouPseW1mU+BrdH\nkENzlgJMbimnrX/iDxmywZJsw+W8L4Ag6eFhoGFpdwKlFCGtou3R7YGwV14aohN2\nBJTrWGFQfmC/E/T7QYSb7VM=\n-----END PRIVATE KEY-----\n",
    ];
    $spreadsheetId = '13NTFt0UA5ZJ-nJefowwAZbFMSflUfuMDbY19_jtSaXg';
    header('Content-Type: text/html; charset=utf-8');
    echo "<h2>تشخيص Google Sheets</h2>";
    $now = time();
    $claim = ['iss'=>$serviceAccount['client_email'],'scope'=>'https://www.googleapis.com/auth/spreadsheets','aud'=>$serviceAccount['token_uri'],'iat'=>$now,'exp'=>$now+3600];
    $h = rtrim(strtr(base64_encode(json_encode(['alg'=>'RS256','typ'=>'JWT'])),'+/','-_'),'=');
    $p = rtrim(strtr(base64_encode(json_encode($claim)),'+/','-_'),'=');
    $ok = openssl_sign("$h.$p", $sig, $serviceAccount['private_key'], OPENSSL_ALGO_SHA256);
    echo "<p>توقيع JWT: ".($ok?'✅ نجح':'❌ فشل')."</p>";
    $s = rtrim(strtr(base64_encode($sig),'+/','-_'),'=');
    $jwt = "$h.$p.$s";
    $ch = curl_init($serviceAccount['token_uri']);
    curl_setopt_array($ch,[CURLOPT_POST=>true,CURLOPT_RETURNTRANSFER=>true,CURLOPT_POSTFIELDS=>http_build_query(['grant_type'=>'urn:ietf:params:oauth:grant-type:jwt-bearer','assertion'=>$jwt])]);
    $tr = json_decode(curl_exec($ch),true); curl_close($ch);
    $token = $tr['access_token'] ?? '';
    echo "<p>Access Token: ".($token?'✅ نجح':'❌ فشل - '.json_encode($tr))."</p>";
    if ($token) {
        $url = "https://sheets.googleapis.com/v4/spreadsheets/$spreadsheetId/values/missing:append?valueInputOption=USER_ENTERED&insertDataOption=INSERT_ROWS";
        $ch2 = curl_init($url);
        curl_setopt_array($ch2,[CURLOPT_CUSTOMREQUEST=>'POST',CURLOPT_RETURNTRANSFER=>true,CURLOPT_POSTFIELDS=>json_encode(['values'=>[['اختبار','تجريبي',date('Y-m-d H:i:s')]]]),CURLOPT_HTTPHEADER=>["Authorization: Bearer $token","Content-Type: application/json"]]);
        $r2 = curl_exec($ch2); $c2 = curl_getinfo($ch2,CURLINFO_HTTP_CODE); curl_close($ch2);
        echo "<p>كتابة في الشيت (HTTP $c2): ".($c2===200?'✅ نجح! افتح الشيت':'❌ فشل - '.$r2)."</p>";
    }
    exit;
}

// ── Dynamic route params: /api/report/(missing|found)/:id[/:action] ──
preg_match('#^/api/report/(missing|found)/(\d+)(?:/(\w+))?$#', $uri, $m);
$routeType   = $m[1] ?? null;
$routeId     = $m[2] ?? null;
$routeAction = $m[3] ?? null;

// BUG FIX: إضافة admin routes كانت ناقصة تمامًا من الـ router
// /api/admin/report/(missing|found)/:id[/:action]
preg_match('#^/api/admin/report/(missing|found)/(\d+)(?:/(\w+))?$#', $uri, $am);
$adminType   = $am[1] ?? null;
$adminId     = $am[2] ?? null;
$adminAction = $am[3] ?? null;

// ── API Routes ──
match(true) {

    // ── Public: إرسال البلاغات ──
    $uri === '/api/report/missing' && $method === 'POST'
        => ReportController::submitMissing(),

    $uri === '/api/report/found' && $method === 'POST'
        => ReportController::submitFound(),

    // ── Public: جلب القوائم ──
    $uri === '/api/reports/missing' && $method === 'GET'
        => ReportController::getMissing(),

    $uri === '/api/reports/found' && $method === 'GET'
        => ReportController::getFound(),

    // ── Public: تفاصيل بلاغ واحد ──
    $routeId && !$routeAction && $method === 'GET'
        => StatusController::getReport($routeType, (int)$routeId),

    // ── Public: تحديث حالة (من المُبلِّغ نفسه) ──
    $routeId && $routeAction === 'status' && $method === 'POST' && $routeType === 'missing'
        => StatusController::updateMissingStatus((int)$routeId),

    $routeId && $routeAction === 'status' && $method === 'POST' && $routeType === 'found'
        => StatusController::updateFoundStatus((int)$routeId),

    // ── Upload ──
    $uri === '/api/upload' && $method === 'POST'
        => handleUpload(),

    // ── Admin: إحصائيات ──
    $uri === '/api/admin/stats' && $method === 'GET'
        => AdminController::getStats(),

    // ── Admin: جميع البلاغات ──
    $uri === '/api/admin/reports' && $method === 'GET'
        => AdminController::getAllReports(),

    // BUG FIX: Admin delete — كان route ناقص، الـ admin.html بيطلب /api/admin/report/:type/:id
    $adminId && !$adminAction && $method === 'DELETE'
        => AdminController::deleteReport($adminType, (int)$adminId),

    // BUG FIX: Admin status update — كان route ناقص
    $adminId && $adminAction === 'status' && $method === 'POST'
        => AdminController::updateStatus($adminType, (int)$adminId),

    default => Security::json(['success' => false, 'error' => 'المسار غير موجود'], 404)
};

function handleUpload(): void {
    $ip = Security::getIP();
    if (!Security::rateLimit($ip, 'upload', 10, 60)) {
        Security::json(['success' => false, 'error' => 'تجاوزت الحد المسموح'], 429);
        return;
    }
    if (empty($_FILES['file'])) {
        Security::json(['success' => false, 'error' => 'لم يتم إرسال ملف'], 400);
        return;
    }
    $result = FileController::upload($_FILES['file'], 'general');
    Security::json($result, $result['success'] ? 200 : 422);
}
