<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\Store;

class StoreController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        $store = auth()->user()->store;

        if (!$store) {
            return response()->json(['message' => 'No store found'], 404);
        }

        return response()->json($store, 200);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        $user = auth()->user();

        $validated = $request->validate([
            'store_name' => 'required|string|max:255',
            'store_slug' => 'required|string|unique:stores',
            'description' => 'nullable|string',
            'contact_email' => 'nullable|email',
            'contact_phone' => 'nullable|string',
            'address' => 'nullable|string',
            'is_active' => 'boolean',
        ]);

        if ($user->store) {
            return response()->json([
                'message' => 'You already have a store'
            ], 422);
        }

        $store = Store::create(array_merge($validated, ['user_id' => $user->id]));

        return response()->json([
            'message' => 'Store created successfully',
            'store' => $store,
        ], 201);
    }

    /**
     * Display the specified resource.
     */
    public function show(string $id)
    {
        $store = Store::findOrFail($id);

        if ($store->user_id !== auth()->id()) {
            return response()->json([
                'message' => 'Unauthorized',
            ], 403);
        }

        return response()->json($store, 200);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, string $id)
    {
        $store = Store::findOrFail($id);

        if ($store->user_id !== auth()->id()) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $validated = $request->validate([
            'store_name' => 'sometimes|string|max:255',
            'store_slug' => 'sometimes|string|unique:stores,store_slug,' . $id,
            'description' => 'nullable|string',
            'contact_email' => 'nullable|email',
            'contact_phone' => 'nullable|string',
            'address' => 'nullable|string',
            'is_active' => 'boolean',
        ]);

        $store->update($validated);

        return response()->json([
            'message' => 'Store updated successfully',
            'store' => $store
        ], 200);
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(string $id)
    {
        $store = Store::findOrFail($id);

        if ($store->user_id !== auth()->id()) {
            return response()->json(['message' => 'Unauthorized',], 403);
        }

        $store->delete();

        return response()->json([
            'message' => 'Store deleted successfully'
        ], 200);
    }
}
