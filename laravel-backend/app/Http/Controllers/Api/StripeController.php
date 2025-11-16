<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Order;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Facades\DB;
use Stripe\Stripe;
use Stripe\Checkout\Session;

class StripeController extends Controller
{
    public function __construct()
    {
        // Set Stripe API key
        Stripe::setApiKey(env('STRIPE_SECRET_KEY'));
    }

    /**
     * Create Stripe Checkout Session
     * POST /api/payments/stripe/create-checkout-session
     */
    public function createCheckoutSession(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'order_id' => 'required|exists:orders,id',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        try {
            $order = Order::with('orderItems.product')->findOrFail($request->order_id);

            $line_items = [];
            foreach ($order->orderItems as $item) {
                $line_items[] = [
                    'price_data' => [
                        'currency' => 'myr',
                        'product_data' => [
                            'name' => $item->product->name,
                        ],
                        'unit_amount' => (int) ($item->unit_price * 100),
                    ],
                    'quantity' => $item->quantity,
                ];
            }

            $checkout_session = Session::create([
                'payment_method_types' => ['card', 'fpx'],
                'line_items' => $line_items,
                'mode' => 'payment',
                'success_url' => env('FRONTEND_URL') . '/store/' . $order->store->store_slug . '/payment-success/' . $order->id,
                'cancel_url' => env('FRONTEND_URL') . '/store/' . $order->store->store_slug . '/payment-failed',
                'metadata' => [
                    'order_id' => $order->id,
                ]
            ]);

            $order->payment_reference = $checkout_session->id;
            $order->save();

            return response()->json(['checkout_url' => $checkout_session->url]);

        } catch (\Stripe\Exception\ApiErrorException $e) {
            return response()->json([
                'message' => 'Stripe API error',
                'error' => $e->getMessage()
            ], 500);
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Failed to create checkout session',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Verify and complete order after successful payment (after redirect from Stripe)
     * POST /api/payments/stripe/verify-payment
     */
    public function verifyPayment(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'order_id' => 'required|exists:orders,id'
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        try {
            $order = Order::with('orderItems')->findOrFail($request->order_id);

            // If already paid, just return success
            if ($order->status === 'paid') {
                return response()->json([
                    'message' => 'Order already verified',
                    'order' => $order
                ]);
            }

            // Retrieve the checkout session from Stripe
            if (!$order->payment_reference) {
                return response()->json(['message' => 'No payment reference found'], 400);
            }

            $session = \Stripe\Checkout\Session::retrieve($order->payment_reference);

            // Check if payment was successful
            if ($session->payment_status === 'paid') {
                // Update order status (stock reduction is handled by webhook)
                $order->status = 'paid';
                $order->save();

                return response()->json([
                    'message' => 'Payment verified successfully',
                    'order' => $order->fresh()
                ]);
            }

            return response()->json([
                'message' => 'Payment not completed',
                'payment_status' => $session->payment_status
            ], 400);

        } catch (\Stripe\Exception\ApiErrorException $e) {
            return response()->json([
                'message' => 'Stripe API error',
                'error' => $e->getMessage()
            ], 500);
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Failed to verify payment',
                'error' => $e->getMessage()
            ], 500);
        }
    }

}
