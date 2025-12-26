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
            $table->foreignId('rate_id')->nullable()->constrained()->onDelete('set null'); // Rate at time of collection
            $table->date('collection_date');
            $table->decimal('quantity', 10, 3); // Multi-unit quantity support
            $table->string('unit'); // Unit at time of collection
            $table->decimal('rate_applied', 10, 2); // Rate applied (frozen at collection time)
            $table->decimal('total_amount', 12, 2); // quantity * rate_applied
            $table->text('notes')->nullable();
            $table->boolean('is_synced')->default(false); // Sync status
            $table->timestamp('synced_at')->nullable();
            $table->foreignId('collected_by')->nullable()->constrained('users')->onDelete('set null');
            $table->foreignId('created_by')->nullable()->constrained('users')->onDelete('set null');
            $table->foreignId('updated_by')->nullable()->constrained('users')->onDelete('set null');
            $table->timestamps();
            $table->softDeletes();
            $table->integer('version')->default(1);
            
            $table->index(['uuid', 'is_synced']);
            $table->index(['supplier_id', 'collection_date']);
            $table->index(['product_id', 'collection_date']);
            $table->index('collection_date');
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
