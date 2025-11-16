<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Order Confirmation</title>
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
            background-color: #00bcd4;
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
        .order-summary {
            background-color: #f9f9f9;
            border: 1px solid #e0e0e0;
            border-radius: 4px;
            padding: 20px;
            margin: 20px 0;
        }
        .order-summary h2 {
            margin-top: 0;
            color: #00bcd4;
            font-size: 18px;
        }
        .order-detail {
            margin: 10px 0;
        }
        .order-detail strong {
            display: inline-block;
            width: 150px;
        }
        .items-table {
            width: 100%;
            border-collapse: collapse;
            margin: 20px 0;
        }
        .items-table th {
            background-color: #f5f5f5;
            padding: 10px;
            text-align: left;
            border-bottom: 2px solid #00bcd4;
        }
        .items-table td {
            padding: 10px;
            border-bottom: 1px solid #e0e0e0;
        }
        .total {
            text-align: right;
            font-size: 18px;
            font-weight: bold;
            color: #00bcd4;
            margin-top: 10px;
        }
        .button {
            display: inline-block;
            padding: 12px 30px;
            background-color: #00bcd4;
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
            <h1>✓ Order Confirmed!</h1>
        </div>

        <div class="content">
            <p>Hi {{ $order->customer_name }},</p>

            <p>Thank you for your order! We've received your order and will notify you when it has been shipped.</p>

            <div class="order-summary">
                <h2>Order Details</h2>
                <div class="order-detail">
                    <strong>Order Number:</strong> #{{ $order->order_number }}
                </div>
                <div class="order-detail">
                    <strong>Order Date:</strong> {{ $order->created_at->format('F d, Y') }}
                </div>
                <div class="order-detail">
                    <strong>Status:</strong> {{ ucfirst($order->status) }}
                </div>
                <div class="order-detail">
                    <strong>Payment Method:</strong> {{ ucfirst($order->payment_method) }}
                </div>
            </div>

            <h3>Shipping Address</h3>
            <p>
                {{ $order->customer_name }}<br>
                {{ $order->customer_address }}<br>
                Phone: {{ $order->customer_phone }}
            </p>

            <h3>Order Items</h3>
            <table class="items-table">
                <thead>
                    <tr>
                        <th>Product</th>
                        <th>Quantity</th>
                        <th>Price</th>
                        <th>Subtotal</th>
                    </tr>
                </thead>
                <tbody>
                    @foreach($order->orderItems as $item)
                    <tr>
                        <td>{{ $item->product->name }}</td>
                        <td>{{ $item->quantity }}</td>
                        <td>RM{{ number_format($item->unit_price, 2) }}</td>
                        <td>RM{{ number_format($item->quantity * $item->unit_price, 2) }}</td>
                    </tr>
                    @endforeach
                </tbody>
            </table>

            <div class="total">
                Total: RM{{ number_format($order->total_amount, 2) }}
            </div>

            @if($order->notes)
            <h3>Order Notes</h3>
            <p>{{ $order->notes }}</p>
            @endif

            <p style="text-align: center;">
                <a href="{{ url('/store/' . $storeSlug . '/orders') }}" class="button">View Order Status</a>
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
