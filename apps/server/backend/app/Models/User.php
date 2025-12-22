<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Sanctum\HasApiTokens;
use Illuminate\Database\Eloquent\SoftDeletes;

class User extends Authenticatable
{
    use HasApiTokens, HasFactory, Notifiable, SoftDeletes;

    public $incrementing = false;
    protected $keyType = 'string';

    protected $fillable = [
        'id', 'name', 'email', 'password', 'role', 'attributes', 'version'
    ];

    protected $casts = [
        'email_verified_at' => 'datetime',
        'attributes' => 'array',
        'version' => 'integer',
    ];

    protected $hidden = [
        'password', 'remember_token'
    ];
}
