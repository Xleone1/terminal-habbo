<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Item extends Model
{
    use HasFactory;

    protected $keyType = 'int';
    public $incrementing = true;
    protected $timestamps = false;

    protected $fillable = [
        'user_id',
        'room_id',
        'item_id',
        'wall_pos',
        'x',
        'y',
        'z',
        'rot',
        'extra_data',
        'wired_data',
        'limited_data',
        'guild_id',
    ];

    protected $casts = [
        'z' => 'float',
    ];
}
