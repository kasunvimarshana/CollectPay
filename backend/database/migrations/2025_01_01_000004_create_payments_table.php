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
            $table->uuid('supplier_id');
            $table->uuid('paid_by');
            $table->integer('amount'); // in cents
            $table->string('currency', 3)->default('USD');
            $table->enum('type', ['advance', 'partial', 'full']);
            $table->enum('method', ['cash', 'bank_transfer', 'cheque', 'digital_wallet']);
            $table->enum('status', ['pending', 'confirmed', 'cancelled'])->default('pending');
            $table->string('reference_number')->nullable();
            $table->text('notes')->nullable();
            $table->date('payment_date');
            $table->string('sync_id')->nullable()->unique();
            $table->timestamps();
            $table->softDeletes();

            $table->foreign('supplier_id')->references('id')->on('suppliers');
            $table->foreign('paid_by')->references('id')->on('users');
            $table->index(['supplier_id', 'payment_date']);
            $table->index(['paid_by', 'status']);
            $table->index('sync_id');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('payments');
    }
};
