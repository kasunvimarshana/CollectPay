<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('product_rates', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->uuid('product_id');
            $table->decimal('rate_amount', 10, 2);
            $table->string('currency', 3)->default('LKR');
            $table->timestamp('effective_from');
            $table->timestamp('effective_to')->nullable();
            $table->boolean('active')->default(true);
            $table->timestamp('created_at');
            $table->integer('version')->default(1);

            $table->foreign('product_id')
                  ->references('id')
                  ->on('products')
                  ->onDelete('cascade');

            $table->index(['product_id', 'active', 'effective_from']);
            $table->index(['product_id', 'effective_from', 'effective_to']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('product_rates');
    }
};
