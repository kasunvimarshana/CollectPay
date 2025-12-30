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
            $table->id();
            $table->foreignId('supplier_id')->constrained('suppliers')->onDelete('cascade');
            $table->foreignId('product_id')->constrained('products')->onDelete('cascade');
            $table->foreignId('user_id')->constrained('users')->onDelete('cascade');
            $table->foreignId('rate_id')->constrained('rates')->onDelete('restrict');
            $table->date('collection_date');
            $table->decimal('quantity', 10, 3);
            $table->string('unit');
            $table->decimal('rate_applied', 10, 2);
            $table->decimal('total_amount', 12, 2);
            $table->text('notes')->nullable();
            $table->integer('version')->default(1);
            $table->timestamps();
            $table->softDeletes();
            
            $table->index(['supplier_id', 'collection_date']);
            $table->index(['product_id', 'collection_date']);
            $table->index(['user_id', 'collection_date']);
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
