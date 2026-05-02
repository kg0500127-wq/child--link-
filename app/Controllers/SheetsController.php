<?php
// app/Controllers/SheetsController.php
// ربط البيانات بـ Google Sheets بشكل مباشر

class SheetsController {

    private static string $spreadsheetId = '13NTFt0UA5ZJ-nJefowwAZbFMSflUfuMDbY19_jtSaXg';

    private static array $serviceAccount = [
        "type"                        => "service_account",
        "project_id"                  => "link-child",
        "private_key_id"              => "96e9dabdbccea51e494f8f73b4ac9f3461386b2e",
        "private_key"                 => "-----BEGIN PRIVATE KEY-----\nMIIEvQIBADANBgkqhkiG9w0BAQEFAASCBKcwggSjAgEAAoIBAQChK+js0w2a7byV\neE/0RHtTzXY1QDCcAfjtrA1eMN3qYv8+kUh9pT/oHD2LbiI2URgZjNFgXR7Ro9XE\nhnkPt5JsXVRPs50E2jkIGXOZRHwJT3JTylMxDp7fVQOpTsxAKgC6QqbEkp3TH09y\nYp1kgaTo5Zs8e6ghvpmYIUfm/6vgnbNo8aH6mkkR7i6+eL/15DPLWF6u9m/Y0Qyh\nboB4lL/2wSWOv1sT6LN+b6ooaHQ0bByvRwiXBvos3JRx6hZSfso7qC7c/8kYqWvA\ncRRKwvddVcVcaYnIbDrNwRMOVZnFzF9qg+UdodyD9Yzkq42iwOpH8NiQyaY3MZI2\nJbx0DeOFAgMBAAECggEAAs1/AnH1IEbsFZ6pp/Ic7EB8GBb4AW6DWVa5m3QMF+Gw\nK0gJfliGUPn/aVJOo//Vrx66HAviglDFYeKDbm40d0/0LGKk42Bhci5HIAOHM1OU\nsGJUqgYQEIrWQnZ3/3xQ1kGxzA9PUUw6bHR3OjfgRJs25N6y9iCYuS2IUOW3TnOd\n3bYSxbstYbZrmD+d43KdQ3KkwaTBOlHz9HpWZKmE0mWZdBW6b3rTzxe9xGGE8Q6q\nSx+t7Ogn3j9BaiNIl8Z0BkCefRaGIrdopTUYRljClcJyKCHISG8X0c5zq4N0hERf\nFTPLnzBfSSJmaC5v8TTcBSE8wQg44SGu9yRkDde7TQKBgQDUb/ahLoGBNnZwZcKK\nfIvOxmctH6pq4D4Pimi5lRkPBl6PZgijGgRTz6RgymEfPX1OccvaZ1+x76BTI+Z0\nTGTqTuuh6nZdiU5qxiy09Dqo2wALKWunEGv0GV8W0SOhnP8bvM0rLkIwEiV9JAYu\ndei8Qq0zyLMCH2wsNDsm33eOpwKBgQDCOLabm/aJgrWr7Te2i5OvqArUf+hQWp7o\nLX6UknzHy4bI/uRs+pTwz1D4n7SFlEKWbigOrnmCQJO2BcCHp4XQyoYGPKkxLYU6\nMaiY986OL71y7/3eByKWUe9kssv7XdbFFaso+q5pPf6WZe5/YHp1mqiG/tPyVVeb\n4d1Jh3UN8wKBgQCe29siTRSq+382LeJ8jQY/aj5dkABwS6AdHvORU92ZTroHodVz\nolD6G5xghPZ71g+OSaqXeBYniXnqsj3zWe1dCgdK3XoGGFd7oRZtevUisCIoNqE6\nHR2dPBvPhDWQ9UYQB++lCsKUD/3YxseYlrOjlHjQ8JRsUfMiWyygtRtCoQKBgED8\nyxVsbWT7yKA7ot3A/GzVVLJgDjL875kOyAEctwX/cx1ENNjGTBn7tMNMZRIhVtqR\nB3RKKzxLMWHBsPdzNZJ0gb4KhC6BZcfgH+L3YDUxgjm4VgD58DfOOMVAEoMMljWi\nF4CByORMKyjV+KTEepVpZ6SsFe1LYyI0xF+7JI7DAoGASwbK7ISOjvwjHbGIsOrl\njMRF1EhsLrzUfdGOPIEfcwaGriQ4E3EfgX8cFgvZj8XFBAe0tzouPseW1mU+BrdH\nkENzlgJMbimnrX/iDxmywZJsw+W8L4Ag6eFhoGFpdwKlFCGtou3R7YGwV14aohN2\nBJTrWGFQfmC/E/T7QYSb7VM=\n-----END PRIVATE KEY-----\n",
        "client_email"                => "link-child@link-child.iam.gserviceaccount.com",
        "client_id"                   => "111272914149191537510",
        "token_uri"                   => "https://oauth2.googleapis.com/token",
    ];

