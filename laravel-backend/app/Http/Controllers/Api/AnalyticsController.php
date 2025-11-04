<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Order;
use App\Models\OrderItem;
use App\Models\Product;
use App\Models\Store;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class AnalyticsController extends Controller
{
    /**
     * Get aggregated dashboard data
     *
     * @param Request $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function getDashboardData(Request $request)
    {
        $user = $request->user();
        $store = Store::where('user_id', $user->id)->first();

        if (!$store) {
            return response()->json(['message' => 'Store not found'], 404);
        }

        // Get total revenue from completed/paid orders
        $totalRevenue = Order::where('store_id', $store->id)
            ->whereIn('status', ['paid', 'shipped', 'completed'])
            ->sum('total_amount');

        // Get total orders count
        $totalOrders = Order::where('store_id', $store->id)->count();

        // Get pending orders count
        $pendingOrders = Order::where('store_id', $store->id)
            ->where('status', 'pending')
            ->count();

        // Get average order value
        $avgOrderValue = $totalOrders > 0
            ? Order::where('store_id', $store->id)
                ->whereIn('status', ['paid', 'shipped', 'completed'])
                ->avg('total_amount')
            : 0;

        // Get recent orders (last 5)
        $recentOrders = Order::where('store_id', $store->id)
            ->with(['customer', 'orderItems.product'])
            ->orderBy('created_at', 'desc')
            ->limit(5)
            ->get();

        return response()->json([
            'total_revenue' => round($totalRevenue, 2),
            'total_orders' => $totalOrders,
            'pending_orders' => $pendingOrders,
            'avg_order_value' => round($avgOrderValue, 2),
            'recent_orders' => $recentOrders
        ]);
    }

    /**
     * Get detailed sales statistics
     *
     * @param Request $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function getSalesStatistics(Request $request)
    {
        $user = $request->user();
        $store = Store::where('user_id', $user->id)->first();

        if (!$store) {
            return response()->json(['message' => 'Store not found'], 404);
        }

        // Revenue by status
        $revenueByStatus = Order::where('store_id', $store->id)
            ->select('status', DB::raw('SUM(total_amount) as revenue'), DB::raw('COUNT(*) as count'))
            ->groupBy('status')
            ->get();

        // Total confirmed revenue (paid, shipped, completed)
        $confirmedRevenue = Order::where('store_id', $store->id)
            ->whereIn('status', ['paid', 'shipped', 'completed'])
            ->sum('total_amount');

        // Total pending revenue
        $pendingRevenue = Order::where('store_id', $store->id)
            ->where('status', 'pending')
            ->sum('total_amount');

        // Average order value
        $avgOrderValue = Order::where('store_id', $store->id)
            ->whereIn('status', ['paid', 'shipped', 'completed'])
            ->avg('total_amount');

        return response()->json([
            'revenue_by_status' => $revenueByStatus,
            'confirmed_revenue' => round($confirmedRevenue, 2),
            'pending_revenue' => round($pendingRevenue, 2),
            'avg_order_value' => round($avgOrderValue ?? 0, 2),
            'total_orders' => Order::where('store_id', $store->id)->count()
        ]);
    }

    /**
     * Get top selling products
     *
     * @param Request $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function getTopSellingProducts(Request $request)
    {
        $user = $request->user();
        $store = Store::where('user_id', $user->id)->first();

        if (!$store) {
            return response()->json(['message' => 'Store not found'], 404);
        }

        // Get top 5 products by quantity sold (only from paid/shipped/completed orders)
        $topProducts = OrderItem::join('orders', 'order_items.order_id', '=', 'orders.id')
            ->join('products', 'order_items.product_id', '=', 'products.id')
            ->where('orders.store_id', $store->id)
            ->whereIn('orders.status', ['paid', 'shipped', 'completed'])
            ->select(
                'products.id',
                'products.name',
                'products.price',
                DB::raw('SUM(order_items.quantity) as total_quantity'),
                DB::raw('SUM(order_items.quantity * order_items.price) as total_revenue')
            )
            ->groupBy('products.id', 'products.name', 'products.price')
            ->orderBy('total_quantity', 'desc')
            ->limit(5)
            ->get();

        return response()->json([
            'top_products' => $topProducts
        ]);
    }

    /**
     * Get revenue breakdown by date range
     *
     * @param Request $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function getRevenueBreakdown(Request $request)
    {
        $user = $request->user();
        $store = Store::where('user_id', $user->id)->first();

        if (!$store) {
            return response()->json(['message' => 'Store not found'], 404);
        }

        // Default to last 30 days if not specified
        $startDate = $request->input('start_date', now()->subDays(30)->format('Y-m-d'));
        $endDate = $request->input('end_date', now()->format('Y-m-d'));

        // Revenue grouped by date
        $revenueByDate = Order::where('store_id', $store->id)
            ->whereIn('status', ['paid', 'shipped', 'completed'])
            ->whereBetween(DB::raw('DATE(created_at)'), [$startDate, $endDate])
            ->select(
                DB::raw('DATE(created_at) as date'),
                DB::raw('SUM(total_amount) as revenue'),
                DB::raw('COUNT(*) as order_count')
            )
            ->groupBy(DB::raw('DATE(created_at)'))
            ->orderBy('date', 'asc')
            ->get();

        // Total revenue in the period
        $totalRevenue = $revenueByDate->sum('revenue');
        $totalOrders = $revenueByDate->sum('order_count');

        return response()->json([
            'start_date' => $startDate,
            'end_date' => $endDate,
            'revenue_by_date' => $revenueByDate,
            'total_revenue' => round($totalRevenue, 2),
            'total_orders' => $totalOrders,
            'avg_daily_revenue' => $revenueByDate->count() > 0
                ? round($totalRevenue / $revenueByDate->count(), 2)
                : 0
        ]);
    }
}
