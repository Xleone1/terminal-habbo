<?php

namespace App\Http\Controllers;

use App\Models\Item;
use App\Models\InventoryItem;
use App\Models\Room;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class AdminController extends Controller
{
    /**
     * Get all users (admin only).
     */
    public function listUsers(): JsonResponse
    {
        $users = User::select('id', 'username', 'role', 'created_at')
            ->orderBy('created_at', 'desc')
            ->get();

        return response()->json([
            'users' => $users,
        ]);
    }

    /**
     * Delete a user (admin only).
     */
    public function deleteUser(Request $request, User $user): JsonResponse
    {
        $user->delete();

        return response()->json([
            'message' => 'Usuario eliminado exitosamente',
        ]);
    }

    /**
     * Promote/demote a user's role (admin only).
     */
    public function toggleUserRole(Request $request, User $user): JsonResponse
    {
        $newRole = $user->role === 'admin' ? 'user' : 'admin';
        $user->update(['role' => $newRole]);

        return response()->json([
            'message' => "Usuario actualizado a rol: {$newRole}",
            'user' => [
                'id' => $user->id,
                'username' => $user->username,
                'role' => $user->role,
            ],
        ]);
    }

    /**
     * Get all rooms (admin only).
     */
    public function listRooms(): JsonResponse
    {
        $rooms = Room::with('owner:id,username')
            ->select('id', 'name', 'description', 'capacity', 'current_users', 'owner_id', 'is_public', 'created_at')
            ->orderBy('created_at', 'desc')
            ->get();

        return response()->json([
            'rooms' => $rooms,
        ]);
    }

    /**
     * Create a new room (admin only).
     */
    public function createRoom(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'description' => 'nullable|string',
            'capacity' => 'required|integer|min:1|max:500',
            'is_public' => 'boolean',
        ], [
            'name.required' => 'El nombre de la sala es requerido',
            'capacity.required' => 'La capacidad es requerida',
        ]);

        $room = Room::create([
            'name' => $validated['name'],
            'description' => $validated['description'] ?? null,
            'capacity' => $validated['capacity'],
            'is_public' => $validated['is_public'] ?? true,
            'owner_id' => null,
        ]);

        return response()->json([
            'message' => 'Sala creada exitosamente',
            'room' => [
                'id' => $room->id,
                'name' => $room->name,
                'description' => $room->description,
                'capacity' => $room->capacity,
                'current_users' => $room->current_users,
                'is_public' => $room->is_public,
            ],
        ], 201);
    }

    /**
     * Update a room (admin only).
     */
    public function updateRoom(Request $request, Room $room): JsonResponse
    {
        $validated = $request->validate([
            'name' => 'string|max:255',
            'description' => 'nullable|string',
            'capacity' => 'integer|min:1|max:500',
            'current_users' => 'integer|min:0',
            'is_public' => 'boolean',
        ]);

        $room->update($validated);

        return response()->json([
            'message' => 'Sala actualizada exitosamente',
            'room' => $room,
        ]);
    }

    /**
     * Delete a room (admin only).
     */
    public function deleteRoom(Request $request, Room $room): JsonResponse
    {
        $room->delete();

        return response()->json([
            'message' => 'Sala eliminada exitosamente',
        ]);
    }

    /**
     * List all items (admin only).
     */
    public function listItems(): JsonResponse
    {
        return response()->json([
            'items' => Item::orderBy('name')->get(),
        ]);
    }

    /**
     * Add item to a user's inventory (admin only).
     */
    public function addInventoryItem(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'user_id' => 'required|exists:users,id',
            'item_id' => 'required|exists:items,id',
            'quantity' => 'required|integer|min:1',
        ]);

        $existing = InventoryItem::where('user_id', $validated['user_id'])
            ->where('item_id', $validated['item_id'])
            ->first();

        if ($existing) {
            $existing->increment('quantity', $validated['quantity']);
        } else {
            InventoryItem::create($validated);
        }

        return response()->json([
            'message' => 'Item agregado al inventario exitosamente',
        ]);
    }

    /**
     * Create a new item (admin only).
     */
    public function createItem(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'description' => 'nullable|string',
            'type' => 'required|string|max:255',
            'price' => 'required|numeric|min:0',
        ]);

        $item = Item::create($validated);

        return response()->json([
            'message' => 'Item creado exitosamente',
            'item' => $item,
        ], 201);
    }
}
