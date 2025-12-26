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
            $table->uuid('uuid')->unique();
            $table->foreignId('supplier_id')->constrained()->onDelete('cascade');
            $table->foreignId('product_id')->constrained()->onDelete('cascade');
            $table->foreignId('rate_id')->nullable()->constrained()->onDelete('set null');
            $table->decimal('quantity', 12, 4);
            $table->string('unit')->default('kg');
            $table->decimal('rate_at_collection', 10, 4); // Immutable - rate at time of collection
            $table->decimal('total_value', 15, 2); // Calculated: quantity * rate_at_collection
            $table->timestamp('collected_at');
            $table->text('notes')->nullable();
            $table->enum('sync_status', ['synced', 'pending', 'failed'])->default('synced');
            $table->bigInteger('version')->default(1);
            $table->json('metadata')->nullable();
            $table->foreignId('collected_by')->nullable()->constrained('users')->onDelete('set null');
            $table->foreignId('created_by')->nullable()->constrained('users')->onDelete('set null');
            $table->foreignId('updated_by')->nullable()->constrained('users')->onDelete('set null');
            $table->timestamps();
            $table->softDeletes();
            
            $table->index(['supplier_id', 'product_id', 'collected_at']);
            $table->index('sync_status');
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
