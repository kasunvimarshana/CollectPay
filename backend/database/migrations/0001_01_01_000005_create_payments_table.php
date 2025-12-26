<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('payments', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->string('reference_number')->unique();
            $table->foreignUuid('supplier_id')->constrained()->cascadeOnDelete();
            
            // Payment type and amount
            $table->string('payment_type'); // advance, partial, settlement, adjustment
            $table->decimal('amount', 15, 4);
            $table->string('currency')->default('LKR');
            
            // Payment method details
            $table->string('payment_method')->default('cash'); // cash, bank_transfer, mobile_money, check
            $table->string('transaction_reference')->nullable();
            $table->string('bank_name')->nullable();
            $table->string('check_number')->nullable();
            
            // Settlement period (for settlement payments)
            $table->date('period_start')->nullable();
            $table->date('period_end')->nullable();
            
            // Calculated fields for settlement
            $table->decimal('total_collection_amount', 15, 4)->nullable();
            $table->decimal('previous_advances', 15, 4)->nullable();
            $table->decimal('previous_partials', 15, 4)->nullable();
            $table->decimal('adjustments', 15, 4)->nullable();
            $table->decimal('balance_due', 15, 4)->nullable();
            
            // Payment metadata
            $table->date('payment_date');
            $table->text('notes')->nullable();
            $table->uuid('paid_by');
            $table->uuid('approved_by')->nullable();
            $table->timestamp('approved_at')->nullable();
            $table->string('status')->default('pending'); // pending, approved, completed, cancelled
            
            // Sync fields
            $table->uuid('client_id')->nullable()->index();
            $table->bigInteger('version')->default(1);
            $table->timestamp('synced_at')->nullable();
            $table->boolean('is_dirty')->default(false);
            $table->string('sync_status')->default('synced');
            
            $table->timestamps();
            $table->softDeletes();
            
            $table->foreign('paid_by')->references('id')->on('users')->cascadeOnDelete();
            $table->foreign('approved_by')->references('id')->on('users')->nullOnDelete();
            $table->index(['supplier_id', 'payment_date']);
            $table->index(['payment_type', 'status']);
            $table->index(['synced_at']);
        });

        // Pivot table to link payments with specific collections (for partial/settlement)
        Schema::create('collection_payment', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->foreignUuid('collection_id')->constrained()->cascadeOnDelete();
            $table->foreignUuid('payment_id')->constrained()->cascadeOnDelete();
            $table->decimal('amount_applied', 15, 4);
            $table->timestamps();
            
            $table->unique(['collection_id', 'payment_id']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('collection_payment');
        Schema::dropIfExists('payments');
    }
};
