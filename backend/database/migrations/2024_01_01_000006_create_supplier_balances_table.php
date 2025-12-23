<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('supplier_balances', function (Blueprint $table) {
            $table->id();
            $table->foreignId('supplier_id')->unique()->constrained()->cascadeOnDelete();
            $table->decimal('total_collections', 12, 2)->default(0);
            $table->decimal('total_payments', 12, 2)->default(0);
            $table->decimal('balance', 12, 2)->default(0); // total_collections - total_payments
            $table->decimal('advance_balance', 12, 2)->default(0); // Negative if supplier owes
            $table->timestamp('last_collection_at')->nullable();
            $table->timestamp('last_payment_at')->nullable();
            $table->timestamps();
            
            $table->index('balance');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('supplier_balances');
    }
};
