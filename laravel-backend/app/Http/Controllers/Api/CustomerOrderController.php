<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Order;
use App\Models\Product;
use App\Models\Store;
use App\Models\OrderItem;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Facades\Mail;
use App\Mail\OrderConfirmationMail;

class CustomerOrderController extends Controller
{
    /**
     * Create order (Checkout)
     * POST /api/customer/orders
     */
    public function store(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'store_id' => 'required|exists:stores,id',
            'customer_name' => 'required|string|max:255',
            'customer_email' => 'required|email|max:255',
            'customer_phone' => 'nullable|string|max:20',
            'customer_address' => 'required|string',
            'items' => 'required|array|min:1',
            'items.*.product_id' => 'required|exists:products,id',
            'items.*.quantity' => 'required|integer|min:1',
            'payment_method' => 'required|in:stripe,fpx,cod',
            'notes' => 'nullable|string'
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        DB::beginTransaction();

        try {
            // Validate all products exist and have sufficient stock
            $totalAmount = 0;
            $orderItemsData = [];

            foreach ($request->items as $item) {
                $product = Product::where('id', $item['product_id'])
                    ->where('store_id', $request->store_id)
                    ->where('is_active', true)
                    ->first();

                if (!$product) {
                    DB::rollBack();
                    return response()->json([
                        'message' => 'Product not found or inactive',
                        'product_id' => $item['product_id']
                    ], 404);
                }

                if ($product->stock_quantity < $item['quantity']) {
                    DB::rollBack();
                    return response()->json([
                        'message' => 'Insufficient stock',
                        'product' => $product->name,
                        'available' => $product->stock_quantity,
                        'requested' => $item['quantity']
                    ], 422);
                }

                $itemTotal = $product->price * $item['quantity'];
                $totalAmount += $itemTotal;

                $orderItemsData[] = [
                    'product_id' => $product->id,
                    'product_name' => $product->name,
                    'unit_price' => $product->price,
                    'quantity' => $item['quantity'],
                    'total_price' => $itemTotal
                ];
            }

            // Get customer_id if authenticated
            $customerId = null;
            if ($request->user('sanctum')) {
                $customerId = $request->user('sanctum')->id;
            }

            // Create order
            $order = Order::create([
                'store_id' => $request->store_id,
                'customer_id' => $customerId,
                'order_number' => $this->generateOrderNumber(),
                'customer_name' => $request->customer_name,
                'customer_email' => $request->customer_email,
                'customer_phone' => $request->customer_phone,
                'customer_address' => $request->customer_address,
                'total_amount' => $totalAmount,
                'status' => 'pending', // Will be updated to 'paid' after payment confirmation
                'payment_method' => $request->payment_method,
                'notes' => $request->notes
            ]);

            // Create order items
            foreach ($orderItemsData as $itemData) {
                $order->orderItems()->create($itemData);
            }

            DB::commit();

            // Send order confirmation email
            try {
                Mail::to($order->customer_email)->send(new OrderConfirmationMail($order));
            } catch (\Exception $e) {
                // Log email error but don't fail the order creation
                \Log::error('Failed to send order confirmation email', [
                    'order_id' => $order->id,
                    'error' => $e->getMessage()
                ]);
            }

            return response()->json([
                'message' => 'Order created successfully',
                'order' => $order->load('orderItems.product')
            ], 201);

        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json([
                'message' => 'Failed to create order',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Get customer's order history
     * GET /api/customer/orders
     */
    public function index(Request $request)
    {
        $customer = $request->user();

        if (!$customer) {
            return response()->json(['message' => 'Unauthorized'], 401);
        }

        $orders = Order::where('customer_id', $customer->id)
            ->with(['orderItems.product', 'store'])
            ->orderBy('created_at', 'desc')
            ->get();

        return response()->json($orders);
    }

    /**
     * Get specific order details
     * GET /api/customer/orders/{id}
     */
    public function show(Request $request, $id)
    {
        $customer = $request->user();

        if (!$customer) {
            return response()->json(['message' => 'Unauthorized'], 401);
        }

        $order = Order::where('id', $id)
            ->where('customer_id', $customer->id)
            ->with(['orderItems.product', 'store'])
            ->first();

        if (!$order) {
            return response()->json(['message' => 'Order not found'], 404);
        }

        return response()->json($order);
    }

    /**
     * Get specific order details (public, no auth required)
     * GET /api/public/orders/{id}
     */
    public function showPublic($id)
    {
        $order = Order::where('id', $id)
            ->with(['orderItems', 'store'])
            ->first();

        if (!$order) {
            return response()->json(['message' => 'Order not found'], 404);
        }

        return response()->json($order);
    }

    /**
     * Cancel pending order
     * PUT /api/customer/orders/{id}/cancel
     */
    public function cancel(Request $request, $id)
    {
        $customer = $request->user();

        if (!$customer) {
            return response()->json(['message' => 'Unauthorized'], 401);
        }

        $order = Order::where('id', $id)
            ->where('customer_id', $customer->id)
            ->first();

        if (!$order) {
            return response()->json(['message' => 'Order not found'], 404);
        }

        // Can only cancel pending orders
        if ($order->status !== 'pending') {
            return response()->json([
                'message' => 'Can only cancel pending orders',
                'current_status' => $order->status
            ], 422);
        }

        $order->status = 'cancelled';
        $order->save();

        return response()->json([
            'message' => 'Order cancelled successfully',
            'order' => $order->load('orderItems.product')
        ]);
    }

    /**
     * Generate unique order number
     */
    private function generateOrderNumber()
    {
        do {
            $orderNumber = 'ORD-' . strtoupper(uniqid());
        } while (Order::where('order_number', $orderNumber)->exists());

        return $orderNumber;
    }
}
