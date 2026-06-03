<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Debt;
use App\Models\Wallet;
use Illuminate\Http\Request;

class DebtController extends Controller
{
    /**
     * Get all debts for authenticated user
     */
    public function index(Request $request)
    {
        $validated = $request->validate([
            'status' => ['nullable', 'in:active,paid,overdue'],
            'wallet_id' => ['nullable', 'integer'],
            'search' => ['nullable', 'string', 'max:255'],
        ]);

        $userId = $request->user()->id;

        // Verify wallet belongs to user if provided
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

        $query = Debt::where('user_id', $userId);

        if (!empty($validated['status'])) {
            $query->where('status', $validated['status']);
        }

        if (!empty($validated['wallet_id'])) {
            $query->where('wallet_id', $validated['wallet_id']);
        }

        if (!empty($validated['search'])) {
            $search = $validated['search'];
            $query->where(function ($q) use ($search) {
                $q->where('creditor_name', 'like', "%{$search}%")
                  ->orWhere('note', 'like', "%{$search}%");
            });
        }

        $debts = $query->orderBy('due_date')->get();

        // Add computed attributes
        $debts = $debts->map(function ($debt) use ($userId) {
            return $this->formatDebtWithDynamicPaid($debt, $userId);
        });

        return response()->json([
            'success' => true,
            'message' => 'Hutang berhasil diambil',
            'data' => $debts,
        ]);
    }

    /**
     * Get single debt detail
     */
    public function show(Request $request, Debt $debt)
    {
        // Authorization check
        if ($debt->user_id !== $request->user()->id) {
            return response()->json([
                'success' => false,
                'message' => 'Tidak diizinkan mengakses hutang ini',
            ], 403);
        }

        return response()->json([
            'success' => true,
            'message' => 'Detail hutang berhasil diambil',
            'data' => $this->formatDebtWithDynamicPaid($debt, $request->user()->id),
        ]);
    }

    /**
     * Create new debt
     */
    public function store(Request $request)
    {
        $userId = $request->user()->id;
        
        $validated = $request->validate([
            'wallet_id' => ['nullable', 'integer'],
            'creditor_name' => ['required', 'string', 'max:150'],
            'amount' => ['required', 'numeric', 'min:0.01'],
            'due_date' => ['required', 'date', 'date_format:Y-m-d'],
            'note' => ['nullable', 'string', 'max:1000'],
            'status' => ['nullable', 'in:active,paid,overdue'],
        ]);

        // Automatically resolve default wallet if not provided or doesn't belong to user
        $walletId = $validated['wallet_id'] ?? null;
        if ($walletId) {
            $walletExists = Wallet::where('id', $walletId)
                                  ->where('user_id', $userId)
                                  ->exists();
            if (!$walletExists) {
                $walletId = null;
            }
        }

        if (!$walletId) {
            $wallet = Wallet::where('user_id', $userId)->first();
            if (!$wallet) {
                $wallet = Wallet::create([
                    'user_id' => $userId,
                    'name' => 'Default Wallet',
                    'balance' => 0,
                ]);
            }
            $walletId = $wallet->id;
        }

        $debt = Debt::create([
            'user_id' => $userId,
            'wallet_id' => $walletId,
            'creditor_name' => $validated['creditor_name'],
            'amount' => (float) $validated['amount'],
            'due_date' => $validated['due_date'],
            'note' => $validated['note'] ?? null,
            'status' => $validated['status'] ?? 'active',
            'paid_amount' => 0,
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Hutang berhasil ditambahkan',
            'data' => $this->formatDebtWithDynamicPaid($debt->fresh(), $userId),
        ], 201);
    }

    /**
     * Update debt
     */
    public function update(Request $request, Debt $debt)
    {
        // Authorization check
        if ($debt->user_id !== $request->user()->id) {
            return response()->json([
                'success' => false,
                'message' => 'Tidak diizinkan mengubah hutang ini',
            ], 403);
        }

        $validated = $request->validate([
            'creditor_name' => ['nullable', 'string', 'max:150'],
            'amount' => ['nullable', 'numeric', 'min:0.01'],
            'due_date' => ['nullable', 'date', 'date_format:Y-m-d'],
            'note' => ['nullable', 'string', 'max:1000'],
            'status' => ['nullable', 'in:active,paid,overdue'],
            'paid_amount' => ['nullable', 'numeric', 'min:0'],
        ]);

        $debt->update(array_filter($validated, fn($value) => !is_null($value)));

        return response()->json([
            'success' => true,
            'message' => 'Hutang berhasil diperbarui',
            'data' => $this->formatDebtWithDynamicPaid($debt->fresh(), $request->user()->id),
        ]);
    }

    /**
     * Delete debt
     */
    public function destroy(Request $request, Debt $debt)
    {
        // Authorization check
        if ($debt->user_id !== $request->user()->id) {
            return response()->json([
                'success' => false,
                'message' => 'Tidak diizinkan menghapus hutang ini',
            ], 403);
        }

        $debt->delete();

        return response()->json([
            'success' => true,
            'message' => 'Hutang berhasil dihapus',
        ]);
    }

    /**
     * Helper: Format debt with dynamic transaction payment aggregation
     */
    protected function formatDebtWithDynamicPaid($debt, $userId)
    {
        $isPiutang = str_contains(strtolower($debt->creditor_name), 'piutang') || str_contains(strtolower($debt->note), 'piutang');
        $type = $isPiutang ? 'income' : 'expense';

        $dynamicPaid = \App\Models\Transaction::where('user_id', $userId)
            ->where('type', $type)
            ->where(function ($q) {
                $q->whereRaw('LOWER(category) LIKE ?', ['%hutang%'])
                  ->orWhereRaw('LOWER(category) LIKE ?', ['%piutang%']);
            })
            ->whereRaw('LOWER(TRIM(title)) = ?', [strtolower(trim($debt->creditor_name))])
            ->sum('amount');

        $debtPaidAmount = $dynamicPaid > 0 ? (float) $dynamicPaid : (float) $debt->paid_amount;
        $remaining = max(0, (float) $debt->amount - $debtPaidAmount);

        $status = $debt->status;
        if ($debtPaidAmount >= (float) $debt->amount) {
            $status = 'paid';
        }

        return [
            ...$debt->toArray(),
            'paid_amount' => $debtPaidAmount,
            'remaining_amount' => $remaining,
            'status' => $status,
            'is_overdue' => $status !== 'paid' && $debt->due_date && $debt->due_date->lt(now()->startOfDay()),
            'days_until_due' => now()->diffInDays($debt->due_date, false),
        ];
    }
}
