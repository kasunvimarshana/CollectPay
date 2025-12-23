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
            $table->string('uuid')->unique(); // For offline-first identification
            $table->foreignId('supplier_id')->constrained()->onDelete('cascade');
            $table->foreignId('product_id')->constrained()->onDelete('cascade');
            $table->foreignId('rate_id')->constrained()->onDelete('restrict');
            $table->date('collection_date');
            $table->decimal('quantity', 15, 3);
            $table->string('unit');
            $table->decimal('rate_applied', 15, 2);
            $table->decimal('amount', 15, 2);
            $table->text('notes')->nullable();
            $table->foreignId('collector_id')->constrained('users')->onDelete('restrict');
            $table->foreignId('created_by')->nullable()->constrained('users')->onDelete('set null');
            $table->foreignId('updated_by')->nullable()->constrained('users')->onDelete('set null');
            $table->timestamp('last_sync_at')->nullable();
            $table->unsignedBigInteger('version')->default(1);
            $table->enum('sync_status', ['pending', 'synced', 'conflict'])->default('pending');
            $table->timestamps();
            $table->softDeletes();
            
            $table->index('uuid');
            $table->index(['supplier_id', 'collection_date']);
            $table->index(['product_id', 'collection_date']);
            $table->index('collector_id');
            $table->index('sync_status');
            $table->index(['updated_at', 'version']);
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
