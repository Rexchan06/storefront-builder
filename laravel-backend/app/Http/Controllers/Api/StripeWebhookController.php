<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Order;
use App\Models\Product;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Mail;
use App\Mail\PaymentReceivedMail;
use Stripe\Stripe;
use Stripe\Webhook;
use Stripe\Exception\SignatureVerificationException;

class StripeWebhookController extends Controller
{
    /**
     * Handle Stripe webhook events
     * POST /api/webhooks/stripe
     */
    public function handleWebhook(Request $request)
    {
        // Set Stripe API key
        Stripe::setApiKey(env('STRIPE_SECRET_KEY'));

        $payload = $request->getContent();
        $sigHeader = $request->header('Stripe-Signature');
        $webhookSecret = env('STRIPE_WEBHOOK_SECRET');

        try {
            // Verify webhook signature
            $event = Webhook::constructEvent(
                $payload,
                $sigHeader,
                $webhookSecret
            );

            // Handle different event types
            switch ($event->type) {
                case 'checkout.session.completed':
                    $this->handleCheckoutCompleted($event->data->object);
                    break;

                case 'payment_intent.succeeded':
                    $this->handlePaymentSucceeded($event->data->object);
                    break;

                case 'payment_intent.payment_failed':
                    $this->handlePaymentFailed($event->data->object);
                    break;

                default:
                    Log::info('Unhandled Stripe webhook event: ' . $event->type);
            }

            return response()->json(['status' => 'success']);

        } catch (SignatureVerificationException $e) {
            Log::error('Stripe webhook signature verification failed: ' . $e->getMessage());
            return response()->json(['error' => 'Invalid signature'], 400);
        } catch (\Exception $e) {
            Log::error('Stripe webhook error: ' . $e->getMessage());
            return response()->json(['error' => 'Webhook handler failed'], 500);
        }
    }

    /**
     * Handle completed checkout session
     */
    private function handleCheckoutCompleted($session)
    {
        DB::beginTransaction();

        try {
            // Get order ID from metadata
            $orderId = $session->metadata->order_id ?? null;

            if (!$orderId) {
                Log::warning('Checkout completed but no order_id in metadata', [
                    'session_id' => $session->id
                ]);
                return;
            }

            $order = Order::find($orderId);

            if (!$order) {
                Log::error('Order not found for checkout session', [
                    'order_id' => $orderId,
                    'session_id' => $session->id
                ]);
                return;
            }

            // Skip if already paid (prevent double-processing)
            if ($order->status === 'paid') {
                Log::info('Order already paid, skipping webhook processing', [
                    'order_id' => $order->id,
                    'order_number' => $order->order_number
                ]);
                return;
            }

            // Update order status to paid
            $order->status = 'paid';
            $order->save();

            // Reduce stock quantity for all ordered products
            foreach ($order->orderItems as $orderItem) {
                $product = Product::find($orderItem->product_id);

                if ($product) {
                    // Reduce stock
                    $newStock = $product->stock_quantity - $orderItem->quantity;

                    // Ensure stock doesn't go below zero
                    $product->stock_quantity = max(0, $newStock);
                    $product->save();

                    Log::info('Stock reduced for product', [
                        'product_id' => $product->id,
                        'product_name' => $product->name,
                        'quantity_sold' => $orderItem->quantity,
                        'new_stock' => $product->stock_quantity
                    ]);
                }
            }

            DB::commit();

            // Send payment received email
            try {
                Mail::to($order->customer_email)->send(new PaymentReceivedMail($order));
            } catch (\Exception $e) {
                Log::error('Failed to send payment received email', [
                    'order_id' => $order->id,
                    'error' => $e->getMessage()
                ]);
            }

            Log::info('Checkout processed successfully', [
                'order_id' => $order->id,
                'order_number' => $order->order_number,
                'session_id' => $session->id,
                'amount' => $session->amount_total / 100
            ]);

        } catch (\Exception $e) {
            DB::rollBack();
            Log::error('Failed to process checkout completion', [
                'error' => $e->getMessage(),
                'session_id' => $session->id
            ]);
        }
    }

    /**
     * Handle successful payment
     */
    private function handlePaymentSucceeded($paymentIntent)
    {
        DB::beginTransaction();

        try {
            // Get order ID from metadata
            $orderId = $paymentIntent->metadata->order_id ?? null;

            if (!$orderId) {
                Log::warning('Payment succeeded but no order_id in metadata', [
                    'payment_intent_id' => $paymentIntent->id
                ]);
                return;
            }

            $order = Order::find($orderId);

            if (!$order) {
                Log::error('Order not found for payment intent', [
                    'order_id' => $orderId,
                    'payment_intent_id' => $paymentIntent->id
                ]);
                return;
            }

            // Skip if already paid (prevent double-processing)
            if ($order->status === 'paid') {
                Log::info('Order already paid, skipping webhook processing', [
                    'order_id' => $order->id,
                    'order_number' => $order->order_number
                ]);
                return;
            }

            // Update order status to paid
            $order->status = 'paid';
            $order->payment_reference = $paymentIntent->id;
            $order->save();

            // Reduce stock quantity for all ordered products
            foreach ($order->orderItems as $orderItem) {
                $product = Product::find($orderItem->product_id);

                if ($product) {
                    // Reduce stock
                    $newStock = $product->stock_quantity - $orderItem->quantity;

                    // Ensure stock doesn't go below zero
                    $product->stock_quantity = max(0, $newStock);
                    $product->save();

                    Log::info('Stock reduced for product', [
                        'product_id' => $product->id,
                        'product_name' => $product->name,
                        'quantity_sold' => $orderItem->quantity,
                        'new_stock' => $product->stock_quantity
                    ]);
                }
            }

            DB::commit();

            // Send payment received email
            try {
                Mail::to($order->customer_email)->send(new PaymentReceivedMail($order));
            } catch (\Exception $e) {
                Log::error('Failed to send payment received email', [
                    'order_id' => $order->id,
                    'error' => $e->getMessage()
                ]);
            }

            Log::info('Payment processed successfully', [
                'order_id' => $order->id,
                'order_number' => $order->order_number,
                'payment_intent_id' => $paymentIntent->id,
                'amount' => $paymentIntent->amount / 100
            ]);

        } catch (\Exception $e) {
            DB::rollBack();
            Log::error('Failed to process successful payment', [
                'error' => $e->getMessage(),
                'payment_intent_id' => $paymentIntent->id
            ]);
        }
    }

    /**
     * Handle failed payment
     */
    private function handlePaymentFailed($paymentIntent)
    {
        try {
            // Get order ID from metadata
            $orderId = $paymentIntent->metadata->order_id ?? null;

            if (!$orderId) {
                Log::warning('Payment failed but no order_id in metadata', [
                    'payment_intent_id' => $paymentIntent->id
                ]);
                return;
            }

            $order = Order::find($orderId);

            if (!$order) {
                Log::error('Order not found for failed payment', [
                    'order_id' => $orderId,
                    'payment_intent_id' => $paymentIntent->id
                ]);
                return;
            }

            // Keep order status as pending (don't reduce stock)
            Log::info('Payment failed', [
                'order_id' => $order->id,
                'order_number' => $order->order_number,
                'payment_intent_id' => $paymentIntent->id,
                'failure_code' => $paymentIntent->last_payment_error->code ?? 'unknown',
                'failure_message' => $paymentIntent->last_payment_error->message ?? 'No error message'
            ]);

        } catch (\Exception $e) {
            Log::error('Failed to process payment failure', [
                'error' => $e->getMessage(),
                'payment_intent_id' => $paymentIntent->id
            ]);
        }
    }
}
