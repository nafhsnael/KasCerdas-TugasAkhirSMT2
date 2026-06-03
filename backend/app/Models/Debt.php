<?php

namespace App\Models;

use App\Models\User;
use App\Models\Wallet;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

/**
 * App\Models\Debt
 *
 * @property \Illuminate\Support\Carbon|null $due_date
 */
class Debt extends Model
{
    protected $fillable = [
        'user_id',
        'wallet_id',
        'creditor_name',
        'amount',
        'due_date',
        'status',
        'note',
        'paid_amount',
    ];

    protected $casts = [
        'amount' => 'decimal:2',
        'paid_amount' => 'decimal:2',
        'due_date' => 'date',
        'created_at' => 'datetime',
        'updated_at' => 'datetime',
    ];

    /**
     * Get the user that owns the debt
     */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    /**
     * Get the wallet associated with the debt
     */
    public function wallet(): BelongsTo
    {
        return $this->belongsTo(Wallet::class);
    }

    /**
     * Calculate remaining amount to be paid
     */
    public function getRemainingAmountAttribute(): float
    {
        return (float) ($this->amount - $this->paid_amount);
    }

    /**
     * Check if debt is overdue
     */
    public function getIsOverdueAttribute(): bool
    {
        /** @var \Illuminate\Support\Carbon|null $dueDate */
        $dueDate = $this->due_date;
        return $this->status !== 'paid' && $dueDate && $dueDate->lt(now()->startOfDay());
    }

    /**
     * Get days until due date (negative if overdue)
     */
    public function getDaysUntilDueAttribute(): int
    {
        return now()->diffInDays($this->due_date, false);
    }
}
