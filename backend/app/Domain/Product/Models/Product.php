<?php

namespace App\Domain\Product\Models;

use App\Domain\Shared\BaseModel;
use App\Domain\User\Models\User;
use App\Domain\Collection\Models\Collection;

class Product extends BaseModel
{
    protected $fillable = [
        'code',
        'name',
        'description',
        'category',
        'primary_unit',
        'supported_units',
        'is_active',
        'created_by',
        'client_id',
        'version',
        'synced_at',
        'is_dirty',
        'sync_status',
    ];

    protected $casts = [
        'supported_units' => 'array',
        'is_active' => 'boolean',
        'is_dirty' => 'boolean',
        'version' => 'integer',
        'synced_at' => 'datetime',
        'created_at' => 'datetime',
        'updated_at' => 'datetime',
        'deleted_at' => 'datetime',
    ];

    // Relationships
    public function creator()
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    public function rates()
    {
        return $this->hasMany(ProductRate::class)->orderBy('effective_from', 'desc');
    }

    public function currentRate()
    {
        return $this->hasOne(ProductRate::class)->where('is_current', true);
    }

    public function collections()
    {
        return $this->hasMany(Collection::class);
    }

    // Business logic
    public function getActiveRate(): ?ProductRate
    {
        return $this->rates()
            ->where('effective_from', '<=', now()->toDateString())
            ->where(function ($query) {
                $query->whereNull('effective_to')
                    ->orWhere('effective_to', '>=', now()->toDateString());
            })
            ->orderBy('effective_from', 'desc')
            ->first();
    }

    public function getRateAtDate(string $date): ?ProductRate
    {
        return $this->rates()
            ->where('effective_from', '<=', $date)
            ->where(function ($query) use ($date) {
                $query->whereNull('effective_to')
                    ->orWhere('effective_to', '>=', $date);
            })
            ->orderBy('effective_from', 'desc')
            ->first();
    }

    public function convertToUnit(float $quantity, string $fromUnit, string $toUnit): float
    {
        if ($fromUnit === $toUnit) {
            return $quantity;
        }

        $units = $this->supported_units ?? [];
        
        // Find conversion factors
        $fromFactor = $this->getConversionFactor($fromUnit, $units);
        $toFactor = $this->getConversionFactor($toUnit, $units);

        if ($fromFactor === null || $toFactor === null) {
            throw new \InvalidArgumentException("Invalid unit conversion: {$fromUnit} to {$toUnit}");
        }

        // Convert to primary unit first, then to target unit
        return ($quantity * $fromFactor) / $toFactor;
    }

    protected function getConversionFactor(string $unit, array $units): ?float
    {
        if ($unit === $this->primary_unit) {
            return 1.0;
        }

        foreach ($units as $unitDef) {
            if ($unitDef['unit'] === $unit) {
                return $unitDef['factor'];
            }
        }

        return null;
    }

    // Scopes
    public function scopeActive($query)
    {
        return $query->where('is_active', true);
    }

    public function scopeInCategory($query, string $category)
    {
        return $query->where('category', $category);
    }

    public function scopeWithCurrentRate($query)
    {
        return $query->with(['currentRate']);
    }

    // Auto-generate code
    protected static function boot()
    {
        parent::boot();

        static::creating(function ($product) {
            if (empty($product->code)) {
                $product->code = self::generateProductCode();
            }
            
            // Set default supported units if not provided
            if (empty($product->supported_units)) {
                $product->supported_units = self::getDefaultUnitsForPrimaryUnit($product->primary_unit);
            }
        });
    }

    protected static function generateProductCode(): string
    {
        $lastProduct = self::withTrashed()
            ->orderBy('created_at', 'desc')
            ->first();

        $lastNumber = 0;
        if ($lastProduct && preg_match('/PRD-(\d+)/', $lastProduct->code, $matches)) {
            $lastNumber = (int) $matches[1];
        }

        return 'PRD-' . str_pad($lastNumber + 1, 6, '0', STR_PAD_LEFT);
    }

    protected static function getDefaultUnitsForPrimaryUnit(string $primaryUnit): array
    {
        return match($primaryUnit) {
            'kg' => [
                ['unit' => 'g', 'factor' => 0.001],
                ['unit' => 'ton', 'factor' => 1000],
            ],
            'liter' => [
                ['unit' => 'ml', 'factor' => 0.001],
            ],
            default => [],
        };
    }
}
