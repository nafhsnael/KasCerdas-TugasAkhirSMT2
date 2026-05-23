<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Transaction;
use App\Models\Wallet;
use App\Models\ActivityLog;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;

class TransactionController extends Controller
{
    /**
     * Get all transactions for authenticated user with advanced filtering
     */
    public function index(Request $request)
    {
        $userId = $request->user()->id;
        
        $validated = $request->validate([
            'from' => ['nullable', 'date'],
            'to' => ['nullable', 'date'],
            'category' => ['nullable', 'string', 'max:100'],
            'type' => ['nullable', 'in:income,expense'],
            'wallet_id' => ['nullable', 'integer'],
            'search' => ['nullable', 'string', 'max:255'],
            'limit' => ['nullable', 'integer', 'min:1', 'max:100'],
            'page' => ['nullable', 'integer', 'min:1'],
        ]);

        // Extra validation: wallet_id must belong to authenticated user
        if (!empty($validated['wallet_id'])) {
            $walletExists = Wallet::where('id', $validated['wallet_id'])
                                  ->where('user_id', $userId)
                                  ->exists();
            
            if (!$walletExists) {
                return response()->json([
                    'success' => false,
                    'message' => 'Wallet tidak ditemukan atau bukan milik Anda',
                ], 404);
            }
        }

        $limit = $validated['limit'] ?? 20;
        // CRITICAL: Always filter by authenticated user
        $query = Transaction::where('user_id', $userId);

        // Date range filter
        if (!empty($validated['from']) || !empty($validated['to'])) {
            $from = $validated['from'] ?? now()->subYears(1)->toDateString();
            $to = $validated['to'] ?? now()->toDateString();
            $query->whereDate('date', '>=', $from)
                  ->whereDate('date', '<=', $to);
        }

        // Category filter
        if (!empty($validated['category'])) {
            $query->where('category', $validated['category']);
        }

        // Type filter
        if (!empty($validated['type'])) {
            $query->where('type', $validated['type']);
        }

        // Wallet filter (now verified to belong to user)
        if (!empty($validated['wallet_id'])) {
            $query->where('wallet_id', $validated['wallet_id']);
        }

        // Search filter
        if (!empty($validated['search'])) {
            $search = $validated['search'];
            $query->where(function ($q) use ($search) {
                $q->where('title', 'like', "%{$search}%")
                  ->orWhere('note', 'like', "%{$search}%")
                  ->orWhere('invoice', 'like', "%{$search}%");
            });
        }

        $transactions = $query->orderByLatest()->paginate($limit);

        return response()->json([
            'success' => true,
            'message' => 'Transaksi berhasil diambil',
            'data' => $transactions->items(),
            'meta' => [
                'total' => $transactions->total(),
                'per_page' => $transactions->perPage(),
                'current_page' => $transactions->currentPage(),
                'last_page' => $transactions->lastPage(),
            ],
        ]);
    }

    /**
     * Get single transaction detail
     */
    public function show(Request $request, Transaction $transaction)
    {
        // Authorization check
        if ($transaction->user_id !== $request->user()->id) {
            return response()->json([
                'success' => false,
                'message' => 'Tidak diizinkan mengakses transaksi ini',
            ], 403);
        }

        return response()->json([
            'success' => true,
            'message' => 'Detail transaksi berhasil diambil',
            'data' => $transaction->load('user', 'wallet', 'activityLogs'),
        ]);
    }

