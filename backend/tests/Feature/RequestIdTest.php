<?php

namespace Tests\Feature;

use Tests\TestCase;
use Illuminate\Foundation\Testing\RefreshDatabase;

class RequestIdTest extends TestCase
{
    use RefreshDatabase;

    /**
     * Test that request ID is added to successful responses
     */
    public function test_request_id_is_added_to_response_headers(): void
    {
        $response = $this->getJson('/api/user');

        $response->assertStatus(401); // Unauthenticated
        $this->assertNotNull($response->headers->get('X-Request-ID'));
        
        // Verify format: XXXX:XXXXXX:XXXXXX:XXXXXXX:XXXXXXXX
        $requestId = $response->headers->get('X-Request-ID');
        $this->assertMatchesRegularExpression(
            '/^[0-9A-F]{4}:[0-9A-F]{6}:[0-9A-F]{6}:[0-9A-F]{7}:[0-9A-F]{8}$/',
            $requestId
        );
    }

    /**
     * Test that request ID is included in error response body
     */
    public function test_request_id_is_included_in_error_response_body(): void
    {
        $response = $this->getJson('/api/user');

        $response->assertStatus(401);
        $response->assertJsonStructure(['message', 'request_id']);
        
        $data = $response->json();
        $this->assertNotEmpty($data['request_id']);
        
        // Verify request ID in body matches header
        $headerId = $response->headers->get('X-Request-ID');
        $bodyId = $data['request_id'];
        $this->assertEquals($headerId, $bodyId);
    }

    /**
     * Test that client-provided request ID is preserved
     */
    public function test_client_provided_request_id_is_preserved(): void
    {
        $clientRequestId = 'TEST:123456:ABCDEF:7890ABC:DEF12345';
        
        $response = $this->withHeaders([
            'X-Request-ID' => $clientRequestId
        ])->getJson('/api/user');

        $response->assertStatus(401);
        $responseRequestId = $response->headers->get('X-Request-ID');
        $this->assertEquals($clientRequestId, $responseRequestId);
    }

    /**
     * Test that each request gets a unique request ID
     */
    public function test_each_request_gets_unique_request_id(): void
    {
        $response1 = $this->getJson('/api/user');
        $response2 = $this->getJson('/api/user');

        $requestId1 = $response1->headers->get('X-Request-ID');
        $requestId2 = $response2->headers->get('X-Request-ID');

        $this->assertNotEquals($requestId1, $requestId2);
    }

    /**
     * Test request ID is added to validation error responses
     */
    public function test_request_id_in_validation_errors(): void
    {
        $response = $this->postJson('/api/register', [
            'name' => '',
            'email' => 'invalid-email',
            'password' => '123'
        ]);

        $response->assertStatus(422); // Validation error
        $response->assertJsonStructure(['message', 'errors']);
        
        $this->assertNotNull($response->headers->get('X-Request-ID'));
    }
}
