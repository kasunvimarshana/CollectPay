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
            $table->decimal('amount', 10, 2);
            $table->enum('type', ['advance', 'partial', 'final']);
            $table->timestamp('payment_date');
            $table->text('notes')->nullable();
            $table->string('reference_number')->nullable();
            $table->uuid('user_id');
            $table->string('idempotency_key')->unique();
            $table->integer('version')->default(1);
            $table->timestamps();
            $table->softDeletes();
            
            $table->foreign('supplier_id')->references('id')->on('suppliers')->onDelete('cascade');
            $table->foreign('user_id')->references('id')->on('users')->onDelete('cascade');
            $table->index(['supplier_id', 'payment_date']);
            $table->index('user_id');
            $table->index('idempotency_key');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('payments');
    }
};
