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
        Schema::create('collection_items', function (Blueprint $table) {
            $table->id();
            $table->uuid('uuid')->unique();
            $table->foreignId('collection_id')->constrained()->onDelete('cascade');
            $table->foreignId('product_id')->constrained()->onDelete('restrict');
            $table->foreignId('product_rate_id')->nullable()->constrained()->onDelete('set null'); // Historical rate
            $table->decimal('quantity', 10, 2);
            $table->string('unit'); // kg, liter, etc.
            $table->decimal('rate', 10, 2); // Rate at time of collection (denormalized for history)
            $table->decimal('amount', 12, 2); // quantity * rate
            $table->text('notes')->nullable();
            $table->timestamps();
            $table->softDeletes();
            
            // For offline sync
            $table->timestamp('synced_at')->nullable();
            $table->string('device_id')->nullable();
            $table->unsignedBigInteger('version')->default(1);
            
            $table->index(['collection_id', 'product_id']);
            $table->index(['uuid', 'synced_at']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('collection_items');
    }
};
