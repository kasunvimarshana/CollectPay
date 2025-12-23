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
            $table->foreignId('supplier_id')->constrained()->onDelete('cascade');
            $table->foreignId('user_id')->constrained();
            $table->decimal('amount', 10, 2);
            $table->enum('payment_type', ['advance', 'partial', 'full'])->default('partial');
            $table->enum('payment_method', ['cash', 'bank_transfer', 'mobile_money', 'check'])->default('cash');
            $table->string('reference_number')->nullable();
            $table->timestamp('payment_date');
            $table->text('notes')->nullable();
            $table->string('device_id')->nullable();
            $table->enum('sync_status', ['pending', 'synced', 'conflict'])->default('pending');
            $table->integer('version')->default(1);
            $table->timestamp('server_timestamp')->nullable();
            $table->timestamps();
            $table->softDeletes();

            $table->index(['supplier_id', 'payment_date']);
            $table->index(['user_id', 'payment_date']);
            $table->index(['sync_status', 'device_id']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('payments');
    }
};
