<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Transaction;
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

        $transaction->delete();

        return response()->json([
            'success' => true,
            'message' => 'Transaksi berhasil dihapus',
        ]);
    }
}

