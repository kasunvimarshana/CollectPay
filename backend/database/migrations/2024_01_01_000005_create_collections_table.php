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
            $table->decimal('quantity', 10, 2);
            $table->uuid('rate_version_id');
            $table->decimal('applied_rate', 10, 2); // Denormalized for historical accuracy
            $table->timestamp('collection_date');
            $table->text('notes')->nullable();
            $table->uuid('user_id');
            $table->string('idempotency_key')->unique();
            $table->integer('version')->default(1);
            $table->timestamps();
            $table->softDeletes();
            
            $table->foreign('supplier_id')->references('id')->on('suppliers')->onDelete('cascade');
            $table->foreign('product_id')->references('id')->on('products')->onDelete('cascade');
            $table->foreign('rate_version_id')->references('id')->on('rate_versions')->onDelete('restrict');
            $table->foreign('user_id')->references('id')->on('users')->onDelete('cascade');
            $table->index(['supplier_id', 'collection_date']);
            $table->index('product_id');
            $table->index('user_id');
            $table->index('idempotency_key');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('collections');
    }
};
