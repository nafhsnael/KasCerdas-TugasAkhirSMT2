<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('debts', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained('users')->onDelete('cascade');
            $table->foreignId('wallet_id')->constrained('wallets')->onDelete('cascade');
            $table->string('creditor_name', 150); // Nama kreditur/pemberi hutang
            $table->decimal('amount', 15, 2); // Jumlah hutang
            $table->date('due_date'); // Tanggal jatuh tempo
            $table->string('status', 50)->default('active'); // active, paid, overdue
            $table->text('note')->nullable();
            $table->decimal('paid_amount', 15, 2)->default(0); // Jumlah yang sudah dibayar
            $table->timestamps();
            
            // Index untuk query cepat
            $table->index('user_id');
            $table->index('wallet_id');
            $table->index('status');
            $table->index('due_date');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('debts');
    }
};
