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
            $table->string('collection_number')->unique();
            $table->foreignId('supplier_id')->constrained()->onDelete('cascade');
            $table->foreignId('collected_by')->constrained('users')->onDelete('restrict');
            $table->timestamp('collected_at');
            $table->text('notes')->nullable();
            $table->enum('status', ['pending', 'confirmed', 'cancelled'])->default('pending');
            $table->decimal('total_amount', 12, 2)->default(0); // Calculated total
            $table->json('metadata')->nullable();
            $table->timestamps();
            $table->softDeletes();
            
            // For offline sync and conflict resolution
            $table->timestamp('synced_at')->nullable();
            $table->string('device_id')->nullable();
            $table->unsignedBigInteger('version')->default(1);
            $table->timestamp('client_created_at')->nullable();
            $table->string('conflict_status')->nullable(); // null, 'detected', 'resolved'
            $table->json('conflict_data')->nullable();
            
            $table->index(['supplier_id', 'collected_at']);
            $table->index(['uuid', 'synced_at']);
            $table->index(['device_id', 'client_created_at']);
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
