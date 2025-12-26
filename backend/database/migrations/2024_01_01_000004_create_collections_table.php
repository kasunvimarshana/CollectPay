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
            $table->string('collection_number')->unique();
            $table->foreignId('supplier_id')->constrained()->onDelete('cascade');
            $table->foreignId('product_id')->constrained()->onDelete('cascade');
            $table->foreignId('collector_id')->constrained('users')->onDelete('cascade');
            $table->date('collection_date');
            $table->decimal('quantity', 10, 3); // Quantity collected
            $table->string('unit'); // kg, g, etc.
            $table->foreignId('rate_id')->nullable()->constrained('product_rates')->onDelete('set null');
            $table->decimal('rate_applied', 10, 2); // Rate at time of collection
            $table->decimal('total_amount', 12, 2); // quantity * rate
            $table->text('notes')->nullable();
            $table->json('metadata')->nullable();
            $table->integer('version')->default(1); // For optimistic locking
            $table->timestamps();
            $table->softDeletes();
            
            $table->index(['supplier_id', 'collection_date']);
            $table->index(['product_id', 'collection_date']);
            $table->index(['collector_id', 'collection_date']);
            $table->index('collection_date');
            $table->index('collection_number');
        });

        // Audit trail for collections
        Schema::create('collection_audit_logs', function (Blueprint $table) {
            $table->id();
            $table->foreignId('collection_id')->constrained()->onDelete('cascade');
            $table->string('action'); // created, updated, deleted
            $table->json('old_data')->nullable();
            $table->json('new_data')->nullable();
            $table->foreignId('user_id')->nullable()->constrained()->onDelete('set null');
            $table->string('ip_address')->nullable();
            $table->timestamps();
            
            $table->index(['collection_id', 'action']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('collection_audit_logs');
        Schema::dropIfExists('collections');
    }
};
