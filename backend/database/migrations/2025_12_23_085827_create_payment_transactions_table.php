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
        Schema::create('payment_transactions', function (Blueprint $table) {
            $table->id();
            $table->uuid('uuid')->unique();
            $table->foreignId('supplier_id')->constrained()->onDelete('cascade');
            $table->foreignId('payment_id')->nullable()->constrained()->onDelete('cascade');
            $table->foreignId('collection_id')->nullable()->constrained()->onDelete('set null');
            $table->enum('type', ['debit', 'credit']); // debit: collection, credit: payment
            $table->decimal('amount', 12, 2);
            $table->decimal('balance', 12, 2); // Running balance
            $table->timestamp('transaction_date');
            $table->text('description')->nullable();
            $table->timestamps();
            
            $table->index(['supplier_id', 'transaction_date']);
            $table->index('uuid');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('payment_transactions');
    }
};
