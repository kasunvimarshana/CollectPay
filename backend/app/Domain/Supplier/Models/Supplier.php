<?php

namespace App\Domain\Supplier\Models;

use App\Domain\Shared\BaseModel;
use App\Domain\User\Models\User;
use App\Domain\Collection\Models\Collection;
use App\Domain\Payment\Models\Payment;

class Supplier extends BaseModel
{
    protected $fillable = [
        'code',
        'name',
        'contact_person',
        'phone',
        'email',
        'address',
        'region',
        'district',
        'latitude',
        'longitude',
        'payment_method',
        'bank_name',
        'bank_account',
        'mobile_money_number',
        'notes',
        'is_active',
        'created_by',
        'client_id',
        'version',
        'synced_at',
        'is_dirty',
        'sync_status',
    ];

    protected $casts = [
        'latitude' => 'decimal:8',
        'longitude' => 'decimal:8',
        'is_active' => 'boolean',
        'is_dirty' => 'boolean',
        'version' => 'integer',
        'synced_at' => 'datetime',
        'created_at' => 'datetime',
        'updated_at' => 'datetime',
        'deleted_at' => 'datetime',
    ];

    // Encrypted at rest
    public function getEncryptedAttributes(): array
    {
        return ['bank_account', 'mobile_money_number'];
    }

    // Relationships
    public function creator()
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    public function collections()
    {
        return $this->hasMany(Collection::class);
    }

    public function payments()
    {
        return $this->hasMany(Payment::class);
    }

    // Accessors
    public function getFullAddressAttribute(): string
    {
        $parts = array_filter([
            $this->address,
            $this->district,
            $this->region,
        ]);
        return implode(', ', $parts);
    }

    // Business logic
    public function getTotalCollectionsAmount(
        ?string $startDate = null,
        ?string $endDate = null
    ): float {
        $query = $this->collections()
            ->where('status', 'confirmed');

        if ($startDate) {
            $query->where('collection_date', '>=', $startDate);
        }
        if ($endDate) {
            $query->where('collection_date', '<=', $endDate);
        }

        return (float) $query->sum('net_amount');
    }

    public function getTotalPaymentsAmount(
        ?string $startDate = null,
        ?string $endDate = null
    ): float {
        $query = $this->payments()
            ->whereIn('status', ['approved', 'completed']);

        if ($startDate) {
            $query->where('payment_date', '>=', $startDate);
        }
        if ($endDate) {
            $query->where('payment_date', '<=', $endDate);
        }

        return (float) $query->sum('amount');
    }

    public function getBalanceDue(
        ?string $startDate = null,
        ?string $endDate = null
    ): float {
        $totalCollections = $this->getTotalCollectionsAmount($startDate, $endDate);
        $totalPayments = $this->getTotalPaymentsAmount($startDate, $endDate);
        return $totalCollections - $totalPayments;
    }

    // Scopes
    public function scopeActive($query)
    {
        return $query->where('is_active', true);
    }

    public function scopeInRegion($query, string $region)
    {
        return $query->where('region', $region);
    }

    public function scopeWithBalance($query)
    {
        return $query->withSum(['collections as total_collections' => function ($q) {
            $q->where('status', 'confirmed');
        }], 'net_amount')
        ->withSum(['payments as total_payments' => function ($q) {
            $q->whereIn('status', ['approved', 'completed']);
        }], 'amount');
    }

    // Auto-generate code
    protected static function boot()
    {
        parent::boot();

        static::creating(function ($supplier) {
            if (empty($supplier->code)) {
                $supplier->code = self::generateSupplierCode();
            }
        });
    }

    protected static function generateSupplierCode(): string
    {
        $lastSupplier = self::withTrashed()
            ->orderBy('created_at', 'desc')
            ->first();

        $lastNumber = 0;
        if ($lastSupplier && preg_match('/SUP-(\d+)/', $lastSupplier->code, $matches)) {
            $lastNumber = (int) $matches[1];
        }

        return 'SUP-' . str_pad($lastNumber + 1, 6, '0', STR_PAD_LEFT);
    }
}
