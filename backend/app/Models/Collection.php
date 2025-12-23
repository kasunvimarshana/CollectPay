<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Support\Str;

class Collection extends Model
{
    use SoftDeletes;

    protected $fillable = [
        'uuid',
        'collection_number',
        'supplier_id',
        'collected_by',
        'collected_at',
        'notes',
        'status',
        'total_amount',
        'metadata',
        'synced_at',
        'device_id',
        'version',
        'client_created_at',
        'conflict_status',
        'conflict_data',
    ];

    protected function casts(): array
    {
        return [
            'collected_at' => 'datetime',
            'total_amount' => 'decimal:2',
            'metadata' => 'array',
            'synced_at' => 'datetime',
            'client_created_at' => 'datetime',
            'conflict_data' => 'array',
            'deleted_at' => 'datetime',
        ];
    }

    protected static function boot()
    {
        parent::boot();
        
        static::creating(function ($model) {
            if (empty($model->uuid)) {
                $model->uuid = (string) Str::uuid();
            }
            
            if (empty($model->collection_number)) {
                $model->collection_number = 'COL-' . date('Ymd') . '-' . str_pad(
                    static::whereDate('created_at', today())->count() + 1,
                    5,
                    '0',
                    STR_PAD_LEFT
                );
            }

            if (empty($model->version)) {
                $model->version = 1;
            }

            if (empty($model->collected_at)) {
                $model->collected_at = now();
            }
        });

        static::updating(function ($model) {
            $model->version++;
        });

        // Recalculate total when items change
        static::saved(function ($model) {
            $model->recalculateTotal();
        });
    }

    /**
     * Get the supplier for this collection.
     */
    public function supplier(): BelongsTo
    {
        return $this->belongsTo(Supplier::class);
    }

    /**
     * Get the user who collected this.
     */
    public function collector(): BelongsTo
    {
        return $this->belongsTo(User::class, 'collected_by');
    }

    /**
     * Get the items for this collection.
     */
    public function items(): HasMany
    {
        return $this->hasMany(CollectionItem::class);
    }

    /**
     * Recalculate total amount from items
     */
    public function recalculateTotal(): void
    {
        $total = $this->items()->sum('amount');
        if ($this->total_amount != $total) {
            $this->update(['total_amount' => $total]);
        }
    }

    /**
     * Create transaction entry when collection is confirmed
     */
    public function createTransaction(): void
    {
        if ($this->status === 'confirmed' && !$this->transactions()->exists()) {
            PaymentTransaction::create([
                'uuid' => (string) Str::uuid(),
                'supplier_id' => $this->supplier_id,
                'collection_id' => $this->id,
                'type' => 'debit',
                'amount' => $this->total_amount,
                'balance' => $this->supplier->balance,
                'transaction_date' => $this->collected_at,
                'description' => "Collection #{$this->collection_number}",
            ]);
        }
    }

    /**
     * Get transactions related to this collection
     */
    public function transactions(): HasMany
    {
        return $this->hasMany(PaymentTransaction::class);
    }
}
