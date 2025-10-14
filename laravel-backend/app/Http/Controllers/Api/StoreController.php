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
            'logo' => 'nullable|image|mimes:jpeg,png,jpg,gif,webp|max:2048',
            'background_image' => 'nullable|image|mimes:jpeg,png,jpg,gif,webp|max:2048',
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

        // Handle logo upload
        $logoPath = null;
        if ($request->hasFile('logo')) {
            $logoPath = $request->file('logo')->store('stores/logos', 'public');
        }

        // Handle background image upload
        $backgroundImagePath = null;
        if ($request->hasFile('background_image')) {
            $backgroundImagePath = $request->file('background_image')->store('stores/backgrounds', 'public');
        }

        $store = Store::create([
            'user_id' => $user->id,
            'store_name' => $validated['store_name'],
            'store_slug' => $validated['store_slug'],
            'description' => $validated['description'] ?? null,
            'logo' => $logoPath,
            'background_image' => $backgroundImagePath,
            'contact_email' => $validated['contact_email'] ?? null,
            'contact_phone' => $validated['contact_phone'] ?? null,
            'address' => $validated['address'] ?? null,
            'is_active' => $validated['is_active'] ?? false,
        ]);

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
            'logo' => 'nullable|image|mimes:jpeg,png,jpg,gif,webp|max:2048',
            'background_image' => 'nullable|image|mimes:jpeg,png,jpg,gif,webp|max:2048',
            'contact_email' => 'nullable|email',
            'contact_phone' => 'nullable|string',
            'address' => 'nullable|string',
            'is_active' => 'boolean',
        ]);

        // Validate publishing requirements
        if (isset($validated['is_active']) && $validated['is_active'] === true) {
            // Check if store has at least one active product
            $activeProductsCount = $store->products()->where('is_active', true)->count();

            if ($activeProductsCount === 0) {
                return response()->json([
                    'message' => 'Cannot publish store without any active products. Please add at least one product first.',
                    'error' => 'no_products'
                ], 422);
            }
        }

        // Handle logo upload
        if ($request->hasFile('logo')) {
            // Delete old logo if exists
            if ($store->logo && \Storage::disk('public')->exists($store->logo)) {
                \Storage::disk('public')->delete($store->logo);
            }
            $validated['logo'] = $request->file('logo')->store('stores/logos', 'public');
        }

        // Handle background image upload
        if ($request->hasFile('background_image')) {
            // Delete old background image if exists
            if ($store->background_image && \Storage::disk('public')->exists($store->background_image)) {
                \Storage::disk('public')->delete($store->background_image);
            }
            $validated['background_image'] = $request->file('background_image')->store('stores/backgrounds', 'public');
        }

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
