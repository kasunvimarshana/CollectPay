<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

/**
 * Collections Table Migration
 * 
 * Creates the collections table for recording supplier collections
 * with multi-unit support and historical rate preservation.
 */
return new class extends Migration
{
    public function up(): void
    {
        Schema::create('collections', function (Blueprint $table) {
            $table->id();
            $table->foreignId('supplier_id')->constrained()->onDelete('restrict');
            $table->foreignId('product_id')->constrained()->onDelete('restrict');
            $table->decimal('quantity', 10, 3);
            $table->string('unit');
            $table->decimal('applied_rate', 10, 2); // Historical rate at time of collection
            $table->decimal('total_amount', 10, 2);
            $table->dateTime('collection_date');
            $table->foreignId('collected_by')->constrained('users');
            $table->text('notes')->nullable();
            $table->integer('version')->default(0); // Optimistic locking
            $table->timestamps();
            $table->softDeletes();
            
            // Indexes
            $table->index('supplier_id');
            $table->index('product_id');
            $table->index('collection_date');
            $table->index('collected_by');
            $table->index(['supplier_id', 'collection_date']);
            $table->index(['product_id', 'collection_date']);
            $table->index(['supplier_id', 'product_id', 'collection_date']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('collections');
    }
};
