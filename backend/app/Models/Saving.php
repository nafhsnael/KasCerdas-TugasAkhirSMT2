<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Saving extends Model
{
    protected $fillable = [
        'user_id',
        'wallet_id',
        'name',
        'target_amount',
        'current_amount',
        'target_date',
        'category',
        'note',
        'status',
    ];

    protected $casts = [
        'target_amount' => 'decimal:2',
        'current_amount' => 'decimal:2',
        'target_date' => 'date',
        'created_at' => 'datetime',
        'updated_at' => 'datetime',
    ];

    /**
     * Get the user that owns the saving
     */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    /**
     * Get the wallet associated with the saving
     */
    public function wallet(): BelongsTo
    {
        return $this->belongsTo(Wallet::class);
    }

    /**
     * Calculate remaining amount needed
     */
    public function getRemainingAmountAttribute(): float
    {
        return (float) max(0, $this->target_amount - $this->current_amount);
    }

    /**
     * Calculate progress percentage
     */
    public function getProgressPercentAttribute(): float
    {
        if ($this->target_amount == 0) {
            return 0;
        }
        return (float) min(100, ($this->current_amount / $this->target_amount) * 100);
    }

    /**
     * Get days until target date
     */
    public function getDaysUntilTargetAttribute(): int
    {
        $daysUntil = (int) now()->parse($this->target_date)->diffInDays(now(), false);
        return $daysUntil;
    }

    /**
     * Calculate monthly target
     */
    public function getMonthlyTargetAttribute(): float
    {
        $daysUntil = $this->days_until_target;
        if ($daysUntil <= 0) {
            return 0;
        }
        $monthsUntil = max(1, ceil($daysUntil / 30));
        return (float) ($this->remaining_amount / $monthsUntil);
    }

    /**
     * Check if target is completed
     */
    public function getIsCompletedAttribute(): bool
    {
        return $this->current_amount >= $this->target_amount;
    }
}
