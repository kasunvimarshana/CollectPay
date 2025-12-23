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
        Schema::create('payments', function (Blueprint $table) {
            $table->id();
            $table->string('uuid')->unique(); // For offline-first identification
            $table->string('reference_number')->unique();
            $table->foreignId('supplier_id')->constrained()->onDelete('cascade');
            $table->date('payment_date');
            $table->decimal('amount', 15, 2);
            $table->enum('payment_type', ['advance', 'partial', 'full', 'adjustment'])->default('partial');
            $table->enum('payment_method', ['cash', 'bank_transfer', 'cheque', 'mobile'])->default('cash');
            $table->string('transaction_reference')->nullable();
            $table->text('notes')->nullable();
            $table->decimal('balance_before', 15, 2)->default(0);
            $table->decimal('balance_after', 15, 2)->default(0);
            $table->foreignId('processed_by')->constrained('users')->onDelete('restrict');
            $table->foreignId('created_by')->nullable()->constrained('users')->onDelete('set null');
            $table->foreignId('updated_by')->nullable()->constrained('users')->onDelete('set null');
            $table->timestamp('last_sync_at')->nullable();
            $table->unsignedBigInteger('version')->default(1);
            $table->enum('sync_status', ['pending', 'synced', 'conflict'])->default('pending');
            $table->timestamps();
            $table->softDeletes();
            
            $table->index('uuid');
            $table->index('reference_number');
            $table->index(['supplier_id', 'payment_date']);
            $table->index('processed_by');
            $table->index('sync_status');
            $table->index(['updated_at', 'version']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('payments');
    }
};
