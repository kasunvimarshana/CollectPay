<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('products', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->string('name');
            $table->string('code')->unique();
            $table->string('unit', 20); // kg, g, liters, etc.
            $table->text('description')->nullable();
            $table->uuid('user_id');
            $table->integer('version')->default(1);
            $table->timestamps();
            $table->softDeletes();
            
            $table->foreign('user_id')->references('id')->on('users')->onDelete('cascade');
            $table->index('code');
            $table->index('user_id');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('products');
    }
};
