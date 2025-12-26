<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Str;
use App\Models\RateVersion;
use App\Models\Collection;

class RateVersionController extends Controller
{
    public function index(Request $request)
    {
        $query = RateVersion::with(['product', 'user'])
            ->whereNull('deleted_at')
            ->orderBy('effective_from', 'desc');

        // Optional filters
        if ($request->has('product_id')) {
            $query->where('product_id', $request->product_id);
        }

        // Filter for active rates only
        if ($request->has('active_only') && $request->active_only) {
            $now = now();
            $query->where('effective_from', '<=', $now)
                ->where(function ($q) use ($now) {
                    $q->whereNull('effective_to')
                        ->orWhere('effective_to', '>=', $now);
                });
        }

        $rateVersions = $query->paginate(50);

        return $this->successResponse($rateVersions);
    }

    public function show($id)
    {
        $rateVersion = RateVersion::with(['product', 'user'])
            ->whereNull('deleted_at')
            ->find($id);

        if (!$rateVersion) {
            return $this->errorResponse('Rate version not found', null, 404);
        }

        return $this->successResponse($rateVersion);
    }

    /**
     * Get the active rate for a product at a specific date
     */
    public function getActiveRate(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'product_id' => 'required|uuid|exists:products,id',
            'date' => 'nullable|date',
        ]);

        if ($validator->fails()) {
            return $this->errorResponse('Validation failed', $validator->errors(), 422);
        }

        $date = $request->date ?? now();

        $rateVersion = RateVersion::where('product_id', $request->product_id)
            ->where('effective_from', '<=', $date)
            ->where(function ($query) use ($date) {
                $query->whereNull('effective_to')
                    ->orWhere('effective_to', '>=', $date);
            })
            ->orderBy('effective_from', 'desc')
            ->first();

        if (!$rateVersion) {
            return $this->errorResponse('No active rate found for this product', null, 404);
        }

        return $this->successResponse($rateVersion);
    }

    public function store(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'product_id' => 'required|uuid|exists:products,id',
            'rate' => 'required|numeric|min:0',
            'effective_from' => 'required|date',
            'effective_to' => 'nullable|date|after:effective_from',
        ]);

        if ($validator->fails()) {
            return $this->errorResponse('Validation failed', $validator->errors(), 422);
        }

        // Check for overlapping rate periods
        $overlapping = RateVersion::where('product_id', $request->product_id)
            ->whereNull('deleted_at')
            ->where(function ($query) use ($request) {
                $query->where(function ($q) use ($request) {
                    // New rate starts during an existing period
                    $q->where('effective_from', '<=', $request->effective_from)
                        ->where(function ($qq) use ($request) {
                            $qq->whereNull('effective_to')
                                ->orWhere('effective_to', '>=', $request->effective_from);
                        });
                })
                ->orWhere(function ($q) use ($request) {
                    // New rate ends during an existing period
                    if ($request->effective_to) {
                        $q->where('effective_from', '<=', $request->effective_to)
                            ->where(function ($qq) use ($request) {
                                $qq->whereNull('effective_to')
                                    ->orWhere('effective_to', '>=', $request->effective_to);
                            });
                    }
                });
            })
            ->exists();

        if ($overlapping) {
            return $this->errorResponse(
                'Rate period overlaps with existing rate version',
                ['effective_from' => ['This date range conflicts with an existing rate']],
                422
            );
        }

        $rateVersion = RateVersion::create([
            'id' => (string) Str::uuid(),
            'product_id' => $request->product_id,
            'rate' => $request->rate,
            'effective_from' => $request->effective_from,
            'effective_to' => $request->effective_to,
            'user_id' => $request->user()->id,
            'version' => 1,
        ]);

        return $this->successResponse(
            $rateVersion->load(['product', 'user']),
            'Rate version created successfully',
            201
        );
    }

    public function update(Request $request, $id)
    {
        $rateVersion = RateVersion::whereNull('deleted_at')->find($id);

        if (!$rateVersion) {
            return $this->errorResponse('Rate version not found', null, 404);
        }

        // Check if this rate is used in any collections
        $usedInCollections = Collection::where('rate_version_id', $id)->exists();
        
        if ($usedInCollections && $request->has('rate')) {
            return $this->errorResponse(
                'Cannot modify rate value as it is already used in collections',
                ['rate' => ['This rate is referenced by existing collections and cannot be changed']],
                422
            );
        }

        $validator = Validator::make($request->all(), [
            'rate' => 'sometimes|required|numeric|min:0',
            'effective_from' => 'sometimes|required|date',
            'effective_to' => 'nullable|date|after:effective_from',
            'version' => 'required|integer',
        ]);

        if ($validator->fails()) {
            return $this->errorResponse('Validation failed', $validator->errors(), 422);
        }

        // Version check for optimistic locking
        if ($request->version !== $rateVersion->version) {
            return $this->errorResponse(
                'Version conflict detected',
                ['version' => ['Server version is ' . $rateVersion->version]],
                409
            );
        }

        // Check for overlapping periods if dates are being updated
        if ($request->has('effective_from') || $request->has('effective_to')) {
            $effectiveFrom = $request->effective_from ?? $rateVersion->effective_from;
            $effectiveTo = $request->effective_to ?? $rateVersion->effective_to;

            $overlapping = RateVersion::where('product_id', $rateVersion->product_id)
                ->where('id', '!=', $id)
                ->whereNull('deleted_at')
                ->where(function ($query) use ($effectiveFrom, $effectiveTo) {
                    $query->where(function ($q) use ($effectiveFrom) {
                        $q->where('effective_from', '<=', $effectiveFrom)
                            ->where(function ($qq) use ($effectiveFrom) {
                                $qq->whereNull('effective_to')
                                    ->orWhere('effective_to', '>=', $effectiveFrom);
                            });
                    })
                    ->orWhere(function ($q) use ($effectiveTo) {
                        if ($effectiveTo) {
                            $q->where('effective_from', '<=', $effectiveTo)
                                ->where(function ($qq) use ($effectiveTo) {
                                    $qq->whereNull('effective_to')
                                        ->orWhere('effective_to', '>=', $effectiveTo);
                                });
                        }
                    });
                })
                ->exists();

            if ($overlapping) {
                return $this->errorResponse(
                    'Rate period overlaps with existing rate version',
                    ['effective_from' => ['This date range conflicts with an existing rate']],
                    422
                );
            }
        }

        $rateVersion->update([
            'rate' => $request->rate ?? $rateVersion->rate,
            'effective_from' => $request->effective_from ?? $rateVersion->effective_from,
            'effective_to' => $request->effective_to ?? $rateVersion->effective_to,
            'version' => $rateVersion->version + 1,
        ]);

        return $this->successResponse(
            $rateVersion->load(['product', 'user']),
            'Rate version updated successfully'
        );
    }

    public function destroy($id)
    {
        $rateVersion = RateVersion::whereNull('deleted_at')->find($id);

        if (!$rateVersion) {
            return $this->errorResponse('Rate version not found', null, 404);
        }

        // Check if this rate is used in any collections
        $usedInCollections = Collection::where('rate_version_id', $id)->exists();
        
        if ($usedInCollections) {
            return $this->errorResponse(
                'Cannot delete rate version as it is used in collections',
                ['id' => ['This rate is referenced by existing collections']],
                422
            );
        }

        $rateVersion->update([
            'deleted_at' => now(),
            'version' => $rateVersion->version + 1,
        ]);

        return $this->successResponse(null, 'Rate version deleted successfully');
    }
}
