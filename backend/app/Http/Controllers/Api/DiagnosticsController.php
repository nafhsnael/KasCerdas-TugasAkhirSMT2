<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\User;
use App\Models\Wallet;
use App\Models\Transaction;
use Illuminate\Http\Request;

class DiagnosticsController extends Controller
{
    /**
     * Check current user's data ownership
     * DEBUG ONLY: Remove in production!
     */
    public function checkUserData(Request $request)
    {
        $userId = $request->user()->id;
        
        $userInfo = User::find($userId);
        $walletsCount = Wallet::where('user_id', $userId)->count();
        $transactionsCount = Transaction::where('user_id', $userId)->count();
        
        $walletsData = Wallet::where('user_id', $userId)->with('transactions')->get();
        
        return response()->json([
            'success' => true,
            'message' => 'User data diagnostics',
            'data' => [
                'user_id' => $userId,
                'user_name' => $userInfo->name ?? null,
                'user_email' => $userInfo->email ?? null,
                'wallets_count' => $walletsCount,
                'transactions_count' => $transactionsCount,
                'wallets' => $walletsData->map(fn($wallet) => [
                    'id' => $wallet->id,
                    'name' => $wallet->name,
                    'balance' => $wallet->balance,
                    'transactions_count' => $wallet->transactions()->count(),
                    'user_id' => $wallet->user_id,
                ]),
            ],
        ]);
    }

    /**
     * Check all users and their data
     * DEBUG ONLY: Remove in production!
     */
    public function checkAllUsers()
    {
        $users = User::all();
        
        $data = $users->map(fn($user) => [
            'id' => $user->id,
            'name' => $user->name,
            'email' => $user->email,
            'wallets_count' => $user->id ? Wallet::where('user_id', $user->id)->count() : 0,
            'transactions_count' => $user->id ? Transaction::where('user_id', $user->id)->count() : 0,
        ]);
        
        return response()->json([
            'success' => true,
            'message' => 'All users diagnostics',
            'data' => $data,
        ]);
    }

    /**
     * Check transaction with potential issues
     * DEBUG ONLY: Remove in production!
     */
    public function checkTransactionIssues()
    {
        // Find transactions where user_id is null or mismatched
        $nullUserTransactions = Transaction::whereNull('user_id')->count();
        $nullWalletTransactions = Transaction::whereNull('wallet_id')->count();
        
        // Check orphaned transactions (wallet deleted but transaction still exists)
        $orphanedTransactions = Transaction::whereNotIn('wallet_id', function($query) {
            $query->select('id')->from('wallets');
        })->count();
        
        // Check transactions with wrong wallet-user relationship
        $wrongRelationships = Transaction::join('wallets', 'transactions.wallet_id', '=', 'wallets.id')
            ->whereRaw('transactions.user_id != wallets.user_id')
            ->count();
        
        return response()->json([
            'success' => true,
            'message' => 'Transaction issues diagnostics',
            'data' => [
                'null_user_id_count' => $nullUserTransactions,
                'null_wallet_id_count' => $nullWalletTransactions,
                'orphaned_transactions_count' => $orphanedTransactions,
                'wrong_user_wallet_relationship_count' => $wrongRelationships,
                'status' => [
                    'null_user_id' => $nullUserTransactions === 0 ? '✅' : '❌',
                    'null_wallet_id' => $nullWalletTransactions === 0 ? '✅' : '❌',
                    'orphaned' => $orphanedTransactions === 0 ? '✅' : '❌',
                    'relationships' => $wrongRelationships === 0 ? '✅' : '❌',
                ],
            ],
        ]);
    }
}
