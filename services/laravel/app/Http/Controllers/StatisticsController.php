<?php

namespace App\Http\Controllers;

use App\Models\Room;
use App\Models\User;
use Illuminate\Http\JsonResponse;

class StatisticsController extends Controller
{
    /**
     * Get server statistics including online players, rooms, and users.
     */
    public function getStats(): JsonResponse
    {
        $totalUsers = User::count();
        $totalAdmins = User::where('rank', '>=', 7)->count();
        $totalRooms = Room::count();
        $activeRooms = Room::where('users', '>', 0)->count();

        // Arcturus tracks online status per user
        $totalOnline = User::where('online', '!=', '0')->count();

        // Get last 10 registered users by account_created (unix timestamp)
        $recentUsers = User::orderBy('account_created', 'desc')
            ->limit(10)
            ->select('id', 'username', 'rank', 'account_created')
            ->get()
            ->map(function ($user) {
                return [
                    'id' => $user->id,
                    'username' => $user->username,
                    'role' => $user->rank >= 7 ? 'admin' : 'user',
                    'created_at' => \Carbon\Carbon::createFromTimestamp($user->account_created)->toIso8601String(),
                ];
            });

        return response()->json([
            'stats' => [
                'total_users' => $totalUsers,
                'total_admins' => $totalAdmins,
                'players_online' => $totalOnline,
                'total_rooms' => $totalRooms,
                'active_rooms' => $activeRooms,
            ],
            'recent_users' => $recentUsers,
            'timestamp' => now(),
        ]);
    }
}
