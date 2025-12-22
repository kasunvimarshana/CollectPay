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
        Schema::create('payments', function (Blueprint $table) {
            $table->ulid('id')->primary();
            $table->ulid('supplier_id');
            $table->decimal('amount', 12, 2);
            $table->char('currency', 3);
            $table->enum('type', ['advance','partial','final']);
            $table->string('reference')->nullable();
            $table->dateTime('paid_at');
            $table->timestamps();

            $table->foreign('supplier_id')->references('id')->on('suppliers')->cascadeOnDelete();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('payments');
    }
};
