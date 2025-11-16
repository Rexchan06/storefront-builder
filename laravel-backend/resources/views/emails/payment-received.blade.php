<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Payment Received</title>
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
            background-color: #4caf50;
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
            background-color: #e8f5e9;
            border-left: 4px solid #4caf50;
            padding: 15px;
            margin: 20px 0;
            border-radius: 4px;
        }
        .amount {
            font-size: 32px;
            font-weight: bold;
            color: #4caf50;
            text-align: center;
            margin: 20px 0;
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
            width: 120px;
        }
        .button {
            display: inline-block;
            padding: 12px 30px;
            background-color: #4caf50;
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
            <h1>✓ Payment Received!</h1>
        </div>

        <div class="content">
            <p>Hi {{ $order->customer_name }},</p>

            <p>Great news! We've successfully received your payment.</p>

            <div class="amount">
                RM{{ number_format($order->total_amount, 2) }}
            </div>

            <div class="highlight-box">
                <strong>✓ Payment Confirmed</strong><br>
                Your payment has been processed successfully and your order is now confirmed.
            </div>

            <div class="order-info">
                <div>
                    <strong>Order Number:</strong> #{{ $order->order_number }}
                </div>
                <div>
                    <strong>Payment Date:</strong> {{ now()->format('F d, Y') }}
                </div>
                <div>
                    <strong>Payment Method:</strong> {{ ucfirst($order->payment_method) }}
                </div>
                @if($order->payment_reference)
                <div>
                    <strong>Reference:</strong> {{ $order->payment_reference }}
                </div>
                @endif
            </div>

            <h3>What's Next?</h3>
            <p>Your order is being prepared for shipment. We'll send you another email with tracking information once your order has been shipped.</p>

            <p style="text-align: center;">
                <a href="{{ url('/store/' . $storeSlug . '/orders') }}" class="button">Track Your Order</a>
            </p>

            <p>Thank you for shopping with us!</p>

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
