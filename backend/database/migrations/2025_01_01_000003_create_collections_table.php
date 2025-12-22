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
            $table->uuid('collected_by');
            $table->string('product_type');
            $table->decimal('quantity_value', 10, 3);
            $table->string('quantity_unit');
            $table->integer('rate_per_unit'); // in cents
            $table->string('rate_currency', 3)->default('USD');
            $table->integer('total_amount'); // in cents
            $table->string('total_currency', 3)->default('USD');
            $table->text('notes')->nullable();
            $table->enum('status', ['pending', 'approved', 'rejected'])->default('pending');
            $table->date('collection_date');
            $table->string('sync_id')->nullable()->unique();
            $table->timestamps();
            $table->softDeletes();

            $table->foreign('supplier_id')->references('id')->on('suppliers');
            $table->foreign('collected_by')->references('id')->on('users');
            $table->index(['supplier_id', 'collection_date']);
            $table->index(['collected_by', 'status']);
            $table->index('sync_id');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('collections');
    }
};