    // ── توليد JWT للمصادقة ──────────────────────────────────────
    private static function getAccessToken(): string {
        $now    = time();
        $claim  = [
            'iss'   => self::$serviceAccount['client_email'],
            'scope' => 'https://www.googleapis.com/auth/spreadsheets',
            'aud'   => self::$serviceAccount['token_uri'],
            'iat'   => $now,
            'exp'   => $now + 3600,
        ];

        // Header
        $header  = base64_encode(json_encode(['alg'=>'RS256','typ'=>'JWT']));
        $header  = rtrim(strtr($header, '+/', '-_'), '=');

        // Payload
        $payload = base64_encode(json_encode($claim));
        $payload = rtrim(strtr($payload, '+/', '-_'), '=');

        // Signature
        $data = "$header.$payload";
        openssl_sign($data, $sig, self::$serviceAccount['private_key'], OPENSSL_ALGO_SHA256);
        $sig = rtrim(strtr(base64_encode($sig), '+/', '-_'), '=');

        $jwt = "$data.$sig";

        // طلب الـ Access Token
        $ch = curl_init(self::$serviceAccount['token_uri']);
        curl_setopt_array($ch, [
            CURLOPT_POST           => true,
            CURLOPT_RETURNTRANSFER => true,
            CURLOPT_POSTFIELDS     => http_build_query([
                'grant_type' => 'urn:ietf:params:oauth:grant-type:jwt-bearer',
                'assertion'  => $jwt,
            ]),
        ]);
        $res   = json_decode(curl_exec($ch), true);
        curl_close($ch);

        return $res['access_token'] ?? '';
    }

    // ── إضافة صف في الشيت ──────────────────────────────────────
    private static function appendRow(string $sheet, array $values): bool {
        $token = self::getAccessToken();
        if (!$token) return false;

        $url  = "https://sheets.googleapis.com/v4/spreadsheets/"
              . self::$spreadsheetId
              . "/values/" . urlencode($sheet) . ":append"
              . "?valueInputOption=USER_ENTERED&insertDataOption=INSERT_ROWS";

        $body = json_encode(['values' => [$values]]);

        $ch = curl_init($url);
        curl_setopt_array($ch, [
            CURLOPT_CUSTOMREQUEST  => 'POST',
            CURLOPT_RETURNTRANSFER => true,
            CURLOPT_POSTFIELDS     => $body,
            CURLOPT_HTTPHEADER     => [
                "Authorization: Bearer $token",
                "Content-Type: application/json",
            ],
        ]);
        $res  = curl_exec($ch);
        $code = curl_getinfo($ch, CURLINFO_HTTP_CODE);
        curl_close($ch);

        return $code === 200;
    }

    // ── إضافة العناوين لو الشيت فاضي ──────────────────────────
    private static function ensureHeaders(string $sheet, array $headers): void {
        $token = self::getAccessToken();
        if (!$token) return;

        $url = "https://sheets.googleapis.com/v4/spreadsheets/"
             . self::$spreadsheetId
             . "/values/" . urlencode($sheet) . "!A1";

        $ch = curl_init($url);
        curl_setopt_array($ch, [
            CURLOPT_RETURNTRANSFER => true,
            CURLOPT_HTTPHEADER     => ["Authorization: Bearer $token"],
        ]);
        $res = json_decode(curl_exec($ch), true);
        curl_close($ch);

        // لو الشيت فاضي — ضيف العناوين
        if (empty($res['values'])) {
            self::appendRow($sheet, $headers);
        }
    }

