<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\SoftDeletes;

class Payment extends Model
{
    use HasFactory, SoftDeletes;

    protected $fillable = [
        'uuid',
        'payment_reference',
        'collection_id',
        'rate_id',
        'payer_id',
        'amount',
        'currency',
        'status',
        'payment_method',
        'notes',
        'payment_date',
        'processed_at',
        'is_automated',
        'metadata',
        'version',
        'created_by',
        'updated_by',
        'synced_at',
        'device_id',
        'idempotency_key',
    ];

    protected $casts = [
        'amount' => 'decimal:2',
        'is_automated' => 'boolean',
        'metadata' => 'json',
        'synced_at' => 'datetime',
        'payment_date' => 'datetime',
        'processed_at' => 'datetime',
    ];

    protected $hidden = [];

    /**
     * Get the collection this payment belongs to.
     */
    public function collection(): BelongsTo
    {
        return $this->belongsTo(Collection::class);
    }

    /**
     * Get the rate applied to this payment.
     */
    public function rate(): BelongsTo
    {
        return $this->belongsTo(Rate::class);
    }

    /**
     * Get the user who made this payment.
     */
    public function payer(): BelongsTo
    {
        return $this->belongsTo(User::class, 'payer_id');
    }

    /**
     * Get the user who created this payment.
     */
    public function creator(): BelongsTo
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    /**
     * Get the user who last updated this payment.
     */
    public function updater(): BelongsTo
    {
        return $this->belongsTo(User::class, 'updated_by');
    }

    /**
     * Check if a payment with this idempotency key already exists.
     */
    public function scopeByIdempotencyKey($query, string $key)
    {
        return $query->where('idempotency_key', $key);
    }

    /**
     * Get modified payments since a given timestamp.
     */
    public function scopeModifiedSince($query, ?\DateTime $timestamp)
    {
        if ($timestamp) {
            return $query->where('updated_at', '>=', $timestamp);
        }
        return $query;
    }

    /**
     * Get payments for a specific collection.
     */
    public function scopeForCollection($query, $collectionId)
    {
        return $query->where('collection_id', $collectionId);
    }
}
