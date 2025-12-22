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
            $table->uuid('client_id')->unique(); // For offline sync
            $table->foreignId('user_id')->constrained()->onDelete('cascade');
            $table->foreignId('supplier_id')->constrained()->onDelete('cascade');
            $table->foreignId('product_id')->constrained()->onDelete('cascade');
            $table->decimal('quantity', 12, 3);
            $table->string('unit');
            $table->decimal('rate', 10, 2);
            $table->decimal('amount', 12, 2);
            $table->dateTime('collection_date');
            $table->text('notes')->nullable();
            $table->json('metadata')->nullable();
            $table->timestamps();
            $table->softDeletes();
            $table->timestamp('synced_at')->nullable();
            $table->integer('version')->default(1); // For conflict resolution
            
            $table->index(['user_id', 'collection_date']);
            $table->index(['supplier_id', 'collection_date']);
            $table->index('client_id');
        });

        Schema::create('payments', function (Blueprint $table) {
            $table->id();
            $table->uuid('client_id')->unique(); // For offline sync
            $table->foreignId('user_id')->constrained()->onDelete('cascade');
            $table->foreignId('supplier_id')->constrained()->onDelete('cascade');
            $table->foreignId('collection_id')->nullable()->constrained()->onDelete('set null');
            $table->string('payment_type'); // advance, partial, full
            $table->decimal('amount', 12, 2);
            $table->dateTime('payment_date');
            $table->string('payment_method')->nullable(); // cash, bank_transfer, check
            $table->string('reference_number')->nullable();
            $table->text('notes')->nullable();
            $table->json('metadata')->nullable();
            $table->timestamps();
            $table->softDeletes();
            $table->timestamp('synced_at')->nullable();
            $table->integer('version')->default(1); // For conflict resolution
            
            $table->index(['user_id', 'payment_date']);
            $table->index(['supplier_id', 'payment_date']);
            $table->index('client_id');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('payments');
        Schema::dropIfExists('collections');
    }
};
