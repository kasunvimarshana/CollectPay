<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('collections', function (Blueprint $table) {
            $table->id();
            $table->string('uuid')->unique(); // Client-generated UUID for offline support
            $table->foreignId('supplier_id')->constrained()->onDelete('cascade');
            $table->foreignId('product_id')->constrained()->onDelete('cascade');
            $table->foreignId('rate_id')->constrained()->onDelete('restrict'); // Historical rate reference
            $table->decimal('quantity', 10, 2);
            $table->decimal('rate_applied', 10, 2); // Rate at time of collection
            $table->decimal('total_amount', 10, 2);
            $table->date('collection_date');
            $table->time('collection_time')->nullable();
            $table->text('notes')->nullable();
            $table->foreignId('collected_by')->constrained('users');
            $table->foreignId('created_by')->constrained('users');
            $table->foreignId('updated_by')->nullable()->constrained('users');
            $table->timestamps();
            $table->softDeletes();
            $table->integer('version')->default(1);
            $table->timestamp('synced_at')->nullable();
            
            $table->index(['supplier_id', 'collection_date']);
            $table->index(['product_id', 'collection_date']);
            $table->index(['uuid']);
            $table->index('synced_at');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('collections');
    }
};
