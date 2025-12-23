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
        Schema::create('product_rates', function (Blueprint $table) {
            $table->id();
            $table->uuid('uuid')->unique();
            $table->foreignId('product_id')->constrained()->onDelete('cascade');
            $table->string('unit'); // kg, liter, piece, etc.
            $table->decimal('rate', 10, 2); // Rate per unit
            $table->decimal('min_quantity', 10, 2)->nullable();
            $table->decimal('max_quantity', 10, 2)->nullable();
            $table->timestamp('valid_from'); // Time-based versioning
            $table->timestamp('valid_to')->nullable(); // null means current/active
            $table->unsignedInteger('version')->default(1);
            $table->boolean('is_active')->default(true);
            $table->foreignId('created_by')->nullable()->constrained('users')->onDelete('set null');
            $table->foreignId('updated_by')->nullable()->constrained('users')->onDelete('set null');
            $table->timestamps();
            $table->softDeletes();
            
            // For offline sync
            $table->timestamp('synced_at')->nullable();
            $table->string('device_id')->nullable();
            
            $table->index(['product_id', 'valid_from', 'valid_to']);
            $table->index(['uuid', 'synced_at']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('product_rates');
    }
};
