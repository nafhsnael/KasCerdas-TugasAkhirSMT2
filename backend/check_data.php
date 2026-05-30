<?php
require __DIR__ . '/vendor/autoload.php';
$app = require_once __DIR__ . '/bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

use App\Models\User;
use App\Models\Wallet;
use App\Models\Transaction;

echo "=== USERS ===\n";
foreach (User::all() as $user) {
    echo "ID: {$user->id}, Name: {$user->name}, Email: {$user->email}, Role: {$user->role}, UserType: {$user->user_type}\n";
}

echo "\n=== WALLETS ===\n";
foreach (Wallet::all() as $w) {
    echo "ID: {$w->id}, UserID: {$w->user_id}, Name: {$w->name}, Balance: {$w->balance}\n";
}

echo "\n=== TRANSACTIONS ===\n";
foreach (Transaction::all() as $t) {
    echo "ID: {$t->id}, UserID: {$t->user_id}, Title: {$t->title}, Category: {$t->category}, Type: {$t->type}, Amount: {$t->amount}, Date: {$t->date}\n";
}
