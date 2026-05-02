<?php
// app/Middleware/Security.php

class Security {

    // ── XSS & Sanitize ──────────────────────
    public static function clean(string $str): string {
        $str = trim($str);
        $str = stripslashes($str);
        $str = htmlspecialchars($str, ENT_QUOTES | ENT_HTML5, 'UTF-8');
        return $str;
    }

    public static function cleanArray(array $data): array {
        $clean = [];
        foreach ($data as $key => $val) {
            $clean[self::clean($key)] = is_array($val)
                ? self::cleanArray($val)
                : self::clean((string)$val);
        }
        return $clean;
    }

    // ── CSRF ────────────────────────────────
    public static function generateCSRF(): string {
        if (session_status() === PHP_SESSION_NONE) session_start();
        if (empty($_SESSION['csrf_token'])) {
            $_SESSION['csrf_token'] = bin2hex(random_bytes(32));
        }
        return $_SESSION['csrf_token'];
    }

    public static function verifyCSRF(string $token): bool {
        if (session_status() === PHP_SESSION_NONE) session_start();
        return isset($_SESSION['csrf_token'])
            && hash_equals($_SESSION['csrf_token'], $token);
    }

    // ── Rate Limiting ───────────────────────
    public static function rateLimit(string $ip, string $action, int $max = 3, int $window = 300): bool {
        try {
            $db = getDB();
            $db->exec("DELETE FROM rate_limits WHERE window_start < DATE_SUB(NOW(), INTERVAL {$window} SECOND)");

            $stmt = $db->prepare("SELECT attempts FROM rate_limits WHERE ip_address=? AND action=?");
            $stmt->execute([$ip, $action]);
            $row = $stmt->fetch();

            if ($row) {
                if ($row['attempts'] >= $max) return false;
                $db->prepare("UPDATE rate_limits SET attempts=attempts+1 WHERE ip_address=? AND action=?")
                   ->execute([$ip, $action]);
            } else {
                $db->prepare("INSERT INTO rate_limits (ip_address, action) VALUES (?,?)")
                   ->execute([$ip, $action]);
            }
            return true;
        } catch (Exception $e) {
            return true; // fail open if DB error
        }
    }

    // ── Headers ─────────────────────────────

    // Alias for backward compatibility
    public static function secureHeaders(): void {
        self::setSecureHeaders();
    }
    public static function setSecureHeaders(): void {
        header('X-Content-Type-Options: nosniff');
        header('X-Frame-Options: SAMEORIGIN');
        header('X-XSS-Protection: 1; mode=block');
        header('Referrer-Policy: strict-origin-when-cross-origin');
        header("Content-Security-Policy: default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:;");
    }

    // ── IP ───────────────────────────────────
    public static function getIP(): string {
        foreach (['HTTP_CF_CONNECTING_IP','HTTP_X_FORWARDED_FOR','REMOTE_ADDR'] as $key) {
            if (!empty($_SERVER[$key])) {
                $ip = explode(',', $_SERVER[$key])[0];
                if (filter_var(trim($ip), FILTER_VALIDATE_IP)) return trim($ip);
            }
        }
        return '0.0.0.0';
    }

    // ── JSON Response ───────────────────────
    public static function json(array $data, int $code = 200): void {
        http_response_code($code);
        header('Content-Type: application/json; charset=utf-8');
        echo json_encode($data, JSON_UNESCAPED_UNICODE);
        exit;
    }
}
