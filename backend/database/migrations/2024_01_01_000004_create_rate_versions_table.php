<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('rate_versions', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->uuid('product_id');
            $table->decimal('rate', 10, 2);
            $table->timestamp('effective_from');
            $table->timestamp('effective_to')->nullable();
            $table->uuid('user_id');
            $table->integer('version')->default(1);
            $table->timestamps();
            $table->softDeletes();
            
            $table->foreign('product_id')->references('id')->on('products')->onDelete('cascade');
            $table->foreign('user_id')->references('id')->on('users')->onDelete('cascade');
            $table->index(['product_id', 'effective_from']);
            $table->index('user_id');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('rate_versions');
    }
};
