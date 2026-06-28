<?php

namespace App\Http\Controllers;

use App\Models\Item;
use App\Models\InventoryItem;
use App\Models\Room;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Carbon\Carbon;

class AdminController extends Controller
{
    public function listUsers(): JsonResponse
    {
        $users = User::select('id', 'username', 'rank', 'account_created')
            ->orderBy('account_created', 'desc')
            ->get()
            ->map(function ($user) {
                return [
                    'id' => $user->id,
                    'username' => $user->username,
                    'role' => $user->role,
                    'created_at' => $user->account_created,
                ];
            });

        return response()->json(['users' => $users]);
    }

    public function deleteUser(Request $request, User $user): JsonResponse
    {
        $user->delete();

        return response()->json([
            'message' => 'Usuario eliminado exitosamente',
        ]);
    }

    public function toggleUserRole(Request $request, User $user): JsonResponse
    {
        $newRank = $user->rank >= 7 ? 1 : 7;
        $user->update(['rank' => $newRank]);

        return response()->json([
            'message' => "Usuario actualizado a rol: " . ($newRank >= 7 ? 'admin' : 'user'),
            'user' => [
                'id' => $user->id,
                'username' => $user->username,
                'role' => $user->role,
            ],
        ]);
    }

    public function listRooms(): JsonResponse
    {
        $rooms = Room::with('owner:id,username')
            ->select('id', 'name', 'description', 'users_max', 'users', 'owner_id', 'is_public', 'state')
            ->get()
            ->map(function ($room) {
                return [
                    'id' => $room->id,
                    'name' => $room->name,
                    'description' => $room->description,
                    'capacity' => $room->users_max,
                    'current_users' => $room->users,
                    'owner_id' => $room->owner_id,
                    'owner' => $room->owner,
                    'is_public' => $room->is_public === '1',
                    'state' => $room->state,
                ];
            });

        return response()->json(['rooms' => $rooms]);
    }

    public function createRoom(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'name' => 'required|string|max:50',
            'description' => 'nullable|string|max:512',
            'capacity' => 'required|integer|min:1|max:500',
            'is_public' => 'boolean',
            'owner_id' => 'nullable|integer|exists:users,id',
        ], [
            'name.required' => 'El nombre de la sala es requerido',
            'capacity.required' => 'La capacidad es requerida',
        ]);

        $room = Room::create([
            'name' => $validated['name'],
            'description' => $validated['description'] ?? '',
            'users_max' => $validated['capacity'],
            'is_public' => isset($validated['is_public']) && $validated['is_public'] ? '1' : '0',
            'owner_id' => $validated['owner_id'] ?? 0,
            'owner_name' => '',
        ]);

        return response()->json([
            'message' => 'Sala creada exitosamente',
            'room' => [
                'id' => $room->id,
                'name' => $room->name,
                'description' => $room->description,
                'capacity' => $room->users_max,
                'current_users' => $room->users,
                'is_public' => $room->is_public === '1',
            ],
        ], 201);
    }

    public function updateRoom(Request $request, Room $room): JsonResponse
    {
        $validated = $request->validate([
            'name' => 'string|max:50',
            'description' => 'nullable|string|max:512',
            'capacity' => 'integer|min:1|max:500',
            'current_users' => 'integer|min:0',
            'is_public' => 'boolean',
        ]);

        $data = $validated;
        if (isset($data['capacity'])) {
            $data['users_max'] = $data['capacity'];
            unset($data['capacity']);
        }
        if (isset($data['current_users'])) {
            $data['users'] = $data['current_users'];
            unset($data['current_users']);
        }
        if (isset($data['is_public'])) {
            $data['is_public'] = $data['is_public'] ? '1' : '0';
        }

        $room->update($data);

        return response()->json([
            'message' => 'Sala actualizada exitosamente',
            'room' => $room,
        ]);
    }

    public function deleteRoom(Request $request, Room $room): JsonResponse
    {
        $room->delete();

        return response()->json([
            'message' => 'Sala eliminada exitosamente',
        ]);
    }

    public function listItems(): JsonResponse
    {
        return response()->json([
            'items' => Item::select('id', 'user_id', 'room_id', 'item_id', 'x', 'y', 'z', 'rot')->get(),
        ]);
    }

    public function addInventoryItem(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'user_id' => 'required|exists:users,id',
            'item_id' => 'required|integer|min:1',
            'quantity' => 'required|integer|min:1',
        ]);

        for ($i = 0; $i < $validated['quantity']; $i++) {
            InventoryItem::create([
                'user_id' => $validated['user_id'],
                'item_id' => $validated['item_id'],
                'quantity' => 1,
            ]);
        }

        return response()->json([
            'message' => 'Item agregado al inventario exitosamente',
        ]);
    }

    public function createItem(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'user_id' => 'nullable|integer',
            'room_id' => 'nullable|integer',
            'item_id' => 'required|integer',
            'x' => 'integer',
            'y' => 'integer',
            'z' => 'numeric',
            'rot' => 'integer',
        ]);

        $item = Item::create(array_merge([
            'user_id' => 0,
            'room_id' => 0,
            'x' => 0,
            'y' => 0,
            'z' => 0.0,
            'rot' => 0,
        ], $validated));

        return response()->json([
            'message' => 'Item creado exitosamente',
            'item' => $item,
        ], 201);
    }
}
