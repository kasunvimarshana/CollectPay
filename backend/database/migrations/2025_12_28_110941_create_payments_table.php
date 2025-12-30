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
            $table->foreignId('supplier_id')->constrained('suppliers')->onDelete('cascade');
            $table->foreignId('user_id')->constrained('users')->onDelete('cascade');
            $table->date('payment_date');
            $table->decimal('amount', 12, 2);
            $table->enum('type', ['advance', 'partial', 'full', 'adjustment'])->default('partial');
            $table->string('reference_number')->nullable()->unique();
            $table->string('payment_method')->nullable(); // cash, bank_transfer, check, etc.
            $table->text('notes')->nullable();
            $table->integer('version')->default(1);
            $table->timestamps();
            $table->softDeletes();
            
            $table->index(['supplier_id', 'payment_date']);
            $table->index(['user_id', 'payment_date']);
            $table->index('reference_number');
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
