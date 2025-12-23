<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Support\Str;

class Payment extends Model
{
    use SoftDeletes;

    protected $fillable = [
        'uuid',
        'payment_number',
        'supplier_id',
        'collection_id',
        'type',
        'amount',
        'payment_date',
        'payment_method',
        'reference_number',
        'notes',
        'status',
        'processed_by',
        'synced_at',
        'device_id',
        'version',
        'client_created_at',
    ];

    protected function casts(): array
    {
        return [
            'amount' => 'decimal:2',
            'payment_date' => 'datetime',
            'synced_at' => 'datetime',
            'client_created_at' => 'datetime',
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
            
            if (empty($model->payment_number)) {
                $model->payment_number = 'PAY-' . date('Ymd') . '-' . str_pad(
                    static::whereDate('created_at', today())->count() + 1,
                    5,
                    '0',
                    STR_PAD_LEFT
                );
            }

            if (empty($model->version)) {
                $model->version = 1;
            }

            if (empty($model->payment_date)) {
                $model->payment_date = now();
            }
        });

        static::updating(function ($model) {
            $model->version++;
        });

        // Create transaction when payment is confirmed
        static::saved(function ($model) {
            if ($model->status === 'confirmed') {
                $model->createTransaction();
            }
        });
    }

    /**
     * Get the supplier for this payment.
     */
    public function supplier(): BelongsTo
    {
        return $this->belongsTo(Supplier::class);
    }

    /**
     * Get the collection related to this payment.
     */
    public function collection(): BelongsTo
    {
        return $this->belongsTo(Collection::class);
    }

    /**
     * Get the user who processed this payment.
     */
    public function processor(): BelongsTo
    {
        return $this->belongsTo(User::class, 'processed_by');
    }

    /**
     * Get transactions for this payment
     */
    public function transactions(): HasMany
    {
        return $this->hasMany(PaymentTransaction::class);
    }

    /**
     * Create transaction entry for this payment
     */
    public function createTransaction(): void
    {
        if (!$this->transactions()->exists()) {
            $balance = $this->supplier->balance;
            
            PaymentTransaction::create([
                'uuid' => (string) Str::uuid(),
                'supplier_id' => $this->supplier_id,
                'payment_id' => $this->id,
                'collection_id' => $this->collection_id,
                'type' => 'credit',
                'amount' => $this->amount,
                'balance' => $balance,
                'transaction_date' => $this->payment_date,
                'description' => "Payment #{$this->payment_number} - {$this->type}",
            ]);
        }
    }
}
