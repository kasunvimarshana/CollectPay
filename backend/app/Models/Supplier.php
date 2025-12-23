<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Supplier extends Model
{
    use HasFactory, SoftDeletes;

    protected $fillable = [
        'code',
        'name',
        'address',
        'phone',
        'email',
        'credit_limit',
        'current_balance',
        'metadata',
        'is_active',
        'created_by',
        'updated_by',
        'last_sync_at',
        'version',
    ];

    protected $casts = [
        'metadata' => 'array',
        'is_active' => 'boolean',
        'credit_limit' => 'decimal:2',
        'current_balance' => 'decimal:2',
        'last_sync_at' => 'datetime',
        'version' => 'integer',
    ];

    protected $hidden = [
        'deleted_at',
    ];

    // Relationships
    public function collections(): HasMany
    {
        return $this->hasMany(Collection::class);
    }

    public function payments(): HasMany
    {
        return $this->hasMany(Payment::class);
    }

    public function rates(): HasMany
    {
        return $this->hasMany(Rate::class);
    }

    public function creator(): BelongsTo
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    public function updater(): BelongsTo
    {
        return $this->belongsTo(User::class, 'updated_by');
    }

    // Business Logic
    public function updateBalance(float $amount): void
    {
        $this->current_balance = bcadd($this->current_balance, $amount, 2);
        $this->save();
    }

    public function calculateBalance(): float
    {
        $totalCollections = $this->collections()
            ->where('sync_status', 'synced')
            ->sum('amount');
            
        $totalPayments = $this->payments()
            ->where('sync_status', 'synced')
            ->sum('amount');
            
        return bcsub($totalCollections, $totalPayments, 2);
    }

    // Version control for optimistic locking
    protected static function boot()
    {
        parent::boot();

        static::saving(function ($model) {
            if ($model->isDirty() && !$model->wasRecentlyCreated) {
                $model->version++;
            }
        });
    }
}
