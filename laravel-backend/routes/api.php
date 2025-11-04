<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\CustomerAuthController;
use App\Http\Controllers\Api\ProductController;
use App\Http\Controllers\Api\StoreController;
use App\Http\Controllers\Api\PublicStoreController;
use App\Http\Controllers\Api\OrderController;
use App\Http\Controllers\Api\CustomerOrderController;
use App\Http\Controllers\Api\StripeController;
use App\Http\Controllers\Api\StripeWebhookController;
use App\Http\Controllers\Api\AnalyticsController;

Route::post('/register', [AuthController::class, 'register']);
Route::post('/login', [AuthController::class, 'login']);
Route::get('/auth/google', [AuthController::class, 'redirectToGoogle']);
Route::get('/auth/google/callback', [AuthController::class, 'handleGoogleCallback']);

Route::post('/customer/register', [CustomerAuthController::class, 'register']);
Route::post('/customer/login', [CustomerAuthController::class, 'login']);

// Public routes (no authentication required)
Route::get('/public/stores/{slug}', [PublicStoreController::class, 'show']);

// Stripe webhook (no authentication - verified by signature)
Route::post('/webhooks/stripe', [StripeWebhookController::class, 'handleWebhook']);

Route::middleware(['auth:sanctum'])->group(function () {
    Route::post('logout', [AuthController::class, 'logout']);
    Route::post('/user', function (Request $request) {
        return $request->user();
    });

    Route::post('/customer/logout', [CustomerAuthController::class, 'logout']);

    // Store routes
    Route::get('/stores', [StoreController::class, 'index']);
    Route::post('/stores', [StoreController::class, 'store']);
    Route::get('/stores/{id}', [StoreController::class, 'show']);
    Route::put('/stores/{id}', [StoreController::class, 'update']);
    Route::delete('/stores/{id}', [StoreController::class, 'destroy']);

    // Product routes
    Route::get('/products', [ProductController::class, 'index']);
    Route::post('/products', [ProductController::class, 'store']);
    Route::get('/products/{id}', [ProductController::class, 'show']);
    Route::put('/products/{id}', [ProductController::class, 'update']);
    Route::delete('/products/{id}', [ProductController::class, 'destroy']);

    // Order Management - Store Owner routes
    Route::get('/orders', [OrderController::class, 'index']);
    Route::get('/orders/statistics', [OrderController::class, 'statistics']);
    Route::get('/orders/{id}', [OrderController::class, 'show']);
    Route::put('/orders/{id}/status', [OrderController::class, 'updateStatus']);
    Route::delete('/orders/{id}', [OrderController::class, 'destroy']);

    // Order Management - Customer routes
    Route::post('/customer/orders', [CustomerOrderController::class, 'store']);
    Route::get('/customer/orders', [CustomerOrderController::class, 'index']);
    Route::get('/customer/orders/{id}', [CustomerOrderController::class, 'show']);
    Route::put('/customer/orders/{id}/cancel', [CustomerOrderController::class, 'cancel']);

    // Stripe Payment routes
    Route::post('/payments/stripe/create-intent', [StripeController::class, 'createPaymentIntent']);
    Route::post('/payments/stripe/confirm', [StripeController::class, 'confirmPayment']);
    Route::get('/payments/{reference}/status', [StripeController::class, 'checkPaymentStatus']);

    // Analytics routes - Store Owner only
    Route::get('/analytics/dashboard', [AnalyticsController::class, 'getDashboardData']);
    Route::get('/analytics/sales', [AnalyticsController::class, 'getSalesStatistics']);
    Route::get('/analytics/top-products', [AnalyticsController::class, 'getTopSellingProducts']);
    Route::get('/analytics/revenue', [AnalyticsController::class, 'getRevenueBreakdown']);
});
