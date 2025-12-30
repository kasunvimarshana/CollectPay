<?php

namespace App\Http\Controllers;

/**
 * @OA\Info(
 *     title="Data Collection and Payment Management API",
 *     version="1.0.0",
 *     description="Production-ready API for managing users, suppliers, products, collections, rates, and payments with multi-unit tracking, versioned rates, and automated payment calculations. Built on Clean Architecture, SOLID, DRY, and KISS principles.",
 *     @OA\Contact(
 *         email="support@ledger.com",
 *         name="API Support"
 *     ),
 *     @OA\License(
 *         name="MIT",
 *         url="https://opensource.org/licenses/MIT"
 *     )
 * )
 * 
 * @OA\Server(
 *     url="http://localhost:8000/api",
 *     description="Local Development Server"
 * )
 * 
 * @OA\Server(
 *     url="https://api.ledger.com/api",
 *     description="Production Server"
 * )
 * 
 * @OA\SecurityScheme(
 *     securityScheme="bearerAuth",
 *     type="http",
 *     scheme="bearer",
 *     bearerFormat="JWT",
 *     description="JWT Bearer Token authentication. Include the token in the Authorization header as: Bearer {token}"
 * )
 * 
 * @OA\Tag(
 *     name="Authentication",
 *     description="User authentication and authorization endpoints"
 * )
 * 
 * @OA\Tag(
 *     name="Users",
 *     description="User management operations"
 * )
 * 
 * @OA\Tag(
 *     name="Roles",
 *     description="Role management for RBAC"
 * )
 * 
 * @OA\Tag(
 *     name="Suppliers",
 *     description="Supplier management with multi-unit tracking"
 * )
 * 
 * @OA\Tag(
 *     name="Products",
 *     description="Product management with multi-unit support"
 * )
 * 
 * @OA\Tag(
 *     name="Rates",
 *     description="Versioned rate management for products"
 * )
 * 
 * @OA\Tag(
 *     name="Collections",
 *     description="Daily collection tracking with multi-unit quantities"
 * )
 * 
 * @OA\Tag(
 *     name="Payments",
 *     description="Payment management with advance, partial, and full payment support"
 * )
 */
abstract class Controller
{
    //
}
