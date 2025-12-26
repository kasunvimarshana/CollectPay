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
            $table->foreignId('supplier_id')->constrained()->onDelete('cascade');
            $table->foreignId('product_id')->constrained()->onDelete('cascade');
            $table->foreignId('user_id')->constrained()->onDelete('cascade'); // Collector
            $table->foreignId('product_rate_id')->nullable()->constrained('product_rates')->onDelete('set null'); // Applied rate at time of collection
            $table->date('collection_date');
            $table->decimal('quantity', 10, 3); // Quantity collected
            $table->string('unit'); // Unit of measurement (kg, g, etc.)
            $table->decimal('rate_applied', 10, 2)->nullable(); // Rate applied at time of collection
            $table->decimal('total_amount', 10, 2)->default(0); // Calculated total (quantity * rate)
            $table->text('notes')->nullable();
            $table->unsignedInteger('version')->default(1); // For optimistic locking
            $table->timestamps();
            $table->softDeletes();
            
            // Indexes for efficient queries
            $table->index(['supplier_id', 'collection_date']);
            $table->index(['product_id', 'collection_date']);
            $table->index('user_id');
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
