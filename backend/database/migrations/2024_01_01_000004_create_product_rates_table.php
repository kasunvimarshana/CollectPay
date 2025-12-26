<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

/**
 * Product Rates Table Migration
 * 
 * Creates the product_rates table for historical rate tracking and versioning.
 * This enables accurate historical calculations and audit trails.
 */
return new class extends Migration
{
    public function up(): void
    {
        Schema::create('product_rates', function (Blueprint $table) {
            $table->id();
            $table->foreignId('product_id')->constrained()->onDelete('cascade');
            $table->decimal('rate', 10, 2);
            $table->string('unit');
            $table->dateTime('effective_from');
            $table->dateTime('effective_to')->nullable();
            $table->text('notes')->nullable();
            $table->foreignId('created_by')->constrained('users');
            $table->timestamp('created_at');
            
            // Indexes
            $table->index('product_id');
            $table->index(['product_id', 'effective_from']);
            $table->index(['product_id', 'effective_from', 'effective_to']);
            $table->index('created_by');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('product_rates');
    }
};
