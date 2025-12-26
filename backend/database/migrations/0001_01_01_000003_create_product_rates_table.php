<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        // Product rates with versioning for historical tracking
        Schema::create('product_rates', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->foreignUuid('product_id')->constrained()->cascadeOnDelete();
            $table->decimal('rate', 15, 4); // Rate per primary unit
            $table->string('currency')->default('LKR');
            $table->date('effective_from');
            $table->date('effective_to')->nullable();
            $table->boolean('is_current')->default(false);
            $table->text('notes')->nullable();
            $table->uuid('created_by')->nullable();
            
            // Sync fields
            $table->uuid('client_id')->nullable()->index();
            $table->bigInteger('version')->default(1);
            $table->timestamp('synced_at')->nullable();
            $table->boolean('is_dirty')->default(false);
            $table->string('sync_status')->default('synced');
            
            $table->timestamps();
            $table->softDeletes();
            
            $table->foreign('created_by')->references('id')->on('users')->nullOnDelete();
            $table->index(['product_id', 'effective_from', 'effective_to']);
            $table->index(['product_id', 'is_current']);
            $table->index(['synced_at']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('product_rates');
    }
};
