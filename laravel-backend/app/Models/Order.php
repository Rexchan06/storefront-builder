<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class Order extends Model
{
    use HasFactory;

    // Status constants
    const STATUS_PENDING = 'pending';
    const STATUS_PAID = 'paid';
    const STATUS_SHIPPED = 'shipped';
    const STATUS_COMPLETED = 'completed';
    const STATUS_CANCELLED = 'cancelled';

    protected $fillable = [
        'store_id',
        'customer_id',
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

    /**
     * Define allowed status transitions
     * Each status can only transition to specific statuses
     */
    protected static $allowedTransitions = [
        self::STATUS_PENDING => [self::STATUS_PAID, self::STATUS_CANCELLED],
        self::STATUS_PAID => [self::STATUS_SHIPPED, self::STATUS_CANCELLED],
        self::STATUS_SHIPPED => [self::STATUS_COMPLETED],
        self::STATUS_COMPLETED => [], // Final status, no transitions allowed
        self::STATUS_CANCELLED => [], // Final status, no transitions allowed
    ];

    /**
     * Check if the order can transition to a new status
     */
    public function canTransitionTo(string $newStatus): bool
    {
        // If the order is already in the new status, allow it (no change needed)
        if ($this->status === $newStatus) {
            return true;
        }

        // Check if the transition is allowed
        $allowedStatuses = self::$allowedTransitions[$this->status] ?? [];
        return in_array($newStatus, $allowedStatuses);
    }

    /**
     * Get all allowed transitions from the current status
     */
    public function getAllowedTransitions(): array
    {
        return self::$allowedTransitions[$this->status] ?? [];
    }

    /**
     * Check if order is pending
     */
    public function isPending(): bool
    {
        return $this->status === self::STATUS_PENDING;
    }

    /**
     * Check if order is paid
     */
    public function isPaid(): bool
    {
        return $this->status === self::STATUS_PAID;
    }

    /**
     * Check if order is shipped
     */
    public function isShipped(): bool
    {
        return $this->status === self::STATUS_SHIPPED;
    }

    /**
     * Check if order is completed
     */
    public function isCompleted(): bool
    {
        return $this->status === self::STATUS_COMPLETED;
    }

    /**
     * Check if order is cancelled
     */
    public function isCancelled(): bool
    {
        return $this->status === self::STATUS_CANCELLED;
    }

    // Relationships

    public function store() {
        return $this->belongsTo(Store::class);
    }

    public function customer() {
        return $this->belongsTo(Customer::class);
    }

    public function orderItems() {
        return $this->hasMany(OrderItem::class);
    }
}
