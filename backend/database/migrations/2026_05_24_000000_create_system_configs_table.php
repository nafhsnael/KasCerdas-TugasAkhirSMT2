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
        Schema::create('system_configs', function (Blueprint $table) {
            $table->id();
            $table->string('key')->unique(); // e.g., 'app_name', 'max_upload_size'
            $table->text('value')->nullable(); // stored as JSON or plain text
            $table->string('type')->default('string'); // string, integer, boolean, json
            $table->string('category')->default('general'); // general, security, features, storage
            $table->text('description')->nullable(); // untuk dokumentasi
            $table->boolean('is_sensitive')->default(false); // untuk config yang sensitive
            $table->timestamps();

            $table->index('category');
            $table->index('key');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('system_configs');
    }
};
