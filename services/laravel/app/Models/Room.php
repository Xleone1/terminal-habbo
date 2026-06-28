<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Room extends Model
{
    use HasFactory;

    protected $keyType = 'int';
    public $incrementing = true;
    protected $timestamps = false;

    protected $fillable = [
        'owner_id',
        'owner_name',
        'name',
        'description',
        'model',
        'state',
        'users',
        'users_max',
        'guild_id',
        'category',
        'is_public',
    ];

    public function owner()
    {
        return $this->belongsTo(User::class, 'owner_id');
    }

    public function getCapacityAttribute(): int
    {
        return $this->users_max;
    }

    public function getCurrentUsersAttribute(): int
    {
        return $this->users;
    }

    public function getIsPublicAttribute(): bool
    {
        return $this->attributes['is_public'] === '1';
    }
}
