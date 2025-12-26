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
            $table->uuid('uuid')->unique();
            $table->foreignId('supplier_id')->constrained()->onDelete('cascade');
            $table->date('payment_date');
            $table->decimal('amount', 12, 2);
            $table->enum('payment_type', ['advance', 'partial', 'full', 'adjustment'])->default('partial');
            $table->string('payment_method')->nullable(); // cash, bank_transfer, check, etc.
            $table->string('reference_number')->nullable(); // Transaction/check number
            $table->text('notes')->nullable();
            $table->json('allocation')->nullable(); // How payment was allocated to collections
            $table->boolean('is_synced')->default(false);
            $table->timestamp('synced_at')->nullable();
            $table->foreignId('processed_by')->nullable()->constrained('users')->onDelete('set null');
            $table->foreignId('created_by')->nullable()->constrained('users')->onDelete('set null');
            $table->foreignId('updated_by')->nullable()->constrained('users')->onDelete('set null');
            $table->timestamps();
            $table->softDeletes();
            $table->integer('version')->default(1);
            
            $table->index(['uuid', 'is_synced']);
            $table->index(['supplier_id', 'payment_date']);
            $table->index('payment_date');
            $table->index('payment_type');
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
