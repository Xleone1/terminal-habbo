<?php

namespace App\Models;

use Database\Factories\UserFactory;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Attributes\Hidden;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;
use Laravel\Sanctum\HasApiTokens;
use Carbon\Carbon;

#[Fillable(['username', 'password', 'mail', 'motto', 'look', 'gender', 'rank', 'credits', 'pixels', 'points', 'online', 'ip_register', 'ip_current', 'home_room', 'account_created'])]
#[Hidden(['password', 'auth_ticket', 'secret_key', 'pincode', 'machine_id', 'remember_token_hash'])]
class User extends Authenticatable
{
    use HasApiTokens, HasFactory, Notifiable;

    protected $keyType = 'int';
    public $incrementing = true;

    protected function casts(): array
    {
        return [
            'password' => 'hashed',
        ];
    }

    /**
     * Computed role from rank for backward compatibility.
     */
    public function getRoleAttribute(): string
    {
        return $this->rank >= 7 ? 'admin' : 'user';
    }

    /**
     * Check if user is admin.
     */
    public function isAdmin(): bool
    {
        return $this->rank >= 7;
    }

    /**
     * Check if user is online.
     */
    public function isOnline(): bool
    {
        return $this->online !== '0';
    }

    /**
     * Convert unix timestamp to Carbon for account_created.
     */
    public function getAccountCreatedAtAttribute($value)
    {
        return $value ? Carbon::createFromTimestamp($value) : null;
    }

    /**
     * Convert unix timestamp to Carbon for last_login.
     */
    public function getLastLoginAttribute($value)
    {
        return $value ? Carbon::createFromTimestamp($value) : null;
    }

    /**
     * Generate SSO ticket for game login.
     */
    public function generateSsoTicket(): string
    {
        $ticket = Str::random(64);
        $this->auth_ticket = $ticket;
        $this->auth_ticket_expires_at = now()->addSeconds(30);
        $this->save();
        return $ticket;
    }

    public function rooms()
    {
        return $this->hasMany(Room::class, 'owner_id');
    }

    public function inventory()
    {
        return $this->hasMany(InventoryItem::class);
    }
}
