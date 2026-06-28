<?php

namespace App\Http\Controllers;

use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class UserController extends Controller
{
    public function profile(Request $request): JsonResponse
    {
        $user = $request->user();

        return response()->json([
            'user' => [
                'id' => $user->id,
                'username' => $user->username,
                'role' => $user->role,
                'motto' => $user->motto,
                'look' => $user->look,
                'credits' => $user->credits,
                'pixels' => $user->pixels,
                'created_at' => $user->account_created,
            ],
        ]);
    }

    public function inventory(Request $request): JsonResponse
    {
        $user = $request->user();
        $inventory = $user->inventory()->get();

        return response()->json([
            'inventory' => $inventory,
        ]);
    }

    public function rooms(Request $request): JsonResponse
    {
        $user = $request->user();
        $rooms = $user->rooms()
            ->select('id', 'name', 'description', 'users_max', 'users', 'is_public', 'state')
            ->get()
            ->map(function ($room) {
                return [
                    'id' => $room->id,
                    'name' => $room->name,
                    'description' => $room->description,
                    'capacity' => $room->users_max,
                    'current_users' => $room->users,
                    'is_public' => $room->is_public === '1',
                    'state' => $room->state,
                ];
            });

        return response()->json([
            'rooms' => $rooms,
        ]);
    }
}
