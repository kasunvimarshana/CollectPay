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
            $table->foreignId('product_id')->constrained()->onDelete('cascade');
            $table->decimal('rate', 10, 2); // Rate per unit
            $table->string('unit'); // Unit for this rate (kg, g, liters, etc.)
            $table->date('effective_from'); // When this rate becomes effective
            $table->date('effective_to')->nullable(); // When this rate expires (null = current)
            $table->boolean('is_active')->default(true);
            $table->timestamps();
            
            // Ensure we can quickly find the current rate for a product
            $table->index(['product_id', 'effective_from', 'effective_to', 'is_active']);
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
