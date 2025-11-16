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
use App\Mail\OrderStatusUpdateMail;
use App\Mail\OrderShippedMail;

class OrderController extends Controller
{
    /**
     * Get all orders for the authenticated store owner
     * GET /api/orders
     */
    public function index(Request $request)
    {
        $user = $request->user();

        // Get user's store
        $store = Store::where('user_id', $user->id)->first();

        if (!$store) {
            return response()->json(['message' => 'Store not found'], 404);
        }

        // Get orders with optional filtering
        $query = Order::where('store_id', $store->id)
            ->with(['orderItems.product', 'customer']);

        // Filter by status
        if ($request->has('status')) {
            $query->where('status', $request->status);
        }

        // Filter by date
        if ($request->has('date_from')) {
            $query->whereDate('created_at', '>=', $request->date_from);
        }

        // Order by newest first
        $orders = $query->orderBy('created_at', 'desc')->get();

        return response()->json($orders);
    }

    /**
     * Get specific order details
     * GET /api/orders/{id}
     */
    public function show(Request $request, $id)
    {
        $user = $request->user();

        // Get user's store
        $store = Store::where('user_id', $user->id)->first();

        if (!$store) {
            return response()->json(['message' => 'Store not found'], 404);
        }

        $order = Order::where('id', $id)
            ->where('store_id', $store->id)
            ->with(['orderItems.product', 'customer'])
            ->first();

        if (!$order) {
            return response()->json(['message' => 'Order not found'], 404);
        }

        return response()->json($order);
    }

    /**
     * Update order status
     * PUT /api/orders/{id}/status
     */
    public function updateStatus(Request $request, $id)
    {
        $validator = Validator::make($request->all(), [
            'status' => 'required|in:pending,paid,shipped,completed,cancelled'
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        $user = $request->user();

        // Get user's store
        $store = Store::where('user_id', $user->id)->first();

        if (!$store) {
            return response()->json(['message' => 'Store not found'], 404);
        }

        $order = Order::where('id', $id)
            ->where('store_id', $store->id)
            ->first();

        if (!$order) {
            return response()->json(['message' => 'Order not found'], 404);
        }

        $newStatus = $request->status;
        $previousStatus = $order->status;

        // Validate status transition using Order model method
        if (!$order->canTransitionTo($newStatus)) {
            $allowedTransitions = $order->getAllowedTransitions();

            return response()->json([
                'message' => 'Invalid status transition',
                'error' => sprintf(
                    'Cannot transition from "%s" to "%s".',
                    $order->status,
                    $newStatus
                ),
                'current_status' => $order->status,
                'allowed_transitions' => $allowedTransitions,
                'hint' => empty($allowedTransitions)
                    ? 'This order is in a final status and cannot be modified.'
                    : 'You can only transition to: ' . implode(', ', $allowedTransitions)
            ], 422);
        }

        $order->status = $newStatus;
        $order->save();

        // Send appropriate email notification
        try {
            if ($newStatus === 'shipped') {
                // Send specific shipped email
                Mail::to($order->customer_email)->send(new OrderShippedMail($order));
            } elseif ($previousStatus !== $newStatus) {
                // Send general status update email for other status changes
                Mail::to($order->customer_email)->send(new OrderStatusUpdateMail($order, $previousStatus, $newStatus));
            }
        } catch (\Exception $e) {
            \Log::error('Failed to send order status email', [
                'order_id' => $order->id,
                'previous_status' => $previousStatus,
                'new_status' => $newStatus,
                'error' => $e->getMessage()
            ]);
        }

        return response()->json([
            'message' => 'Order status updated successfully',
            'order' => $order->load('orderItems.product'),
            'allowed_next_transitions' => $order->getAllowedTransitions()
        ]);
    }

    /**
     * Delete/cancel order
     * DELETE /api/orders/{id}
     */
    public function destroy(Request $request, $id)
    {
        $user = $request->user();

        // Get user's store
        $store = Store::where('user_id', $user->id)->first();

        if (!$store) {
            return response()->json(['message' => 'Store not found'], 404);
        }

        $order = Order::where('id', $id)
            ->where('store_id', $store->id)
            ->first();

        if (!$order) {
            return response()->json(['message' => 'Order not found'], 404);
        }

        // Delete order items first
        $order->orderItems()->delete();

        // Delete order
        $order->delete();

        return response()->json(['message' => 'Order deleted successfully']);
    }

    /**
     * Get order statistics for store owner
     * GET /api/orders/statistics
     */
    public function statistics(Request $request)
    {
        $user = $request->user();

        // Get user's store
        $store = Store::where('user_id', $user->id)->first();

        if (!$store) {
            return response()->json(['message' => 'Store not found'], 404);
        }

        $stats = [
            'total_orders' => Order::where('store_id', $store->id)->count(),
            'pending_orders' => Order::where('store_id', $store->id)->where('status', 'pending')->count(),
            'paid_orders' => Order::where('store_id', $store->id)->where('status', 'paid')->count(),
            'shipped_orders' => Order::where('store_id', $store->id)->where('status', 'shipped')->count(),
            'completed_orders' => Order::where('store_id', $store->id)->where('status', 'completed')->count(),
            'cancelled_orders' => Order::where('store_id', $store->id)->where('status', 'cancelled')->count(),
            'total_revenue' => Order::where('store_id', $store->id)
                ->whereIn('status', ['paid', 'shipped', 'completed'])
                ->sum('total_amount')
        ];

        return response()->json($stats);
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
