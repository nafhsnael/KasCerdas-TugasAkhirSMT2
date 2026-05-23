<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Budget;
use App\Models\Wallet;
use Illuminate\Http\Request;

class BudgetController extends Controller
{
    public function index(Request $request)
    {
        $validated = $request->validate([
            'period_month' => ['required', 'string', 'max:7'], // YYYY-MM
        ]);

        $budgets = Budget::query()
            ->where('user_id', $request->user()->id)
            ->where('period_month', $validated['period_month'])
            ->orderBy('category')
            ->get();

        return response()->json([
            'success' => true,
            'message' => 'Budget berhasil diambil',
            'data' => $budgets,
        ]);
    }

    public function store(Request $request)
    {
        $userId = $request->user()->id;
        
        $validated = $request->validate([
            'wallet_id' => ['required', 'integer'],
            'period_month' => ['required', 'string', 'max:7'], // YYYY-MM
            'category' => ['required', 'string', 'max:100'],
            'limit' => ['required', 'numeric', 'min:0'],
        ]);

        // CRITICAL: Verify wallet belongs to authenticated user
        $walletExists = Wallet::where('id', $validated['wallet_id'])
                              ->where('user_id', $userId)
                              ->exists();
        
        if (!$walletExists) {
            return response()->json([
                'success' => false,
                'message' => 'Wallet tidak ditemukan atau bukan milik Anda',
            ], 404);
        }

        $budget = Budget::query()->firstOrCreate([
            'user_id' => $userId,
            'wallet_id' => $validated['wallet_id'],
            'period_month' => $validated['period_month'],
            'category' => $validated['category'],
        ], [
            'usage' => 0,
            'limit' => (float) $validated['limit'],
        ]);

        // Usage can be computed from transactions later; minimal now: keep existing usage.
        $budget->limit = (float) $validated['limit'];
        $budget->save();

        return response()->json([
            'success' => true,
            'message' => 'Budget berhasil disimpan',
            'data' => $budget,
        ], 201);
    }
}

