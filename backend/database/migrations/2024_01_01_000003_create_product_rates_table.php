<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('product_rates', function (Blueprint $table) {
            $table->id();
            $table->foreignId('product_id')->constrained()->cascadeOnDelete();
            $table->decimal('rate', 10, 2); // Price per unit
            $table->enum('unit', ['gram', 'kilogram', 'liter', 'milliliter']);
            $table->date('effective_from');
            $table->date('effective_to')->nullable();
            $table->boolean('is_current')->default(true);
            $table->text('notes')->nullable();
            $table->foreignId('created_by')->constrained('users')->cascadeOnDelete();
            $table->timestamps();
            
            $table->index(['product_id', 'effective_from']);
            $table->index(['product_id', 'is_current']);
            $table->index('effective_from');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('product_rates');
    }
};
