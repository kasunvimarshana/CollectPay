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
            $table->foreignId('product_rate_id')->nullable()->constrained('product_rates')->onDelete('set null');
            $table->date('collection_date');
            $table->decimal('quantity', 10, 3); // Quantity collected
            $table->string('unit'); // kg, g, l, ml, unit, etc.
            $table->decimal('rate_applied', 10, 2)->nullable(); // Rate at time of collection
            $table->decimal('total_amount', 12, 2)->nullable(); // Calculated amount
            $table->text('notes')->nullable();
            $table->foreignId('collected_by')->constrained('users')->onDelete('cascade');
            $table->timestamps();
            $table->softDeletes();
            
            $table->index(['supplier_id', 'collection_date']);
            $table->index(['product_id', 'collection_date']);
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
