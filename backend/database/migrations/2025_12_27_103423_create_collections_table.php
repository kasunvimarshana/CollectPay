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
            $table->foreignId('supplier_id')->constrained()->onDelete('restrict');
            $table->foreignId('product_id')->constrained()->onDelete('restrict');
            $table->foreignId('collected_by')->constrained('users')->onDelete('restrict');
            $table->decimal('quantity', 15, 4);
            $table->string('unit');
            $table->decimal('rate', 15, 4); // rate applied at collection time
            $table->foreignId('rate_id')->nullable()->constrained('product_rates')->onDelete('set null');
            $table->decimal('total_amount', 15, 4); // quantity * rate
            $table->date('collection_date');
            $table->time('collection_time')->nullable();
            $table->text('notes')->nullable();
            $table->json('metadata')->nullable();
            $table->integer('version')->default(1);
            $table->timestamps();
            $table->softDeletes();

            $table->index(['supplier_id', 'collection_date']);
            $table->index(['product_id', 'collection_date']);
            $table->index('collected_by');
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
