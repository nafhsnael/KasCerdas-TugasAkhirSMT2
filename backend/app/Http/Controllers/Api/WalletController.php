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
        $wallet = Wallet::query()->where('user_id', $request->user()->id)->first();

        return response()->json([
            'success' => true,
            'message' => 'Wallet berhasil diambil',
            'data' => $wallet,
        ]);
    }

    public function createOrUpdate(Request $request)
    {
        $validated = $request->validate([
            'name' => ['required', 'string', 'max:100'],
            'balance' => ['required', 'numeric'],
        ]);

        $wallet = Wallet::query()->where('user_id', $request->user()->id)->first();
        $created = false;

        if (!$wallet) {
            $wallet = new Wallet();
            $wallet->user_id = $request->user()->id;
            $created = true;
        }

        $wallet->name = $validated['name'];
        $wallet->balance = (float) $validated['balance'];
        $wallet->save();

        // Minimal: initial balance is represented by a synthetic transaction so reports can use transactions later.
        if ($created) {
            Transaction::create([
                'user_id' => $request->user()->id,
                'wallet_id' => $wallet->id,
                'title' => 'Initial Balance',
                'category' => 'Initial',
                'note' => 'Saldo awal',
                'type' => 'income',
                'amount' => (float) $validated['balance'],
            ]);
        }

        return response()->json([
            'success' => true,
            'message' => $created ? 'Wallet dibuat' : 'Wallet diperbarui',
            'data' => $wallet,
        ]);
    }
}

