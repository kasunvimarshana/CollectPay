<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('payments', function (Blueprint $table) {
            $table->id();
            $table->string('uuid')->unique();
            $table->foreignId('supplier_id')->constrained()->onDelete('cascade');
            $table->string('payment_type')->default('full'); // advance, partial, full
            $table->decimal('amount', 10, 2);
            $table->date('payment_date');
            $table->time('payment_time')->nullable();
            $table->string('payment_method')->nullable(); // cash, bank_transfer, check
            $table->string('reference_number')->nullable();
            $table->decimal('outstanding_before', 10, 2)->default(0);
            $table->decimal('outstanding_after', 10, 2)->default(0);
            $table->text('notes')->nullable();
            $table->json('calculation_details')->nullable(); // Audit trail for auto-calculations
            $table->foreignId('processed_by')->constrained('users');
            $table->foreignId('created_by')->constrained('users');
            $table->foreignId('updated_by')->nullable()->constrained('users');
            $table->timestamps();
            $table->softDeletes();
            $table->integer('version')->default(1);
            $table->timestamp('synced_at')->nullable();
            
            $table->index(['supplier_id', 'payment_date']);
            $table->index(['uuid']);
            $table->index('synced_at');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('payments');
    }
};
