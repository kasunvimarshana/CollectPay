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
            $table->string('reference_number')->unique();
            $table->foreignUuid('supplier_id')->constrained()->cascadeOnDelete();
            $table->foreignUuid('product_id')->constrained()->cascadeOnDelete();
            $table->foreignUuid('rate_id')->nullable()->constrained('product_rates')->nullOnDelete();
            
            // Quantity with multi-unit support
            $table->decimal('quantity', 15, 4);
            $table->string('unit')->default('kg');
            $table->decimal('quantity_in_primary_unit', 15, 4); // Converted to primary unit
            
            // Rate snapshot at collection time (immutable for historical accuracy)
            $table->decimal('rate_at_collection', 15, 4);
            $table->string('rate_currency')->default('LKR');
            
            // Calculated amount
            $table->decimal('gross_amount', 15, 4);
            
            // Collection metadata
            $table->date('collection_date');
            $table->time('collection_time')->nullable();
            $table->decimal('latitude', 10, 8)->nullable();
            $table->decimal('longitude', 11, 8)->nullable();
            $table->string('quality_grade')->nullable(); // A, B, C, etc.
            $table->decimal('quality_deduction_percent', 5, 2)->default(0);
            $table->decimal('net_amount', 15, 4);
            $table->text('notes')->nullable();
            
            $table->uuid('collected_by');
            $table->string('status')->default('pending'); // pending, confirmed, disputed, cancelled
            
            // Sync fields
            $table->uuid('client_id')->nullable()->index();
            $table->bigInteger('version')->default(1);
            $table->timestamp('synced_at')->nullable();
            $table->boolean('is_dirty')->default(false);
            $table->string('sync_status')->default('synced');
            
            $table->timestamps();
            $table->softDeletes();
            
            $table->foreign('collected_by')->references('id')->on('users')->cascadeOnDelete();
            $table->index(['supplier_id', 'collection_date']);
            $table->index(['product_id', 'collection_date']);
            $table->index(['collection_date', 'status']);
            $table->index(['synced_at']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('collections');
    }
};
