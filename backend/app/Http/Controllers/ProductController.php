<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Str;
use App\Models\Product;

class ProductController extends Controller
{
    public function index(Request $request)
    {
        $products = Product::whereNull('deleted_at')
            ->orderBy('created_at', 'desc')
            ->paginate(50);

        return $this->successResponse($products);
    }

    public function show($id)
    {
        $product = Product::whereNull('deleted_at')->find($id);

        if (!$product) {
            return $this->errorResponse('Product not found', null, 404);
        }

        return $this->successResponse($product);
    }

    public function store(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'name' => 'required|string|max:255',
            'code' => 'required|string|max:50|unique:products,code',
            'unit' => 'required|string|max:20',
            'description' => 'nullable|string',
        ]);

        if ($validator->fails()) {
            return $this->errorResponse('Validation failed', $validator->errors(), 422);
        }

        $product = Product::create([
            'id' => (string) Str::uuid(),
            'name' => $request->name,
            'code' => $request->code,
            'unit' => $request->unit,
            'description' => $request->description,
            'user_id' => $request->user()->id,
            'version' => 1,
        ]);

        return $this->successResponse($product, 'Product created successfully', 201);
    }

    public function update(Request $request, $id)
    {
        $product = Product::whereNull('deleted_at')->find($id);

        if (!$product) {
            return $this->errorResponse('Product not found', null, 404);
        }

        $validator = Validator::make($request->all(), [
            'name' => 'sometimes|required|string|max:255',
            'code' => 'sometimes|required|string|max:50|unique:products,code,' . $id,
            'unit' => 'sometimes|required|string|max:20',
            'description' => 'nullable|string',
            'version' => 'required|integer',
        ]);

        if ($validator->fails()) {
            return $this->errorResponse('Validation failed', $validator->errors(), 422);
        }

        // Version check for optimistic locking
        if ($request->version !== $product->version) {
            return $this->errorResponse(
                'Version conflict detected',
                ['version' => ['Server version is ' . $product->version]],
                409
            );
        }

        $product->update([
            'name' => $request->name ?? $product->name,
            'code' => $request->code ?? $product->code,
            'unit' => $request->unit ?? $product->unit,
            'description' => $request->description ?? $product->description,
            'version' => $product->version + 1,
        ]);

        return $this->successResponse($product, 'Product updated successfully');
    }

    public function destroy($id)
    {
        $product = Product::whereNull('deleted_at')->find($id);

        if (!$product) {
            return $this->errorResponse('Product not found', null, 404);
        }

        $product->update([
            'deleted_at' => now(),
            'version' => $product->version + 1,
        ]);

        return $this->successResponse(null, 'Product deleted successfully');
    }
}
