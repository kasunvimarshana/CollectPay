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
            $table->foreignId('supplier_id')->constrained()->onDelete('cascade');
            $table->foreignId('user_id')->constrained()->onDelete('cascade'); // User who recorded the payment
            $table->date('payment_date');
            $table->decimal('amount', 10, 2);
            $table->enum('type', ['advance', 'partial', 'full'])->default('partial');
            $table->string('reference_number')->nullable(); // Receipt or transaction reference
            $table->text('notes')->nullable();
            $table->unsignedInteger('version')->default(1); // For optimistic locking
            $table->timestamps();
            $table->softDeletes();
            
            // Indexes for efficient queries
            $table->index(['supplier_id', 'payment_date']);
            $table->index('user_id');
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
