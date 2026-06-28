<?php

namespace App\Http\Controllers;

use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Hash;

class AuthController extends Controller
{
    public function register(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'username' => 'required|string|min:3|max:25|unique:users',
            'password' => 'required|string|min:6',
        ], [
            'username.required' => 'El nombre de usuario es requerido',
            'username.unique' => 'El nombre de usuario ya está en uso',
            'username.min' => 'El nombre de usuario debe tener al menos 3 caracteres',
            'password.required' => 'La contraseña es requerida',
            'password.min' => 'La contraseña debe tener al menos 6 caracteres',
        ]);

        $user = User::create([
            'username' => $validated['username'],
            'password' => Hash::make($validated['password']),
            'rank' => 1,
            'account_created' => now()->timestamp,
            'ip_register' => $request->ip(),
            'ip_current' => $request->ip(),
        ]);

        return response()->json([
            'message' => 'Usuario registrado exitosamente',
            'user' => [
                'id' => $user->id,
                'username' => $user->username,
                'role' => $user->role,
            ],
        ], 201);
    }

    public function login(Request $request): JsonResponse
    {
        try {
            $validated = $request->validate([
                'username' => 'required|string',
                'password' => 'required|string',
            ], [
                'username.required' => 'El nombre de usuario es requerido',
                'password.required' => 'La contraseña es requerida',
            ]);

            $user = User::where('username', $validated['username'])->first();

            if (!$user || !Hash::check($validated['password'], $user->password)) {
                return response()->json([
                    'message' => 'Credenciales inválidas',
                ], 401);
            }

            $token = $user->createToken('api-token', ['*'], now()->addHours(24))->plainTextToken;

            // Update last login and IP
            $user->update([
                'last_login' => now()->timestamp,
                'ip_current' => $request->ip(),
            ]);

            return response()->json([
                'message' => 'Inicio de sesión exitoso',
                'token' => $token,
                'user' => [
                    'id' => $user->id,
                    'username' => $user->username,
                    'role' => $user->role,
                ],
            ]);
        } catch (\Throwable $e) {
            return response()->json([
                'error_message' => $e->getMessage(),
                'error_file' => $e->getFile(),
                'error_line' => $e->getLine(),
                'error_trace' => array_slice($e->getTrace(), 0, 5)
            ], 500);
        }
    }

    public function me(Request $request): JsonResponse
    {
        return response()->json([
            'user' => [
                'id' => $request->user()->id,
                'username' => $request->user()->username,
                'role' => $request->user()->role,
            ],
        ]);
    }

    public function logout(Request $request): JsonResponse
    {
        $request->user()->currentAccessToken()->delete();

        return response()->json([
            'message' => 'Sesión cerrada exitosamente',
        ]);
    }

    public function refreshToken(Request $request): JsonResponse
    {
        $user = $request->user();
        $user->tokens()->delete();

        $token = $user->createToken('api-token', ['*'], now()->addHours(24))->plainTextToken;

        return response()->json([
            'token' => $token,
            'user' => [
                'id' => $user->id,
                'username' => $user->username,
                'role' => $user->role,
            ],
        ]);
    }

    public function ssoTicket(Request $request): JsonResponse
    {
        $ticket = $request->user()->generateSsoTicket();

        return response()->json([
            'ticket' => $ticket,
        ]);
    }

    public function ssoToken(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'token' => 'required|string',
        ]);

        $user = User::where('auth_ticket', $validated['token'])->first();

        if (!$user) {
            return response()->json([
                'message' => 'Invalid SSO token',
            ], 401);
        }

        return response()->json([
            'username' => $user->username,
            'ticket' => $validated['token'],
            'token' => $validated['token'],
        ]);
    }
}
