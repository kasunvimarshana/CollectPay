<?php

namespace App\Http\Controllers;

use App\Models\Product;
use App\Models\ProductRate;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class ProductController extends Controller
{
    /**
     * Display a listing of products
     */
    public function index(Request $request)
    {
        $query = Product::query()->with(['creator', 'updater', 'activeRates']);

        if ($request->has('is_active')) {
            $query->where('is_active', $request->boolean('is_active'));
        }

        if ($request->has('search')) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                  ->orWhere('code', 'like', "%{$search}%");
            });
        }

        $perPage = $request->get('per_page', 15);
        return response()->json($query->paginate($perPage));
    }

    /**
     * Store a newly created product
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'code' => 'required|string|unique:products,code',
            'name' => 'required|string|max:255',
            'description' => 'nullable|string',
            'base_unit' => 'required|string',
            'supported_units' => 'nullable|array',
            'is_active' => 'boolean',
        ]);

        $product = DB::transaction(function () use ($validated, $request) {
            return Product::create([
                ...$validated,
                'created_by' => $request->user()->id,
                'updated_by' => $request->user()->id,
            ]);
        });

        return response()->json($product->load(['creator', 'updater']), 201);
    }

    /**
     * Display the specified product
     */
    public function show($id)
    {
        $product = Product::with(['creator', 'updater', 'rates'])
            ->findOrFail($id);

        return response()->json($product);
    }

    /**
     * Update the specified product
     */
    public function update(Request $request, $id)
    {
        $product = Product::findOrFail($id);

        $validated = $request->validate([
            'code' => 'sometimes|required|string|unique:products,code,' . $id,
            'name' => 'sometimes|required|string|max:255',
            'description' => 'nullable|string',
            'base_unit' => 'sometimes|required|string',
            'supported_units' => 'nullable|array',
            'is_active' => 'boolean',
        ]);

        DB::transaction(function () use ($product, $validated, $request) {
            $product->update([
                ...$validated,
                'updated_by' => $request->user()->id,
            ]);
        });

        return response()->json($product->load(['creator', 'updater']));
    }

    /**
     * Remove the specified product
     */
    public function destroy($id)
    {
        $product = Product::findOrFail($id);

        if ($product->collections()->count() > 0) {
            return response()->json([
                'message' => 'Cannot delete product with existing collections.',
            ], 422);
        }

        $product->delete();

        return response()->json([
            'message' => 'Product deleted successfully',
        ]);
    }

    /**
     * Get current rates for a product
     */
    public function getCurrentRates($id, Request $request)
    {
        $product = Product::findOrFail($id);
        $date = $request->get('date', now()->toDateString());

        $rates = $product->rates()
            ->where('is_active', true)
            ->where('effective_from', '<=', $date)
            ->where(function ($query) use ($date) {
                $query->whereNull('effective_to')
                      ->orWhere('effective_to', '>=', $date);
            })
            ->get();

        return response()->json($rates);
    }

    /**
     * Add a new rate for a product
     */
    public function addRate(Request $request, $id)
    {
        $product = Product::findOrFail($id);

        $validated = $request->validate([
            'unit' => 'required|string',
            'rate' => 'required|numeric|min:0',
            'effective_from' => 'required|date',
            'effective_to' => 'nullable|date|after:effective_from',
        ]);

        $rate = DB::transaction(function () use ($product, $validated, $request) {
            // Check for overlapping rates
            $overlapping = $product->rates()
                ->where('unit', $validated['unit'])
                ->where('is_active', true)
                ->where(function ($query) use ($validated) {
                    $query->where(function ($q) use ($validated) {
                        $q->where('effective_from', '<=', $validated['effective_from'])
                          ->where(function ($sq) use ($validated) {
                              $sq->whereNull('effective_to')
                                 ->orWhere('effective_to', '>=', $validated['effective_from']);
                          });
                    });
                })
                ->exists();

            if ($overlapping) {
                throw new \Exception('Rate period overlaps with an existing rate.');
            }

            return ProductRate::create([
                'product_id' => $product->id,
                'unit' => $validated['unit'],
                'rate' => $validated['rate'],
                'effective_from' => $validated['effective_from'],
                'effective_to' => $validated['effective_to'] ?? null,
                'is_active' => true,
                'created_by' => $request->user()->id,
            ]);
        });

        return response()->json($rate, 201);
    }
}
