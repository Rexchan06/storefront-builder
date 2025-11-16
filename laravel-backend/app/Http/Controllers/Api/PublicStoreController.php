<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Store;
use Illuminate\Http\Request;

class PublicStoreController extends Controller
{
    /**
     * Display the specified public store with its products
     * Supports search, filters, sorting, and pagination
     * No authentication required
     *
     * Query parameters:
     * - search: Search in product name, description, and category
     * - category: Filter by category
     * - price_min: Minimum price filter
     * - price_max: Maximum price filter
     * - sort: Sort order (price_asc, price_desc, name_asc, name_desc, newest, oldest)
     * - page: Page number for pagination
     * - per_page: Number of items per page (default: 8)
     */
    public function show(Request $request, string $slug)
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

        // Build query for active products
        $query = $store->products()->where('is_active', true);

        // Search functionality
        if ($request->has('search') && !empty($request->search)) {
            $searchTerm = $request->search;
            $query->where(function($q) use ($searchTerm) {
                $q->where('name', 'like', '%' . $searchTerm . '%')
                  ->orWhere('description', 'like', '%' . $searchTerm . '%')
                  ->orWhere('category', 'like', '%' . $searchTerm . '%');
            });
        }

        // Category filter
        if ($request->has('category') && !empty($request->category)) {
            $query->where('category', $request->category);
        }

        // Price range filters
        if ($request->has('price_min') && is_numeric($request->price_min)) {
            $query->where('price', '>=', $request->price_min);
        }

        if ($request->has('price_max') && is_numeric($request->price_max)) {
            $query->where('price', '<=', $request->price_max);
        }

        // Sorting
        $sortOrder = $request->get('sort', 'newest');
        switch ($sortOrder) {
            case 'price_asc':
                $query->orderBy('price', 'asc');
                break;
            case 'price_desc':
                $query->orderBy('price', 'desc');
                break;
            case 'name_asc':
                $query->orderBy('name', 'asc');
                break;
            case 'name_desc':
                $query->orderBy('name', 'desc');
                break;
            case 'oldest':
                $query->orderBy('created_at', 'asc');
                break;
            case 'newest':
            default:
                $query->orderBy('created_at', 'desc');
                break;
        }

        // Pagination
        $perPage = $request->get('per_page', 8);
        $products = $query->paginate($perPage);

        return response()->json([
            'store' => $store,
            'products' => $products->items(),
            'pagination' => [
                'current_page' => $products->currentPage(),
                'last_page' => $products->lastPage(),
                'per_page' => $products->perPage(),
                'total' => $products->total(),
                'from' => $products->firstItem(),
                'to' => $products->lastItem(),
            ]
        ], 200);
    }

    /**
     * Get distinct categories for a store
     * Used to populate filter dropdowns
     * No authentication required
     */
    public function getCategories(string $slug)
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

        // Get distinct categories from active products
        $categories = $store->products()
            ->where('is_active', true)
            ->whereNotNull('category')
            ->distinct()
            ->pluck('category')
            ->filter() // Remove empty values
            ->values() // Reset array keys
            ->toArray();

        return response()->json([
            'categories' => $categories
        ], 200);
    }
}
