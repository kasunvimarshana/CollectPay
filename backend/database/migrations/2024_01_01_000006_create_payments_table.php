<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

/**
 * Payments Table Migration
 * 
 * Creates the payments table for tracking advance, partial, and final payments.
 */
return new class extends Migration
{
    public function up(): void
    {
        Schema::create('payments', function (Blueprint $table) {
            $table->id();
            $table->foreignId('supplier_id')->constrained()->onDelete('restrict');
            $table->decimal('amount', 10, 2);
            $table->enum('payment_type', ['advance', 'partial', 'final']);
            $table->dateTime('payment_date');
            $table->foreignId('paid_by')->constrained('users');
            $table->string('reference')->nullable();
            $table->text('notes')->nullable();
            $table->integer('version')->default(0); // Optimistic locking
            $table->timestamps();
            $table->softDeletes();
            
            // Indexes
            $table->index('supplier_id');
            $table->index('payment_type');
            $table->index('payment_date');
            $table->index('paid_by');
            $table->index(['supplier_id', 'payment_date']);
            $table->index(['supplier_id', 'payment_type']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('payments');
    }
};
