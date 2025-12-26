<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Str;
use App\Models\Supplier;

class SupplierController extends Controller
{
    public function index(Request $request)
    {
        $suppliers = Supplier::whereNull('deleted_at')
            ->orderBy('created_at', 'desc')
            ->paginate(50);

        return $this->successResponse($suppliers);
    }

    public function show($id)
    {
        $supplier = Supplier::whereNull('deleted_at')->find($id);

        if (!$supplier) {
            return $this->errorResponse('Supplier not found', null, 404);
        }

        return $this->successResponse($supplier);
    }

    public function store(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'name' => 'required|string|max:255',
            'code' => 'required|string|max:50|unique:suppliers,code',
            'address' => 'nullable|string',
            'phone' => 'nullable|string|max:20',
            'email' => 'nullable|email',
            'notes' => 'nullable|string',
        ]);

        if ($validator->fails()) {
            return $this->errorResponse('Validation failed', $validator->errors(), 422);
        }

        $supplier = Supplier::create([
            'id' => (string) Str::uuid(),
            'name' => $request->name,
            'code' => $request->code,
            'address' => $request->address,
            'phone' => $request->phone,
            'email' => $request->email,
            'notes' => $request->notes,
            'user_id' => $request->user()->id,
            'version' => 1,
        ]);

        return $this->successResponse($supplier, 'Supplier created successfully', 201);
    }

    public function update(Request $request, $id)
    {
        $supplier = Supplier::whereNull('deleted_at')->find($id);

        if (!$supplier) {
            return $this->errorResponse('Supplier not found', null, 404);
        }

        $validator = Validator::make($request->all(), [
            'name' => 'sometimes|required|string|max:255',
            'code' => 'sometimes|required|string|max:50|unique:suppliers,code,' . $id,
            'address' => 'nullable|string',
            'phone' => 'nullable|string|max:20',
            'email' => 'nullable|email',
            'notes' => 'nullable|string',
            'version' => 'required|integer',
        ]);

        if ($validator->fails()) {
            return $this->errorResponse('Validation failed', $validator->errors(), 422);
        }

        // Version check for optimistic locking
        if ($request->version !== $supplier->version) {
            return $this->errorResponse(
                'Version conflict detected',
                ['version' => ['Server version is ' . $supplier->version]],
                409
            );
        }

        $supplier->update([
            'name' => $request->name ?? $supplier->name,
            'code' => $request->code ?? $supplier->code,
            'address' => $request->address ?? $supplier->address,
            'phone' => $request->phone ?? $supplier->phone,
            'email' => $request->email ?? $supplier->email,
            'notes' => $request->notes ?? $supplier->notes,
            'version' => $supplier->version + 1,
        ]);

        return $this->successResponse($supplier, 'Supplier updated successfully');
    }

    public function destroy($id)
    {
        $supplier = Supplier::whereNull('deleted_at')->find($id);

        if (!$supplier) {
            return $this->errorResponse('Supplier not found', null, 404);
        }

        $supplier->update([
            'deleted_at' => now(),
            'version' => $supplier->version + 1,
        ]);

        return $this->successResponse(null, 'Supplier deleted successfully');
    }
}
