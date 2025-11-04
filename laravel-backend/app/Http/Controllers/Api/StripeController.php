<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Order;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;
use Stripe\Stripe;
use Stripe\PaymentIntent;

class StripeController extends Controller
{
    public function __construct()
    {
        // Set Stripe API key
        Stripe::setApiKey(env('STRIPE_SECRET_KEY'));
    }

    /**
     * Create payment intent
     * POST /api/payments/stripe/create-intent
     */
    public function createPaymentIntent(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'order_id' => 'required|exists:orders,id',
            'amount' => 'required|numeric|min:0.50'
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        try {
            $order = Order::findOrFail($request->order_id);

            // Convert amount to smallest currency unit (sen for MYR)
            $amountInCents = (int) ($request->amount * 100);

            // Minimum amount validation (RM 0.50)
            if ($amountInCents < 50) {
                return response()->json([
                    'message' => 'Amount must be at least RM 0.50'
                ], 422);
            }

            // Create payment intent
            $paymentIntent = PaymentIntent::create([
                'amount' => $amountInCents,
                'currency' => 'myr',
                'payment_method_types' => ['card', 'fpx'],
                'metadata' => [
                    'order_id' => $order->id,
                    'order_number' => $order->order_number,
                    'customer_email' => $order->customer_email,
                    'customer_name' => $order->customer_name
                ],
                'description' => "Order {$order->order_number}"
            ]);

            return response()->json([
                'client_secret' => $paymentIntent->client_secret,
                'payment_intent_id' => $paymentIntent->id,
                'amount' => $request->amount,
                'currency' => 'MYR'
            ]);

        } catch (\Stripe\Exception\ApiErrorException $e) {
            return response()->json([
                'message' => 'Stripe API error',
                'error' => $e->getMessage()
            ], 500);
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Failed to create payment intent',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Confirm payment
     * POST /api/payments/stripe/confirm
     */
    public function confirmPayment(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'payment_intent_id' => 'required|string',
            'order_id' => 'required|exists:orders,id'
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        try {
            // Retrieve payment intent from Stripe
            $paymentIntent = PaymentIntent::retrieve($request->payment_intent_id);

            // Check payment status
            if ($paymentIntent->status === 'succeeded') {
                $order = Order::findOrFail($request->order_id);

                // Update order status to paid
                $order->status = 'paid';
                $order->payment_reference = $paymentIntent->id;
                $order->save();

                return response()->json([
                    'message' => 'Payment confirmed successfully',
                    'order' => $order->load('orderItems.product'),
                    'payment_status' => $paymentIntent->status
                ]);
            }

            return response()->json([
                'message' => 'Payment not successful',
                'payment_status' => $paymentIntent->status
            ], 400);

        } catch (\Stripe\Exception\ApiErrorException $e) {
            return response()->json([
                'message' => 'Stripe API error',
                'error' => $e->getMessage()
            ], 500);
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Failed to confirm payment',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Check payment status
     * GET /api/payments/{reference}/status
     */
    public function checkPaymentStatus($reference)
    {
        try {
            $order = Order::where('payment_reference', $reference)->first();

            if (!$order) {
                return response()->json(['message' => 'Order not found'], 404);
            }

            // Retrieve payment intent from Stripe
            $paymentIntent = PaymentIntent::retrieve($reference);

            return response()->json([
                'order_id' => $order->id,
                'order_number' => $order->order_number,
                'order_status' => $order->status,
                'payment_status' => $paymentIntent->status,
                'amount' => $paymentIntent->amount / 100,
                'currency' => strtoupper($paymentIntent->currency)
            ]);

        } catch (\Stripe\Exception\ApiErrorException $e) {
            return response()->json([
                'message' => 'Stripe API error',
                'error' => $e->getMessage()
            ], 500);
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Failed to check payment status',
                'error' => $e->getMessage()
            ], 500);
        }
    }
}
