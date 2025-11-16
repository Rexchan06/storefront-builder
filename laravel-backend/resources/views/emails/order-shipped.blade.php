<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Order Shipped</title>
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
            background-color: #ff9800;
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
        .highlight-box {
            background-color: #fff3e0;
            border-left: 4px solid #ff9800;
            padding: 15px;
            margin: 20px 0;
            border-radius: 4px;
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
        .shipping-address {
            background-color: #f5f5f5;
            padding: 15px;
            border-radius: 4px;
            margin: 15px 0;
        }
        .button {
            display: inline-block;
            padding: 12px 30px;
            background-color: #ff9800;
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
            <h1>📦 Your Order Has Shipped!</h1>
        </div>

        <div class="content">
            <p>Hi {{ $order->customer_name }},</p>

            <p>Good news! Your order has been shipped and is on its way to you.</p>

            <div class="highlight-box">
                <strong>🚚 Order Status: Shipped</strong><br>
                Your package is en route to your delivery address.
            </div>

            <div class="order-info">
                <div>
                    <strong>Order Number:</strong> #{{ $order->order_number }}
                </div>
                <div>
                    <strong>Shipped On:</strong> {{ now()->format('F d, Y') }}
                </div>
                <div>
                    <strong>Total Amount:</strong> RM{{ number_format($order->total_amount, 2) }}
                </div>
            </div>

            <h3>Shipping Address</h3>
            <div class="shipping-address">
                {{ $order->customer_name }}<br>
                {{ $order->customer_address }}<br>
                Phone: {{ $order->customer_phone }}
            </div>

            <h3>What's Next?</h3>
            <p>Your order should arrive within the next few business days. You will receive a notification once it has been delivered.</p>

            <p>Please ensure someone is available to receive the package at the delivery address.</p>

            <p style="text-align: center;">
                <a href="{{ url('/store/' . $storeSlug . '/orders') }}" class="button">Track Delivery</a>
            </p>

            <p>If you have any questions about your delivery, please don't hesitate to contact us.</p>

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
