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
        $debts = $debts->map(function ($debt) {
            return [
                ...$debt->toArray(),
                'remaining_amount' => $debt->remaining_amount,
                'is_overdue' => $debt->is_overdue,
                'days_until_due' => $debt->days_until_due,
            ];
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
            'data' => [
                ...$debt->toArray(),
                'remaining_amount' => $debt->remaining_amount,
                'is_overdue' => $debt->is_overdue,
                'days_until_due' => $debt->days_until_due,
            ],
        ]);
    }

    /**
     * Create new debt
     */
    public function store(Request $request)
    {
        $userId = $request->user()->id;
        
        $validated = $request->validate([
            'wallet_id' => ['required', 'integer'],
            'creditor_name' => ['required', 'string', 'max:150'],
            'amount' => ['required', 'numeric', 'min:0.01'],
            'due_date' => ['required', 'date', 'date_format:Y-m-d'],
            'note' => ['nullable', 'string', 'max:1000'],
            'status' => ['nullable', 'in:active,paid,overdue'],
        ]);

        // Verify wallet belongs to user
        $wallet = Wallet::where('id', $validated['wallet_id'])
                        ->where('user_id', $userId)
                        ->firstOrFail();

        $debt = Debt::create([
            'user_id' => $userId,
            'wallet_id' => $validated['wallet_id'],
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
            'data' => [
                ...$debt->fresh()->toArray(),
                'remaining_amount' => $debt->fresh()->remaining_amount,
                'is_overdue' => $debt->fresh()->is_overdue,
                'days_until_due' => $debt->fresh()->days_until_due,
            ],
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

        $debt->update(array_filter($validated));

        return response()->json([
            'success' => true,
            'message' => 'Hutang berhasil diperbarui',
            'data' => [
                ...$debt->fresh()->toArray(),
                'remaining_amount' => $debt->fresh()->remaining_amount,
                'is_overdue' => $debt->fresh()->is_overdue,
                'days_until_due' => $debt->fresh()->days_until_due,
            ],
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
}
