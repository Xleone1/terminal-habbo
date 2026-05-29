<?php

namespace App\Http\Controllers;

use App\Models\Post;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class AdminPostController extends Controller
{
    public function index(): JsonResponse
    {
        $posts = Post::orderBy('created_at', 'desc')->get();

        return response()->json(['posts' => $posts]);
    }

    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'type' => 'required|in:news,community',
            'title' => 'nullable|string|max:255',
            'content' => 'required|string',
            'excerpt' => 'nullable|string|max:500',
            'image_url' => 'nullable|url|max:2048',
            'author' => 'required|string|max:255',
        ]);

        $post = Post::create([
            ...$validated,
            'published_at' => now(),
        ]);

        return response()->json([
            'message' => 'Publicación creada exitosamente',
            'post' => $post,
        ], 201);
    }

    public function update(Request $request, Post $post): JsonResponse
    {
        $validated = $request->validate([
            'type' => 'in:news,community',
            'title' => 'nullable|string|max:255',
            'content' => 'string',
            'excerpt' => 'nullable|string|max:500',
            'image_url' => 'nullable|url|max:2048',
            'author' => 'string|max:255',
        ]);

        $post->update($validated);

        return response()->json([
            'message' => 'Publicación actualizada exitosamente',
            'post' => $post,
        ]);
    }

    public function destroy(Post $post): JsonResponse
    {
        $post->delete();

        return response()->json([
            'message' => 'Publicación eliminada exitosamente',
        ]);
    }
}
