<?php

namespace App\Http\Controllers;

use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class UserController extends Controller
{
    /**
     * Get current user's profile.
     */
    public function profile(Request $request): JsonResponse
    {
        $user = $request->user();

        return response()->json([
            'user' => [
                'id' => $user->id,
                'username' => $user->username,
                'role' => $user->role,
                'created_at' => $user->created_at,
            ],
        ]);
    }

    /**
     * Get current user's inventory.
     */
    public function inventory(Request $request): JsonResponse
    {
        $user = $request->user();
        $inventory = $user->inventory()
            ->with('item')
            ->get()
            ->map(function ($inventoryItem) {
                return [
                    'id' => $inventoryItem->id,
                    'item' => [
                        'id' => $inventoryItem->item->id,
                        'name' => $inventoryItem->item->name,
                        'description' => $inventoryItem->item->description,
                        'type' => $inventoryItem->item->type,
                    ],
                    'quantity' => $inventoryItem->quantity,
                ];
            });

        return response()->json([
            'inventory' => $inventory,
        ]);
    }

    /**
     * Get current user's rooms.
     */
    public function rooms(Request $request): JsonResponse
    {
        $user = $request->user();
        $rooms = $user->rooms()
            ->select('id', 'name', 'description', 'capacity', 'current_users', 'is_public', 'created_at')
            ->get();

        return response()->json([
            'rooms' => $rooms,
        ]);
    }
}
