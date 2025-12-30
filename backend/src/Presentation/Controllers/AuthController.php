<?php

namespace LedgerFlow\Presentation\Controllers;

use LedgerFlow\Application\Services\AuthenticationService;

class AuthController
{
    private AuthenticationService $authService;

    public function __construct(AuthenticationService $authService)
    {
        $this->authService = $authService;
    }

    public function login(): void
    {
        try {
            $data = json_decode(file_get_contents('php://input'), true);

            if (!isset($data['email']) || !isset($data['password'])) {
                http_response_code(400);
                echo json_encode(['error' => 'Email and password are required']);
                return;
            }

            $result = $this->authService->login($data['email'], $data['password']);

            http_response_code(200);
            echo json_encode($result);
        } catch (\InvalidArgumentException $e) {
            http_response_code(401);
            echo json_encode(['error' => $e->getMessage()]);
        } catch (\Exception $e) {
            http_response_code(500);
            echo json_encode(['error' => 'Internal server error']);
        }
    }

    public function validate(): void
    {
        try {
            $headers = getallheaders();
            $authHeader = $headers['Authorization'] ?? '';

            if (!preg_match('/Bearer\s+(.*)$/i', $authHeader, $matches)) {
                http_response_code(401);
                echo json_encode(['error' => 'No token provided']);
                return;
            }

            $token = $matches[1];
            $payload = $this->authService->validateToken($token);

            if (!$payload) {
                http_response_code(401);
                echo json_encode(['error' => 'Invalid token']);
                return;
            }

            http_response_code(200);
            echo json_encode(['valid' => true, 'payload' => $payload]);
        } catch (\Exception $e) {
            http_response_code(500);
            echo json_encode(['error' => 'Internal server error']);
        }
    }
}
