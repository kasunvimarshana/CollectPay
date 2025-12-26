<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Support\Str;

class Supplier extends Model
{
    use HasFactory, SoftDeletes;

    protected $fillable = [
        'uuid',
        'name',
        'contact_person',
        'phone',
        'email',
        'address',
        'registration_number',
        'metadata',
        'is_active',
        'created_by',
        'updated_by',
        'version',
    ];

    protected $casts = [
        'metadata' => 'array',
        'is_active' => 'boolean',
        'version' => 'integer',
    ];

    protected $hidden = [
        'deleted_at',
    ];

    protected static function boot()
    {
        parent::boot();

        static::creating(function ($model) {
            if (empty($model->uuid)) {
                $model->uuid = (string) Str::uuid();
            }
        });

        static::updating(function ($model) {
            $model->version++;
        });
    }

    // Relationships
    public function products()
    {
        return $this->belongsToMany(Product::class, 'rates')
            ->withPivot(['rate', 'effective_from', 'effective_to', 'is_active'])
            ->withTimestamps();
    }

    public function rates()
    {
        return $this->hasMany(Rate::class);
    }

    public function collections()
    {
        return $this->hasMany(Collection::class);
    }

    public function payments()
    {
        return $this->hasMany(Payment::class);
    }

    public function creator()
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    public function updater()
    {
        return $this->belongsTo(User::class, 'updated_by');
    }

    // Scopes
    public function scopeActive($query)
    {
        return $query->where('is_active', true);
    }

    // Helpers
    public function getTotalCollections($startDate = null, $endDate = null)
    {
        $query = $this->collections();
        
        if ($startDate) {
            $query->where('collection_date', '>=', $startDate);
        }
        
        if ($endDate) {
            $query->where('collection_date', '<=', $endDate);
        }
        
        return $query->sum('total_amount');
    }

    public function getTotalPayments($startDate = null, $endDate = null)
    {
        $query = $this->payments();
        
        if ($startDate) {
            $query->where('payment_date', '>=', $startDate);
        }
        
        if ($endDate) {
            $query->where('payment_date', '<=', $endDate);
        }
        
        return $query->sum('amount');
    }

    public function getBalance($startDate = null, $endDate = null)
    {
        return $this->getTotalCollections($startDate, $endDate) - 
               $this->getTotalPayments($startDate, $endDate);
    }
}
