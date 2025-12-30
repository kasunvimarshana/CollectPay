<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('collections', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->uuid('supplier_id');
            $table->uuid('product_id');
            $table->decimal('quantity_amount', 10, 2);
            $table->string('quantity_unit', 10);
            $table->decimal('applied_rate_amount', 10, 2);
            $table->string('currency', 3)->default('LKR');
            $table->decimal('total_amount', 10, 2);
            $table->timestamp('collection_date');
            $table->text('notes')->nullable();
            $table->timestamps();
            $table->integer('version')->default(1);

            $table->foreign('supplier_id')
                  ->references('id')
                  ->on('suppliers')
                  ->onDelete('cascade');

            $table->foreign('product_id')
                  ->references('id')
                  ->on('products')
                  ->onDelete('cascade');

            $table->index(['supplier_id', 'collection_date']);
            $table->index(['product_id', 'collection_date']);
            $table->index('collection_date');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('collections');
    }
};