    /**
     * Create new transaction
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'wallet_id' => ['required', 'integer', 'exists:wallets,id'],
            'title' => ['required', 'string', 'max:150'],
            'category' => ['required', 'string', 'max:100'],
            'note' => ['nullable', 'string', 'max:1000'],
            'description_detail' => ['nullable', 'string', 'max:5000'],
            'type' => ['required', 'in:income,expense'],
            'amount' => ['required', 'numeric', 'min:0.01'],
            'date' => ['required', 'date', 'date_format:Y-m-d'],
            'receipt' => ['nullable', 'file', 'mimes:pdf,jpg,jpeg,png', 'max:5120'], // 5MB
        ]);

        // Verify wallet belongs to user
        $wallet = Wallet::where('id', $validated['wallet_id'])
                        ->where('user_id', $request->user()->id)
                        ->firstOrFail();

        // Handle receipt upload
        $receiptUrl = null;
        if ($request->hasFile('receipt')) {
            $receiptUrl = $request->file('receipt')->store('receipts', 'public');
        }

        // Create transaction
        $transaction = Transaction::create([
            'user_id' => $request->user()->id,
            'wallet_id' => $validated['wallet_id'],
            'title' => $validated['title'],
            'category' => $validated['category'],
            'note' => $validated['note'] ?? null,
            'description_detail' => $validated['description_detail'] ?? null,
            'type' => $validated['type'],
            'amount' => (float) $validated['amount'],
            'date' => $validated['date'],
            'receipt_url' => $receiptUrl,
            'invoice' => $this->generateInvoiceNumber($request->user()->id, $validated['date']),
        ]);

        // Update wallet balance
        $this->updateWalletBalance($wallet, $transaction->type, $transaction->amount, 'add');

        // Log activity
        $this->logActivity($request->user()->id, 'CREATE', 'Transaction', $transaction->id, [
            'title' => $transaction->title,
            'amount' => $transaction->amount,
            'type' => $transaction->type,
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Transaksi berhasil dibuat',
            'data' => $transaction,
        ], 201);
    }

    /**
     * Update transaction
     */
    public function update(Request $request, Transaction $transaction)
    {
        // Authorization check
        if ($transaction->user_id !== $request->user()->id) {
            return response()->json([
                'success' => false,
                'message' => 'Tidak diizinkan mengubah transaksi ini',
            ], 403);
        }

        $validated = $request->validate([
            'wallet_id' => ['nullable', 'integer', 'exists:wallets,id'],
            'title' => ['nullable', 'string', 'max:150'],
            'category' => ['nullable', 'string', 'max:100'],
            'note' => ['nullable', 'string', 'max:1000'],
            'description_detail' => ['nullable', 'string', 'max:5000'],
            'type' => ['nullable', 'in:income,expense'],
            'amount' => ['nullable', 'numeric', 'min:0.01'],
            'date' => ['nullable', 'date', 'date_format:Y-m-d'],
            'receipt' => ['nullable', 'file', 'mimes:pdf,jpg,jpeg,png', 'max:5120'],
        ]);

        // Store old values for comparison
        $oldAmount = $transaction->amount;
        $oldType = $transaction->type;
        $oldWalletId = $transaction->wallet_id;

        // Handle wallet change and balance reconciliation
        if (!empty($validated['wallet_id']) && $validated['wallet_id'] !== $oldWalletId) {
            // Verify old wallet belongs to user
            $oldWallet = Wallet::where('id', $oldWalletId)
                              ->where('user_id', $request->user()->id)
                              ->firstOrFail();
            $this->updateWalletBalance($oldWallet, $oldType, $oldAmount, 'subtract');

            // Verify new wallet belongs to user
            $newWallet = Wallet::where('id', $validated['wallet_id'])
                              ->where('user_id', $request->user()->id)
                              ->firstOrFail();
            $validated['wallet_id'] = $newWallet->id;
        }

        // Handle amount or type change
        if (!empty($validated['amount']) || !empty($validated['type'])) {
            $newAmount = $validated['amount'] ?? $oldAmount;
            $newType = $validated['type'] ?? $oldType;
            $currentWallet = Wallet::findOrFail($validated['wallet_id'] ?? $oldWalletId);

            // Reverse old amount
            $this->updateWalletBalance($currentWallet, $oldType, $oldAmount, 'subtract');

            // Add new amount
            $this->updateWalletBalance($currentWallet, $newType, $newAmount, 'add');
        }

        // Handle receipt upload
        if ($request->hasFile('receipt')) {
            // Delete old receipt if exists
            if ($transaction->receipt_url) {
                \Storage::disk('public')->delete($transaction->receipt_url);
            }
            $validated['receipt_url'] = $request->file('receipt')->store('receipts', 'public');
        }

        // Update transaction
        $transaction->update(array_filter($validated, fn($val) => $val !== null && $val !== ''));

        // Log activity
        $this->logActivity($request->user()->id, 'UPDATE', 'Transaction', $transaction->id, [
            'old' => [
                'amount' => $oldAmount,
                'type' => $oldType,
            ],
            'new' => [
                'amount' => $transaction->amount,
                'type' => $transaction->type,
            ],
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Transaksi berhasil diperbarui',
            'data' => $transaction->fresh(),
        ]);
    }

