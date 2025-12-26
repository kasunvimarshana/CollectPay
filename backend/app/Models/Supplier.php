<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Support\Str;

class Supplier extends Model
{
    use HasFactory, SoftDeletes;

    protected $fillable = [
        'uuid',
        'name',
        'code',
        'phone',
        'email',
        'address',
        'region',
        'id_number',
        'credit_limit',
        'is_active',
        'metadata',
        'created_by',
        'updated_by',
    ];

    protected $casts = [
        'credit_limit' => 'decimal:2',
        'is_active' => 'boolean',
        'metadata' => 'array',
    ];

    protected static function boot()
    {
        parent::boot();
        
        static::creating(function ($supplier) {
            if (empty($supplier->uuid)) {
                $supplier->uuid = (string) Str::uuid();
            }
        });

        static::saving(function ($supplier) {
            $supplier->version++;
        });
    }

    public function creator()
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    public function updater()
    {
        return $this->belongsTo(User::class, 'updated_by');
    }

    public function collections()
    {
        return $this->hasMany(Collection::class);
    }

    public function payments()
    {
        return $this->hasMany(Payment::class);
    }

    public function rates()
    {
        return $this->hasMany(Rate::class);
    }

    public function calculateBalance($from = null, $to = null)
    {
        $query = $this->collections();
        
        if ($from) {
            $query->where('collected_at', '>=', $from);
        }
        if ($to) {
            $query->where('collected_at', '<=', $to);
        }
        
        $totalCollections = $query->sum('total_value');

        $paymentQuery = $this->payments()->where('status', 'completed');
        
        if ($from) {
            $paymentQuery->where('payment_date', '>=', $from);
        }
        if ($to) {
            $paymentQuery->where('payment_date', '<=', $to);
        }
        
        $totalPayments = $paymentQuery->sum('amount');

        return $totalCollections - $totalPayments;
    }
}
