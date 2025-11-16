<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Order Status Update</title>
    <style>
        body {
            font-family: Arial, sans-serif;
            line-height: 1.6;
            color: #333;
            background-color: #f5f5f5;
            margin: 0;
            padding: 0;
        }
        .container {
            max-width: 600px;
            margin: 20px auto;
            background-color: #ffffff;
            border-radius: 8px;
            overflow: hidden;
            box-shadow: 0 2px 4px rgba(0,0,0,0.1);
        }
        .header {
            background-color: #2196F3;
            color: white;
            padding: 30px 20px;
            text-align: center;
        }
        .header h1 {
            margin: 0;
            font-size: 24px;
        }
        .content {
            padding: 30px 20px;
        }
        .status-update {
            background-color: #e3f2fd;
            border: 2px solid #2196F3;
            border-radius: 8px;
            padding: 20px;
            margin: 20px 0;
            text-align: center;
        }
        .status-badge {
            display: inline-block;
            padding: 8px 16px;
            border-radius: 20px;
            font-weight: bold;
            margin: 5px;
            text-transform: uppercase;
            font-size: 14px;
        }
        .status-pending {
            background-color: #fff3e0;
            color: #f57c00;
        }
        .status-paid {
            background-color: #e8f5e9;
            color: #2e7d32;
        }
        .status-shipped {
            background-color: #e3f2fd;
            color: #1976d2;
        }
        .status-completed {
            background-color: #c8e6c9;
            color: #1b5e20;
        }
        .status-cancelled {
            background-color: #ffebee;
            color: #c62828;
        }
        .order-info {
            background-color: #f9f9f9;
            border-radius: 4px;
            padding: 20px;
            margin: 20px 0;
        }
        .order-info div {
            margin: 10px 0;
        }
        .order-info strong {
            display: inline-block;
            width: 150px;
        }
        .button {
            display: inline-block;
            padding: 12px 30px;
            background-color: #2196F3;
            color: white;
            text-decoration: none;
            border-radius: 4px;
            margin: 20px 0;
        }
        .footer {
            background-color: #f5f5f5;
            padding: 20px;
            text-align: center;
            font-size: 12px;
            color: #666;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>Order Status Updated</h1>
        </div>

        <div class="content">
            <p>Hi {{ $order->customer_name }},</p>

            <p>Your order status has been updated.</p>

            <div class="status-update">
                <p style="margin: 0 0 15px 0; font-size: 14px; color: #666;">Status Changed From:</p>
                <span class="status-badge status-{{ $previousStatus }}">{{ ucfirst($previousStatus) }}</span>
                <p style="margin: 15px 0; font-size: 20px;">→</p>
                <span class="status-badge status-{{ $newStatus }}">{{ ucfirst($newStatus) }}</span>
            </div>

            <div class="order-info">
                <div>
                    <strong>Order Number:</strong> #{{ $order->order_number }}
                </div>
                <div>
                    <strong>Order Date:</strong> {{ $order->created_at->format('F d, Y') }}
                </div>
                <div>
                    <strong>Current Status:</strong> <strong style="color: #2196F3;">{{ ucfirst($newStatus) }}</strong>
                </div>
                <div>
                    <strong>Total Amount:</strong> RM{{ number_format($order->total_amount, 2) }}
                </div>
            </div>

            @if($newStatus === 'paid')
            <p><strong>✓ Payment Received</strong><br>
            Your payment has been confirmed and your order is being processed.</p>
            @elseif($newStatus === 'shipped')
            <p><strong>📦 Order Shipped</strong><br>
            Your order has been dispatched and is on its way to you.</p>
            @elseif($newStatus === 'completed')
            <p><strong>✓ Order Completed</strong><br>
            Your order has been successfully delivered. We hope you enjoy your purchase!</p>
            @elseif($newStatus === 'cancelled')
            <p><strong>✗ Order Cancelled</strong><br>
            This order has been cancelled. If you have any questions, please contact us.</p>
            @endif

            <p style="text-align: center;">
                <a href="{{ url('/store/' . $storeSlug . '/orders') }}" class="button">View Order Details</a>
            </p>

            <p>If you have any questions about your order, please don't hesitate to contact us.</p>

            <p>
                Best regards,<br>
                <strong>{{ $storeName }}</strong>
            </p>
        </div>

        <div class="footer">
            <p>&copy; {{ date('Y') }} {{ $storeName }}. All rights reserved.</p>
            <p>This is an automated email. Please do not reply to this message.</p>
        </div>
    </div>
</body>
</html>
