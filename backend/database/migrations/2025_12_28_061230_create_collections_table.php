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
        Schema::create('collections', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->uuid('supplier_id');
            $table->uuid('product_id');
            $table->uuid('user_id');
            $table->decimal('quantity_value', 10, 3);
            $table->string('quantity_unit', 10);
            $table->decimal('rate_price', 10, 2);
            $table->string('rate_currency', 3)->default('USD');
            $table->string('rate_unit', 10);
            $table->timestamp('rate_effective_from');
            $table->decimal('total_amount', 10, 2);
            $table->string('total_currency', 3)->default('USD');
            $table->timestamp('collection_date');
            $table->text('notes')->nullable();
            $table->json('metadata')->nullable();
            $table->timestamps();
            
            $table->foreign('supplier_id')->references('id')->on('suppliers')->onDelete('restrict');
            $table->foreign('product_id')->references('id')->on('products')->onDelete('restrict');
            $table->foreign('user_id')->references('id')->on('users')->onDelete('restrict');
            
            $table->index(['supplier_id', 'collection_date']);
            $table->index(['product_id', 'collection_date']);
            $table->index('collection_date');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('collections');
    }
};