    // ── تسجيل بلاغ مفقود ────────────────────────────────────────
    public static function logMissing(array $d, string $imagePath = ''): void {
        $headers = [
            'م', 'الاسم', 'العمر', 'الجنس', 'المنطقة',
            'المحافظة', 'ولي الأمر', 'التليفون',
            'الوصف', 'تاريخ الاختفاء', 'صورة', 'تاريخ التسجيل'
        ];

        self::ensureHeaders('missing', $headers);

        // جلب عدد الصفوف الحالي للترقيم
        static $missingCount = null;
        if ($missingCount === null) {
            $missingCount = self::getRowCount('missing');
        }
        $missingCount++;

        self::appendRow('missing', [
            $missingCount,
            $d['name']        ?? '',
            $d['age']         ?? '',
            $d['gender'] === 'male' ? 'ذكر' : ($d['gender'] === 'female' ? 'أنثى' : ''),
            $d['area']        ?? '',
            $d['region']      ?? '',
            $d['guardian']    ?? '',
            $d['phone']       ?? '',
            $d['description'] ?? '',
            $d['lost_at']     ?? '',
            $imagePath        ? ('https://childlink.example.com/' . $imagePath) : '',
            date('Y-m-d H:i:s'),
        ]);
    }

    // ── تسجيل بلاغ معثور عليه ───────────────────────────────────
    public static function logFound(array $d, string $imagePath = ''): void {
        $headers = [
            'م', 'الاسم', 'العمر', 'الجنس', 'المنطقة',
            'المحافظة', 'المُبلِّغ', 'التليفون', 'الوصف',
            'الحالة الصحية', 'حالة الطفل', 'تاريخ العثور',
            'صورة', 'تاريخ التسجيل'
        ];

        self::ensureHeaders('found', $headers);

        static $foundCount = null;
        if ($foundCount === null) {
            $foundCount = self::getRowCount('found');
        }
        $foundCount++;

        self::appendRow('found', [
            $foundCount,
            $d['name']         ?? 'مجهول',
            $d['age']          ?? '',
            $d['gender'] === 'male' ? 'ذكر' : ($d['gender'] === 'female' ? 'أنثى' : ''),
            $d['area']         ?? '',
            $d['region']       ?? '',
            $d['reporter']     ?? '',
            $d['phone']        ?? '',
            $d['description']  ?? '',
            match($d['health'] ?? '') {
                'good'     => 'بخير',
                'injured'  => 'مصاب',
                'critical' => 'حالة خطيرة',
                default    => ''
            },
            match($d['child_status'] ?? '') {
                'with_reporter'  => 'مع المُبلِّغ',
                'police'         => 'مع الشرطة',
                'hospital'       => 'في المستشفى',
                default          => ''
            },
            $d['found_at']     ?? '',
            $imagePath         ? ('https://childlink.example.com/' . $imagePath) : '',
            date('Y-m-d H:i:s'),
        ]);
    }

    // ── عد الصفوف الحالية ────────────────────────────────────────
    private static function getRowCount(string $sheet): int {
        $token = self::getAccessToken();
        if (!$token) return 0;

        $url = "https://sheets.googleapis.com/v4/spreadsheets/"
             . self::$spreadsheetId
             . "/values/" . urlencode($sheet) . "!A:A";

        $ch = curl_init($url);
        curl_setopt_array($ch, [
            CURLOPT_RETURNTRANSFER => true,
            CURLOPT_HTTPHEADER     => ["Authorization: Bearer $token"],
        ]);
        $res = json_decode(curl_exec($ch), true);
        curl_close($ch);

        $count = count($res['values'] ?? []);
        return max(0, $count - 1); // بنطرح صف العناوين
    }
}
