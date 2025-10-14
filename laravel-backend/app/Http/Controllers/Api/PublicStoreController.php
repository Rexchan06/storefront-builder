<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Store;

class PublicStoreController extends Controller
{
    /**
     * Display the specified public store with its products
     * No authentication required
     */
    public function show(string $slug)
    {
        // Find store by slug
        $store = Store::where('store_slug', $slug)->first();

        if (!$store) {
            return response()->json([
                'message' => 'Store not found'
            ], 404);
        }

        // Check if store is active/published
        if (!$store->is_active) {
            return response()->json([
                'message' => 'This store is not currently available'
            ], 403);
        }

        // Load active products only
        $products = $store->products()
            ->where('is_active', true)
            ->get();

        return response()->json([
            'store' => $store,
            'products' => $products
        ], 200);
    }
}
