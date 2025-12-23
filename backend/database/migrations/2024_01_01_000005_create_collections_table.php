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
            $table->foreignId('supplier_id')->constrained()->onDelete('cascade');
            $table->foreignId('product_id')->constrained()->onDelete('cascade');
            $table->foreignId('user_id')->constrained();
            $table->decimal('quantity', 10, 3);
            $table->enum('unit', ['g', 'kg', 'ml', 'l'])->default('kg');
            $table->decimal('rate', 10, 2);
            $table->decimal('total_amount', 10, 2);
            $table->timestamp('collection_date');
            $table->text('notes')->nullable();
            $table->string('device_id')->nullable();
            $table->enum('sync_status', ['pending', 'synced', 'conflict'])->default('pending');
            $table->string('conflict_resolution')->nullable();
            $table->integer('version')->default(1);
            $table->timestamp('server_timestamp')->nullable();
            $table->timestamps();
            $table->softDeletes();

            $table->index(['supplier_id', 'collection_date']);
            $table->index(['product_id', 'collection_date']);
            $table->index(['user_id', 'collection_date']);
            $table->index(['sync_status', 'device_id']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('collections');
    }
};
