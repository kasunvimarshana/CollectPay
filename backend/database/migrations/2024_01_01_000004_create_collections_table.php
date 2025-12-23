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
            $table->string('collection_number')->unique(); // Auto-generated
            $table->foreignId('supplier_id')->constrained()->cascadeOnDelete();
            $table->foreignId('product_id')->constrained()->cascadeOnDelete();
            $table->foreignId('collector_id')->constrained('users')->cascadeOnDelete();
            $table->decimal('quantity', 10, 3);
            $table->enum('unit', ['gram', 'kilogram', 'liter', 'milliliter']);
            $table->decimal('quantity_in_base_unit', 10, 3); // Normalized quantity
            $table->foreignId('rate_id')->constrained('product_rates')->cascadeOnDelete();
            $table->decimal('rate_applied', 10, 2); // Rate at time of collection
            $table->decimal('amount', 12, 2); // Calculated amount
            $table->dateTime('collected_at');
            $table->text('notes')->nullable();
            $table->json('metadata')->nullable();
            
            // Offline sync fields
            $table->string('client_uuid')->unique()->nullable(); // UUID from mobile app
            $table->boolean('is_synced')->default(false);
            $table->dateTime('synced_at')->nullable();
            $table->integer('sync_version')->default(1);
            $table->string('device_id')->nullable();
            
            $table->timestamps();
            $table->softDeletes();
            
            $table->index(['supplier_id', 'collected_at']);
            $table->index(['collector_id', 'collected_at']);
            $table->index(['product_id', 'collected_at']);
            $table->index('is_synced');
            $table->index('client_uuid');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('collections');
    }
};
