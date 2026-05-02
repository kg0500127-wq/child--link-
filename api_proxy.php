<?php
// api_proxy.php — بروكسي للـ Anthropic API

header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');
header('Content-Type: application/json');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') exit(0);
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    exit(json_encode(['error' => 'Method not allowed']));
}

$body = file_get_contents('php://input');
$data = json_decode($body, true);

if (empty($data['api_key'])) {
    http_response_code(400);
    exit(json_encode(['error' => 'API key missing']));
}

$apiKey  = $data['api_key'];
$messages = $data['messages'] ?? [];
$system   = $data['system']   ?? '';

$payload = json_encode([
    'model'      => 'claude-sonnet-4-6',
    'max_tokens' => 1000,
    'system'     => $system,
    'messages'   => $messages,
]);

$ch = curl_init('https://api.anthropic.com/v1/messages');
curl_setopt_array($ch, [
    CURLOPT_RETURNTRANSFER => true,
    CURLOPT_POST           => true,
    CURLOPT_POSTFIELDS     => $payload,
    CURLOPT_HTTPHEADER     => [
        'Content-Type: application/json',
        'x-api-key: ' . $apiKey,
        'anthropic-version: 2023-06-01',
    ],
    CURLOPT_SSL_VERIFYPEER => true,
    CURLOPT_TIMEOUT        => 30,
]);

$response = curl_exec($ch);
$httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
$error    = curl_error($ch);
curl_close($ch);

if ($error) {
    http_response_code(500);
    exit(json_encode(['error' => 'Connection failed: ' . $error]));
}

http_response_code($httpCode);
echo $response;
