<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Post extends Model
{
    protected $fillable = [
        'type',
        'title',
        'content',
        'excerpt',
        'author',
        'published_at',
    ];

    protected $casts = [
        'published_at' => 'datetime',
    ];
}
