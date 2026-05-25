<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('savings', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained('users')->onDelete('cascade');
            $table->foreignId('wallet_id')->constrained('wallets')->onDelete('cascade');
            $table->string('name', 150); // Nama target tabungan
            $table->decimal('target_amount', 15, 2); // Target akhir
            $table->decimal('current_amount', 15, 2)->default(0); // Jumlah saat ini
            $table->date('target_date'); // Tanggal target
            $table->string('category', 100)->nullable(); // Kategori: Liburan, Rumah, Kendaraan, dll
            $table->text('note')->nullable();
            $table->string('status', 50)->default('active'); // active, completed, stopped
            $table->timestamps();
            
            // Index untuk query cepat
            $table->index('user_id');
            $table->index('wallet_id');
            $table->index('status');
            $table->index('target_date');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('savings');
    }
};
