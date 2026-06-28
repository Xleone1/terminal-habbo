<?php

use App\Http\Controllers\AuthController;
use App\Http\Controllers\UserController;
use App\Http\Controllers\AdminController;
use App\Http\Controllers\AdminPostController;
use App\Http\Controllers\StatisticsController;
use App\Models\Post;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

// Public routes
Route::get('/health', fn () => response()->json(['status' => 'ok']));
Route::post('/register', [AuthController::class, 'register']);
Route::post('/login', [AuthController::class, 'login']);
Route::get('/stats', [StatisticsController::class, 'getStats']);
Route::post('/auth/sso-token', [AuthController::class, 'ssoToken']);
Route::get('/posts', function () {
    return response()->json([
        'posts' => Post::orderBy('created_at', 'desc')->get(),
    ]);
});

// Protected routes
Route::middleware('auth:sanctum')->group(function () {
    // Auth routes
    Route::post('/logout', [AuthController::class, 'logout']);
    Route::post('/auth/sso-ticket', [AuthController::class, 'ssoTicket'])->middleware('auth:sanctum');
    Route::post('/refresh-token', [AuthController::class, 'refreshToken']);
    Route::get('/me', [AuthController::class, 'me']);

    // User routes
    Route::get('/user/profile', [UserController::class, 'profile']);
    Route::get('/user/inventory', [UserController::class, 'inventory']);
    Route::get('/user/rooms', [UserController::class, 'rooms']);
});

// Admin routes (protected + role check)
Route::middleware(['auth:sanctum', 'admin'])->prefix('admin')->group(function () {
    Route::get('/users', [AdminController::class, 'listUsers']);
    Route::delete('/users/{user}', [AdminController::class, 'deleteUser']);
    Route::post('/users/{user}/toggle-role', [AdminController::class, 'toggleUserRole']);

    Route::get('/rooms', [AdminController::class, 'listRooms']);
    Route::post('/rooms', [AdminController::class, 'createRoom']);
    Route::put('/rooms/{room}', [AdminController::class, 'updateRoom']);
    Route::delete('/rooms/{room}', [AdminController::class, 'deleteRoom']);

    Route::get('/items', [AdminController::class, 'listItems']);
    Route::post('/items', [AdminController::class, 'createItem']);
    Route::post('/inventory/add', [AdminController::class, 'addInventoryItem']);

    Route::get('/posts', [AdminPostController::class, 'index']);
    Route::post('/posts', [AdminPostController::class, 'store']);
    Route::put('/posts/{post}', [AdminPostController::class, 'update']);
    Route::delete('/posts/{post}', [AdminPostController::class, 'destroy']);
});
