<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::table('transactions', function (Blueprint $table) {
            $table->string('invoice', 50)->nullable()->after('date');
            $table->string('receipt_url', 500)->nullable()->after('invoice');
            $table->text('description_detail')->nullable()->after('receipt_url');
            $table->json('metadata')->nullable()->after('description_detail');
            
            // Add index for better query performance
            $table->index(['user_id', 'date']);
            $table->index('invoice');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('transactions', function (Blueprint $table) {
            $table->dropIndex(['user_id', 'date']);
            $table->dropIndex(['invoice']);
            $table->dropColumn(['invoice', 'receipt_url', 'description_detail', 'metadata']);
        });
    }
};
