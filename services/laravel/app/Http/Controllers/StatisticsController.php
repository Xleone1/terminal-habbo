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
        $totalAdmins = User::where('role', 'admin')->count();
        $totalRooms = Room::count();
        $activeRooms = Room::where('current_users', '>', 0)->count();
        
        // Calculate total players online (sum of current users in all rooms)
        $totalOnline = Room::sum('current_users');
        
        // Get last 10 connected users (most recent by updated_at)
        $recentUsers = User::orderBy('updated_at', 'desc')
            ->limit(10)
            ->select('id', 'username', 'role', 'created_at')
            ->get();

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
