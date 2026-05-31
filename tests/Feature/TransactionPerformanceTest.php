<?php

namespace Tests\Feature;

use Tests\TestCase;
use Illuminate\Foundation\Testing\RefreshDatabase;
use App\Models\User;
use App\Models\Wallet;
use Illuminate\Support\Facades\DB;

class TransactionPerformanceTest extends TestCase
{
    use RefreshDatabase;

    /**
     * Test that creating a transaction performs limited number of queries.
     */
    public function test_transaction_store_query_count()
    {
        // Create a user and wallet
        $user = User::factory()->create();
        $wallet = Wallet::factory()->create(['user_id' => $user->id, 'balance' => 0]);

        // Authenticate as user
        $this->actingAs($user);

        // Enable query log
        DB::enableQueryLog();

        // Make request to store transaction
        $response = $this->postJson('/api/transaction', [
            'wallet_id' => $wallet->id,
            'title' => 'Test Transaction',
            'category' => 'Other',
            'type' => 'income',
            'amount' => 1000,
            'date' => now()->format('Y-m-d'),
        ]);

        $response->assertStatus(201);

        // Get logged queries
        $queries = DB::getQueryLog();
        // Expect no more than 5 queries (wallet lookup, insert transaction, balance increment, activity log, etc.)
        $this->assertLessThanOrEqual(5, count($queries), 'Too many queries executed during transaction store');
    }
}
