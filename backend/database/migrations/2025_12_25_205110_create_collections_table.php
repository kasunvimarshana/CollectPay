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
            $table->foreignId('user_id')->constrained()->onDelete('cascade');
            $table->foreignId('product_rate_id')->nullable()->constrained('product_rates')->onDelete('set null');
            $table->date('collection_date');
            $table->decimal('quantity', 10, 3);
            $table->string('unit');
            $table->decimal('rate_applied', 10, 2);
            $table->decimal('total_amount', 10, 2);
            $table->text('notes')->nullable();
            $table->json('metadata')->nullable();
            $table->integer('version')->default(1);
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