    /**
     * Delete transaction
     */
    public function destroy(Request $request, Transaction $transaction)
    {
        // Authorization check
        if ($transaction->user_id !== $request->user()->id) {
            return response()->json([
                'success' => false,
                'message' => 'Tidak diizinkan menghapus transaksi ini',
            ], 403);
        }

        // Get wallet before deletion
        $wallet = $transaction->wallet;

        // Delete receipt file if exists
        if ($transaction->receipt_url) {
            \Storage::disk('public')->delete($transaction->receipt_url);
        }

        // Reverse wallet balance
        $this->updateWalletBalance($wallet, $transaction->type, $transaction->amount, 'subtract');

        // Log activity
        $this->logActivity($request->user()->id, 'DELETE', 'Transaction', $transaction->id, [
            'title' => $transaction->title,
            'amount' => $transaction->amount,
            'type' => $transaction->type,
        ]);

        $transaction->delete();

        return response()->json([
            'success' => true,
            'message' => 'Transaksi berhasil dihapus',
        ]);
    }

    /**
     * Get transaction summary (income, expense, balance)
     */
    public function summary(Request $request)
    {
        $userId = $request->user()->id;
        
        $validated = $request->validate([
            'from' => ['nullable', 'date'],
            'to' => ['nullable', 'date'],
            'wallet_id' => ['nullable', 'integer'],
        ]);

        // Extra validation: wallet_id must belong to authenticated user
        if (!empty($validated['wallet_id'])) {
            $walletExists = Wallet::where('id', $validated['wallet_id'])
                                  ->where('user_id', $userId)
                                  ->exists();
            
            if (!$walletExists) {
                return response()->json([
                    'success' => false,
                    'message' => 'Wallet tidak ditemukan atau bukan milik Anda',
                ], 404);
            }
        }

        // CRITICAL: Always filter by authenticated user
        $query = Transaction::where('user_id', $userId);

        // Date range
        if (!empty($validated['from']) || !empty($validated['to'])) {
            $from = $validated['from'] ?? now()->subYears(1)->toDateString();
            $to = $validated['to'] ?? now()->toDateString();
            $query->whereDate('date', '>=', $from)
                  ->whereDate('date', '<=', $to);
        }

        // Wallet filter (now verified to belong to user)
        if (!empty($validated['wallet_id'])) {
            $query->where('wallet_id', $validated['wallet_id']);
        }

        $totalIncome = $query->replicate()->income()->sum('amount');
        $totalExpense = $query->replicate()->expense()->sum('amount');
        $balance = $totalIncome - $totalExpense;
        $transactionCount = $query->count();

        // Get top categories
        $topCategories = $query->replicate()
                               ->select('category')
                               ->selectRaw('SUM(CASE WHEN type = "expense" THEN amount ELSE 0 END) as total_expense')
                               ->selectRaw('SUM(CASE WHEN type = "income" THEN amount ELSE 0 END) as total_income')
                               ->selectRaw('COUNT(*) as count')
                               ->groupBy('category')
                               ->orderByDesc('count')
                               ->limit(5)
                               ->get();

        return response()->json([
            'success' => true,
            'message' => 'Summary transaksi berhasil diambil',
            'data' => [
                'total_income' => (float) $totalIncome,
                'total_expense' => (float) $totalExpense,
                'balance' => (float) $balance,
                'transaction_count' => $transactionCount,
                'top_categories' => $topCategories,
            ],
        ]);
    }

    /**
     * Helper: Update wallet balance
     */
    protected function updateWalletBalance(Wallet $wallet, string $type, float $amount, string $operation = 'add')
    {
        if ($operation === 'add') {
            $wallet->balance += ($type === 'income' ? $amount : -$amount);
        } else {
            $wallet->balance -= ($type === 'income' ? $amount : -$amount);
        }
        $wallet->save();
    }

    /**
     * Helper: Generate unique invoice number
     */
    protected function generateInvoiceNumber(int $userId, string $date): string
    {
        $year = substr($date, 0, 4);
        
        // Get latest invoice number for this year
        $latestInvoice = Transaction::byUser($userId)
                                   ->whereYear('date', $year)
                                   ->orderByDesc('invoice')
                                   ->value('invoice');

        if ($latestInvoice) {
            preg_match('/INV-\d{4}-(\d{4})/', $latestInvoice, $matches);
            $nextNumber = intval($matches[1] ?? 0) + 1;
        } else {
            $nextNumber = 1;
        }

        return sprintf('INV-%s-%04d', $year, $nextNumber);
    }

    /**
     * Helper: Log activity
     */
    protected function logActivity(int $userId, string $action, string $modelType, int $modelId, array $data = [])
    {
        ActivityLog::create([
            'user_id' => $userId,
            'action' => $action,
            'model_type' => $modelType,
            'model_id' => $modelId,
            'data' => $data,
            'ip_address' => request()->ip(),
            'level' => 'info',
        ]);
    }
}

