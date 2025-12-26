<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('suppliers', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->string('code')->unique();
            $table->string('name');
            $table->string('contact_person')->nullable();
            $table->string('phone')->nullable();
            $table->string('email')->nullable();
            $table->text('address')->nullable();
            $table->string('region')->nullable();
            $table->string('district')->nullable();
            $table->decimal('latitude', 10, 8)->nullable();
            $table->decimal('longitude', 11, 8)->nullable();
            $table->string('payment_method')->default('cash'); // cash, bank_transfer, mobile_money
            $table->string('bank_name')->nullable();
            $table->string('bank_account')->nullable();
            $table->string('mobile_money_number')->nullable();
            $table->text('notes')->nullable();
            $table->boolean('is_active')->default(true);
            $table->uuid('created_by')->nullable();
            
            // Sync fields
            $table->uuid('client_id')->nullable()->index();
            $table->bigInteger('version')->default(1);
            $table->timestamp('synced_at')->nullable();
            $table->boolean('is_dirty')->default(false);
            $table->string('sync_status')->default('synced');
            
            $table->timestamps();
            $table->softDeletes();
            
            $table->foreign('created_by')->references('id')->on('users')->nullOnDelete();
            $table->index(['region', 'is_active']);
            $table->index(['synced_at']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('suppliers');
    }
};
