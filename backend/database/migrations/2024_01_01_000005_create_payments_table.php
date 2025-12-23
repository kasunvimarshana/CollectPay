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
            $table->string('payment_number')->unique();
            $table->foreignId('supplier_id')->constrained()->cascadeOnDelete();
            $table->enum('payment_type', ['advance', 'partial', 'full', 'adjustment'])->default('partial');
            $table->decimal('amount', 12, 2);
            $table->dateTime('payment_date');
            $table->string('payment_method')->default('cash'); // cash, bank_transfer, mobile_money, etc.
            $table->string('reference_number')->nullable();
            $table->text('notes')->nullable();
            $table->foreignId('processed_by')->constrained('users')->cascadeOnDelete();
            
            // Offline sync fields
            $table->string('client_uuid')->unique()->nullable();
            $table->boolean('is_synced')->default(false);
            $table->dateTime('synced_at')->nullable();
            $table->integer('sync_version')->default(1);
            $table->string('device_id')->nullable();
            
            $table->timestamps();
            $table->softDeletes();
            
            $table->index(['supplier_id', 'payment_date']);
            $table->index(['processed_by', 'payment_date']);
            $table->index('is_synced');
            $table->index('client_uuid');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('payments');
    }
};
