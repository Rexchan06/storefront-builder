  <?php

  namespace App\Http\Controllers\Api;

  use App\Http\Controllers\Controller;
  use Illuminate\Http\Request;
  use App\Models\Product;

  class ProductController extends Controller
  {
      /**
       * INDEX - List all products from user's store
       */
      public function index(Request $request)
      {
          $store = auth()->user()->store;

          if (!$store) {
              return response()->json([
                  'message' => 'No store found. Please create a store first.'
              ], 404);
          }

          $query = $store->products();

          if ($request->has('category')) {
              $query->where('category', $request->category);
          }

          if ($request->has('is_active')) {
              $query->where('is_active', $request->is_active);
          }

          $products = $query->get();

          return response()->json($products, 200);
      }

      /**
       * STORE - Create new product
       */
      public function store(Request $request)
      {
          $store = auth()->user()->store;

          // Check if user has a store first
          if (!$store) {
              return response()->json([
                  'message' => 'You must create a store first'
              ], 403);
          }

          // Validate all product fields
          $validated = $request->validate([
              'name' => 'required|string|max:255',
              'category' => 'nullable|string|max:255',
              'description' => 'nullable|string',
              'price' => 'required|numeric|min:0',
              'image' => 'nullable|string',
              'stock_quantity' => 'required|integer|min:0',
              'is_active' => 'boolean',
          ]);

          // Create product with store_id
          $product = Product::create(array_merge($validated, [
              'store_id' => $store->id 
          ]));

          return response()->json([
              'message' => 'Product created successfully',
              'data' => $product
          ], 201);
      }

      /**
       * SHOW - Display single product
       */
      public function show(string $id)
      {
          $product = Product::findOrFail($id);

          // Authorization: Check if product belongs to user's store
          if ($product->store->user_id !== auth()->id()) {
              return response()->json([
                  'message' => 'Unauthorized'
              ], 403);
          }

          return response()->json($product, 200);
      }

      /**
       * UPDATE - Modify existing product
       */
      public function update(Request $request, string $id)
      {
          $product = Product::findOrFail($id);

          // Authorization check through store
          if ($product->store->user_id !== auth()->id()) {
              return response()->json([
                  'message' => 'Unauthorized'
              ], 403);
          }

          $validated = $request->validate([
              'name' => 'sometimes|string|max:255',
              'category' => 'nullable|string|max:255',
              'description' => 'nullable|string',
              'price' => 'sometimes|numeric|min:0',
              'image' => 'nullable|string',
              'stock_quantity' => 'sometimes|integer|min:0',
              'is_active' => 'boolean',
          ]);

          $product->update($validated);

          return response()->json([
              'message' => 'Product updated successfully',
              'data' => $product
          ], 200);
      }

      /**
       * DESTROY - Delete product
       */
      public function destroy(string $id)
      {
          $product = Product::findOrFail($id);

          // Authorization check through store
          if ($product->store->user_id !== auth()->id()) {
              return response()->json([
                  'message' => 'Unauthorized'
              ], 403);
          }

          $product->delete();

          return response()->json([
              'message' => 'Product deleted successfully'
          ], 200);
      }
  }