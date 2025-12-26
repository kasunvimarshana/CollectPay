<?php

namespace App\Http\Controllers;

/**
 * @OA\Info(
 *     title="TrackVault API",
 *     version="1.0.0",
 *     description="Data Collection and Payment Management System - Complete REST API Documentation",
 *     @OA\Contact(
 *         email="admin@trackvault.com",
 *         name="TrackVault Support"
 *     ),
 *     @OA\License(
 *         name="MIT",
 *         url="https://opensource.org/licenses/MIT"
 *     )
 * )
 * 
 * @OA\Server(
 *     url="http://localhost:8000/api",
 *     description="Development Server"
 * )
 * 
 * @OA\Server(
 *     url="https://api.trackvault.com/api",
 *     description="Production Server"
 * )
 * 
 * @OA\SecurityScheme(
 *     securityScheme="sanctum",
 *     type="http",
 *     scheme="bearer",
 *     bearerFormat="Token",
 *     description="Enter your bearer token in the format: Bearer {token}"
 * )
 * 
 * @OA\Tag(
 *     name="Authentication",
 *     description="User authentication and authorization"
 * )
 * 
 * @OA\Tag(
 *     name="Suppliers",
 *     description="Supplier management operations"
 * )
 * 
 * @OA\Tag(
 *     name="Products",
 *     description="Product management operations"
 * )
 * 
 * @OA\Tag(
 *     name="Product Rates",
 *     description="Product rate management operations"
 * )
 * 
 * @OA\Tag(
 *     name="Collections",
 *     description="Collection management operations"
 * )
 * 
 * @OA\Tag(
 *     name="Payments",
 *     description="Payment management operations"
 * )
 */
abstract class Controller
{
    //
}
