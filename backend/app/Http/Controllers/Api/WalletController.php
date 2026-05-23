<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Transaction;
use App\Models\Wallet;
use Illuminate\Http\Request;
class WalletController extends Controller
{

    public function me(Request $request)
    {
        $userId = $request->user()->id;
        
        // CRITICAL: Always filter by authenticated user
        $wallet = Wallet::where('user_id', $userId)->first();

        if (!$wallet) {
            return response()->json([
                'success' => false,
                'message' => 'Wallet tidak ditemukan',
            ], 404);
        }

        // Load transactions yang terikat ke wallet ini dan user
        $transactions = Transaction::where('wallet_id', $wallet->id)
                                   ->where('user_id', $userId)
                                   ->orderByDesc('date')
                                   ->orderByDesc('id')
                                   ->get();

        return response()->json([
            'success' => true,
            'message' => 'Wallet berhasil diambil',
            'data' => [
                'wallet' => $wallet,
                'transactions_count' => $transactions->count(),
                'total_transactions' => $transactions->count(),
                'last_transactions' => $transactions->take(5),
            ],
        ]);
    }

    public function createOrUpdate(Request $request)
    {
        $userId = $request->user()->id;
        
        $validated = $request->validate([
            'name' => ['required', 'string', 'max:100'],
            'balance' => ['required', 'numeric'],
        ]);

        // CRITICAL: Always ensure wallet belongs to authenticated user
        $wallet = Wallet::where('user_id', $userId)->first();
        $created = false;

        if (!$wallet) {
            $wallet = new Wallet();
            $wallet->user_id = $userId;
            $created = true;
        } else {
            // Extra security check: verify ownership before update
            if ($wallet->user_id !== $userId) {
                return response()->json([
                    'success' => false,
                    'message' => 'Anda tidak memiliki izin untuk mengubah wallet ini',
                ], 403);
            }
        }

        $wallet->name = $validated['name'];
        $wallet->balance = (float) $validated['balance'];
        $wallet->save();

        // Minimal: initial balance is represented by a synthetic transaction so reports can use transactions later.
        if ($created) {
            Transaction::create([
                'user_id' => $userId,
                'wallet_id' => $wallet->id,
                'title' => 'Initial Balance',
                'category' => 'Initial',
                'note' => 'Saldo awal',
                'type' => 'income',
                'amount' => (float) $validated['balance'],
                'date' => now()->toDateString(),
            ]);
        }

        return response()->json([
            'success' => true,
            'message' => $created ? 'Wallet dibuat' : 'Wallet diperbarui',
            'data' => $wallet,
        ]);
    }
}

