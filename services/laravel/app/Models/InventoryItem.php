<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class InventoryItem extends Model
{
    use HasFactory;

    protected $table = 'inventory';

    protected $fillable = [
        'user_id',
        'item_id',
        'quantity',
    ];

    /**
     * Get the user who owns this inventory item.
     */
    public function user()
    {
        return $this->belongsTo(User::class);
    }

    /**
     * Get the item details.
     */
    public function item()
    {
        return $this->belongsTo(Item::class);
    }
}
