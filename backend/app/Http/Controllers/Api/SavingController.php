<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Saving;
use App\Models\Wallet;
use Illuminate\Http\Request;

class SavingController extends Controller
{
    /**
     * Get all savings for authenticated user
     */
    public function index(Request $request)
    {
        $validated = $request->validate([
            'status' => ['nullable', 'in:active,completed,stopped'],
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

        $query = Saving::where('user_id', $userId);

        if (!empty($validated['status'])) {
            $query->where('status', $validated['status']);
        }

        if (!empty($validated['wallet_id'])) {
            $query->where('wallet_id', $validated['wallet_id']);
        }

        if (!empty($validated['search'])) {
            $search = $validated['search'];
            $query->where(function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                  ->orWhere('category', 'like', "%{$search}%")
                  ->orWhere('note', 'like', "%{$search}%");
            });
        }

        $savings = $query->orderBy('target_date')->get();

        // Add computed attributes
        $savings = $savings->map(function ($saving) {
            return [
                ...$saving->toArray(),
                'remaining_amount' => $saving->remaining_amount,
                'progress_percent' => $saving->progress_percent,
                'days_until_target' => $saving->days_until_target,
                'monthly_target' => $saving->monthly_target,
                'is_completed' => $saving->is_completed,
            ];
        });

        return response()->json([
            'success' => true,
            'message' => 'Target tabungan berhasil diambil',
            'data' => $savings,
        ]);
    }

    /**
     * Get single saving detail
     */
    public function show(Request $request, Saving $saving)
    {
        // Authorization check
        if ($saving->user_id !== $request->user()->id) {
            return response()->json([
                'success' => false,
                'message' => 'Tidak diizinkan mengakses target tabungan ini',
            ], 403);
        }

        return response()->json([
            'success' => true,
            'message' => 'Detail target tabungan berhasil diambil',
            'data' => [
                ...$saving->toArray(),
                'remaining_amount' => $saving->remaining_amount,
                'progress_percent' => $saving->progress_percent,
                'days_until_target' => $saving->days_until_target,
                'monthly_target' => $saving->monthly_target,
                'is_completed' => $saving->is_completed,
            ],
        ]);
    }

    /**
     * Create new saving
     */
    public function store(Request $request)
    {
        $userId = $request->user()->id;
        
        $validated = $request->validate([
            'wallet_id' => ['required', 'integer'],
            'name' => ['required', 'string', 'max:150'],
            'target_amount' => ['required', 'numeric', 'min:0.01'],
            'target_date' => ['required', 'date', 'date_format:Y-m-d'],
            'category' => ['nullable', 'string', 'max:100'],
            'note' => ['nullable', 'string', 'max:1000'],
            'current_amount' => ['nullable', 'numeric', 'min:0'],
        ]);

        // Verify wallet belongs to user
        $wallet = Wallet::where('id', $validated['wallet_id'])
                        ->where('user_id', $userId)
                        ->firstOrFail();

        $saving = Saving::create([
            'user_id' => $userId,
            'wallet_id' => $validated['wallet_id'],
            'name' => $validated['name'],
            'target_amount' => (float) $validated['target_amount'],
            'current_amount' => (float) ($validated['current_amount'] ?? 0),
            'target_date' => $validated['target_date'],
            'category' => $validated['category'] ?? null,
            'note' => $validated['note'] ?? null,
            'status' => 'active',
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Target tabungan berhasil ditambahkan',
            'data' => [
                ...$saving->fresh()->toArray(),
                'remaining_amount' => $saving->fresh()->remaining_amount,
                'progress_percent' => $saving->fresh()->progress_percent,
                'days_until_target' => $saving->fresh()->days_until_target,
                'monthly_target' => $saving->fresh()->monthly_target,
                'is_completed' => $saving->fresh()->is_completed,
            ],
        ], 201);
    }

    /**
     * Update saving
     */
    public function update(Request $request, Saving $saving)
    {
        // Authorization check
        if ($saving->user_id !== $request->user()->id) {
            return response()->json([
                'success' => false,
                'message' => 'Tidak diizinkan mengubah target tabungan ini',
            ], 403);
        }

        $validated = $request->validate([
            'name' => ['nullable', 'string', 'max:150'],
            'target_amount' => ['nullable', 'numeric', 'min:0.01'],
            'current_amount' => ['nullable', 'numeric', 'min:0'],
            'target_date' => ['nullable', 'date', 'date_format:Y-m-d'],
            'category' => ['nullable', 'string', 'max:100'],
            'note' => ['nullable', 'string', 'max:1000'],
            'status' => ['nullable', 'in:active,completed,stopped'],
        ]);

        $saving->update(array_filter($validated, fn($value) => !is_null($value)));

        return response()->json([
            'success' => true,
            'message' => 'Target tabungan berhasil diperbarui',
            'data' => [
                ...$saving->fresh()->toArray(),
                'remaining_amount' => $saving->fresh()->remaining_amount,
                'progress_percent' => $saving->fresh()->progress_percent,
                'days_until_target' => $saving->fresh()->days_until_target,
                'monthly_target' => $saving->fresh()->monthly_target,
                'is_completed' => $saving->fresh()->is_completed,
            ],
        ]);
    }

    /**
     * Delete saving
     */
    public function destroy(Request $request, Saving $saving)
    {
        // Authorization check
        if ($saving->user_id !== $request->user()->id) {
            return response()->json([
                'success' => false,
                'message' => 'Tidak diizinkan menghapus target tabungan ini',
            ], 403);
        }

        $saving->delete();

        return response()->json([
            'success' => true,
            'message' => 'Target tabungan berhasil dihapus',
        ]);
    }

    /**
     * Add to current amount (deposit to savings)
     */
    public function deposit(Request $request, Saving $saving)
    {
        // Authorization check
        if ($saving->user_id !== $request->user()->id) {
            return response()->json([
                'success' => false,
                'message' => 'Tidak diizinkan menambah tabungan ini',
            ], 403);
        }

        $validated = $request->validate([
            'amount' => ['required', 'numeric', 'min:0.01'],
        ]);

        $newAmount = (float) ($saving->current_amount + $validated['amount']);
        $saving->update(['current_amount' => $newAmount]);

        // Auto-complete if target reached
        if ($newAmount >= $saving->target_amount) {
            $saving->update(['status' => 'completed']);
        }

        return response()->json([
            'success' => true,
            'message' => 'Tabungan berhasil ditambahkan',
            'data' => [
                ...$saving->fresh()->toArray(),
                'remaining_amount' => $saving->fresh()->remaining_amount,
                'progress_percent' => $saving->fresh()->progress_percent,
                'days_until_target' => $saving->fresh()->days_until_target,
                'monthly_target' => $saving->fresh()->monthly_target,
                'is_completed' => $saving->fresh()->is_completed,
            ],
        ]);
    }

    /**
     * Withdraw from savings
     */
    public function withdraw(Request $request, Saving $saving)
    {
        // Authorization check
        if ($saving->user_id !== $request->user()->id) {
            return response()->json([
                'success' => false,
                'message' => 'Tidak diizinkan menarik tabungan ini',
            ], 403);
        }

        $validated = $request->validate([
            'amount' => ['required', 'numeric', 'min:0.01'],
        ]);

        if ($validated['amount'] > $saving->current_amount) {
            return response()->json([
                'success' => false,
                'message' => 'Jumlah penarikan tidak boleh lebih besar dari saldo tabungan',
            ], 422);
        }

        $newAmount = (float) ($saving->current_amount - $validated['amount']);
        $saving->update(['current_amount' => $newAmount]);

        return response()->json([
            'success' => true,
            'message' => 'Penarikan tabungan berhasil',
            'data' => [
                ...$saving->fresh()->toArray(),
                'remaining_amount' => $saving->fresh()->remaining_amount,
                'progress_percent' => $saving->fresh()->progress_percent,
                'days_until_target' => $saving->fresh()->days_until_target,
                'monthly_target' => $saving->fresh()->monthly_target,
                'is_completed' => $saving->fresh()->is_completed,
            ],
        ]);
    }
}
