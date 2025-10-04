<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class Order extends Model
{
    use HasFactory;

    protected $fillable = [
        'store_id',
        'order_number',
        'customer_name',
        'customer_email',
        'customer_phone',
        'customer_address',
        'total_amount',
        'status',
        'payment_method',
        'payment_reference',
        'notes',
    ];

    protected $casts = [
        'total_amount' => 'decimal:2'
    ];

    public function store() {
        return $this->belongsTo(Store::class);
    }
    
    public function orderItems() {
        return $this->hasMany(OrderItem::class);
    }
}
