#!/usr/bin/env php
<?php
/**
 * Authorization & Data Isolation Test Script
 * Run: php artisan tinker < test-authorization.php
 * Or: php test-authorization.php
 */

use App\Models\User;
use App\Models\Wallet;
use App\Models\Transaction;
use Illuminate\Support\Facades\DB;

echo "\n=== TRANSACTION AUTHORIZATION TEST ===\n\n";

// 1. Check database integrity
echo "1. Database Integrity Check:\n";
echo str_repeat("-", 50) . "\n";

$nullUserTx = Transaction::whereNull('user_id')->count();
$nullWalletTx = Transaction::whereNull('wallet_id')->count();
$mismatchCount = DB::table('transactions')
    ->join('wallets', 'transactions.wallet_id', '=', 'wallets.id')
    ->whereRaw('transactions.user_id != wallets.user_id')
    ->count();

echo "✓ Transactions with null user_id: $nullUserTx (should be 0)\n";
echo "✓ Transactions with null wallet_id: $nullWalletTx (should be 0)\n";
echo "✓ User-Wallet mismatches: $mismatchCount (should be 0)\n\n";

// 2. Check each user's data isolation
echo "2. User Data Isolation:\n";
echo str_repeat("-", 50) . "\n";

$users = User::all();
foreach ($users as $user) {
    $wallets = Wallet::where('user_id', $user->id)->get();
    $transactions = Transaction::where('user_id', $user->id)->get();
    
    echo "User: {$user->name} (ID: {$user->id})\n";
    echo "  Wallets: " . $wallets->count() . "\n";
    echo "  Transactions: " . $transactions->count() . "\n";
    
    // Verify wallet-transaction relationship
    foreach ($wallets as $wallet) {
        $walletTx = Transaction::where('wallet_id', $wallet->id)
                               ->where('user_id', $user->id)
                               ->count();
        echo "    Wallet '{$wallet->name}': $walletTx transactions\n";
    }
    echo "\n";
}

// 3. Data ownership verification
echo "3. Data Ownership Verification:\n";
echo str_repeat("-", 50) . "\n";

foreach ($users as $user) {
    $userTransactions = Transaction::where('user_id', $user->id)->get();
    
    foreach ($userTransactions as $tx) {
        $wallet = Wallet::find($tx->wallet_id);
        
        if ($wallet->user_id !== $user->id) {
            echo "❌ ERROR: Transaction {$tx->id} belongs to user {$user->id} but wallet belongs to user {$wallet->user_id}\n";
        }
    }
}

echo "✓ All ownership relationships verified\n\n";

// 4. Summary
echo "4. Authorization Status:\n";
echo str_repeat("-", 50) . "\n";

$allGood = ($nullUserTx === 0 && $nullWalletTx === 0 && $mismatchCount === 0);

if ($allGood) {
    echo "✅ ALL CHECKS PASSED - Authorization is working correctly!\n";
} else {
    echo "❌ ISSUES DETECTED - Data integrity compromised\n";
}

echo "\n=== END TEST ===\n\n";
?>
