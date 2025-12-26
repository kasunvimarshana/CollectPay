<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Rate extends Model
{
    use HasFactory, SoftDeletes;

    protected $fillable = [
        'product_id',
        'supplier_id',
        'rate',
        'effective_from',
        'effective_to',
        'is_active',
        'applied_scope',
        'notes',
        'created_by',
        'updated_by',
        'version',
    ];

    protected $casts = [
        'rate' => 'decimal:2',
        'effective_from' => 'date',
        'effective_to' => 'date',
        'is_active' => 'boolean',
        'created_at' => 'datetime',
        'updated_at' => 'datetime',
        'deleted_at' => 'datetime',
    ];

    protected $hidden = [
        'deleted_at',
    ];

    public function product(): BelongsTo
    {
        return $this->belongsTo(Product::class);
    }

    public function supplier(): BelongsTo
    {
        return $this->belongsTo(Supplier::class);
    }

    public function creator(): BelongsTo
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    public function updater(): BelongsTo
    {
        return $this->belongsTo(User::class, 'updated_by');
    }

    public function collections()
    {
        return $this->hasMany(Collection::class);
    }

    /**
     * Get the applicable rate for a specific date, product, and optionally supplier
     */
    public static function getApplicableRate(int $productId, string $date, ?int $supplierId = null): ?self
    {
        $query = static::where('product_id', $productId)
            ->where('is_active', true)
            ->where('effective_from', '<=', $date)
            ->where(function ($q) use ($date) {
                $q->whereNull('effective_to')
                    ->orWhere('effective_to', '>=', $date);
            });

        // Check for supplier-specific rate first
        if ($supplierId) {
            $supplierRate = (clone $query)
                ->where('supplier_id', $supplierId)
                ->where('applied_scope', 'supplier_specific')
                ->orderBy('effective_from', 'desc')
                ->first();

            if ($supplierRate) {
                return $supplierRate;
            }
        }

        // Fall back to general rate
        return $query
            ->where('applied_scope', 'general')
            ->whereNull('supplier_id')
            ->orderBy('effective_from', 'desc')
            ->first();
    }

    protected static function boot()
    {
        parent::boot();

        static::creating(function ($model) {
            if (auth()->check()) {
                $model->created_by = auth()->id();
            }
        });

        static::updating(function ($model) {
            if (auth()->check()) {
                $model->updated_by = auth()->id();
            }
            $model->version++;
        });
    }
}
