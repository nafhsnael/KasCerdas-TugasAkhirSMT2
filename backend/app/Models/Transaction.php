<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Transaction extends Model
{
    protected $fillable = [
        'user_id',
        'wallet_id',
        'title',
        'category',
        'note',
        'description_detail',
        'type',
        'amount',
        'date',
        'invoice',
        'receipt_url',
        'metadata',
    ];

    protected $casts = [
        'amount' => 'float',
        'date' => 'date',
        'metadata' => 'json',
    ];

    /**
     * Get the user that owns the transaction.
     */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    /**
     * Get the wallet that owns the transaction.
     */
    public function wallet(): BelongsTo
    {
        return $this->belongsTo(Wallet::class);
    }

    /**
     * Get activity logs for this transaction.
     */
    public function activityLogs(): HasMany
    {
        return $this->hasMany(ActivityLog::class);
    }

    /**
     * Helper: Check if transaction is income or expense
     */
    public function isIncome(): bool
    {
        return $this->type === 'income';
    }

    public function isExpense(): bool
    {
        return $this->type === 'expense';
    }

    /**
     * Helper: Get signed amount (positive for income, negative for expense)
     */
    public function getSignedAmountAttribute(): float
    {
        return $this->isIncome() ? $this->amount : -$this->amount;
    }

    /**
     * Scopes for common queries
     */
    public function scopeByUser($query, int $userId)
    {
        return $query->where('user_id', $userId);
    }

    public function scopeByWallet($query, int $walletId)
    {
        return $query->where('wallet_id', $walletId);
    }

    public function scopeIncome($query)
    {
        return $query->where('type', 'income');
    }

    public function scopeExpense($query)
    {
        return $query->where('type', 'expense');
    }

    public function scopeByCategory($query, string $category)
    {
        return $query->where('category', $category);
    }

    public function scopeBetweenDates($query, $startDate, $endDate)
    {
        return $query->whereDate('date', '>=', $startDate)
                     ->whereDate('date', '<=', $endDate);
    }

    public function scopeOrderByLatest($query)
    {
        return $query->orderByDesc('date')->orderByDesc('id');
    }
}


