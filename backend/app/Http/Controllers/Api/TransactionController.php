<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Transaction;
use App\Models\Wallet;
use Illuminate\Http\Request;

class TransactionController extends Controller
{
    public function index(Request $request)
    {
        $validated = $request->validate([
            'from' => ['nullable', 'date'],
            'to' => ['nullable', 'date'],
            'category' => ['nullable', 'string', 'max:100'],
            'type' => ['nullable', 'in:income,expense'],
        ]);

        $query = Transaction::query()->where('user_id', $request->user()->id);

        if (!empty($validated['from'])) {
            $query->whereDate('date', '>=', $validated['from']);
        }
        if (!empty($validated['to'])) {
            $query->whereDate('date', '<=', $validated['to']);
        }
        if (!empty($validated['category'])) {
            $query->where('category', $validated['category']);
        }
        if (!empty($validated['type'])) {
            $query->where('type', $validated['type']);
        }

        $transactions = $query->orderByDesc('date')->orderByDesc('id')->get();

        return response()->json([
            'success' => true,
            'message' => 'Transaksi berhasil diambil',
            'data' => $transactions,
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'wallet_id' => ['required', 'integer', 'exists:wallets,id'],
            'title' => ['required', 'string', 'max:150'],
            'category' => ['required', 'string', 'max:100'],
            'note' => ['nullable', 'string', 'max:1000'],
            'type' => ['required', 'in:income,expense'],
            'amount' => ['required', 'numeric', 'min:0'],
            'date' => ['required', 'date'],
        ]);

        $transaction = Transaction::create([
            'user_id' => $request->user()->id,
            'wallet_id' => $validated['wallet_id'],
            'title' => $validated['title'],
            'category' => $validated['category'],
            'note' => $validated['note'] ?? null,
            'type' => $validated['type'],
            'amount' => (float) $validated['amount'],
            'date' => $validated['date'],
        ]);

        // Mutasi saldo wallet untuk update e-wallet dashboard.
        // Catatan: transaksi kategori 'Initial' dipakai untuk reporting, bukan untuk mengubah saldo.
        if ($validated['category'] !== 'Initial') {
            $wallet = Wallet::query()->where('user_id', $request->user()->id)->where('id', $validated['wallet_id'])->first();

            if ($wallet) {
                $delta = (float) $validated['amount'];
                if ($validated['type'] === 'income') {
                    $wallet->balance = (float) $wallet->balance + $delta;
                } else {
                    $wallet->balance = (float) $wallet->balance - $delta;
                }

                $wallet->save();
            }
        }

        return response()->json([
            'success' => true,
            'message' => 'Transaksi berhasil dibuat',
            'data' => $transaction,
        ], 201);
    }

    public function destroy(Request $request, Transaction $transaction)
    {
        if ($transaction->user_id !== $request->user()->id) {
            return response()->json([
                'success' => false,
                'message' => 'Tidak diizinkan',
            ], 403);
        }

        // Rollback saldo wallet saat transaksi dihapus (kecuali transaksi Initial).
        if ($transaction->category !== 'Initial') {
            $wallet = Wallet::query()->where('user_id', $request->user()->id)->where('id', $transaction->wallet_id)->first();

            if ($wallet) {
                $delta = (float) $transaction->amount;
                if ($transaction->type === 'income') {
                    // menghapus income => kurangi delta
                    $wallet->balance = (float) $wallet->balance - $delta;
                } else {
                    // menghapus expense => tambah delta
                    $wallet->balance = (float) $wallet->balance + $delta;
                }

                $wallet->save();
            }
        }

        $transaction->delete();

        return response()->json([
            'success' => true,
            'message' => 'Transaksi berhasil dihapus',
        ]);
    }
}

