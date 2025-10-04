<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class Product extends Model
{
    use HasFactory;

    protected $fillable = [
        'store_id',
        'name',
        'category',
        'description',
        'price',
        'image',
        'stock_quantity',
        'is_active',
    ];

    protected $casts = [
        'price' => 'decimal:2',
        'is_active' => 'boolean',
    ];

    public function store() {
        return $this->belongsTo(Store::class);
    }

    public function orderItems() {
        return $this->hasMany(OrderItem::class);
    }
}
