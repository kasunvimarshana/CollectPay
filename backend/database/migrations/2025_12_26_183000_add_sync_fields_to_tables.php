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
        // Add device_id and sync_metadata to suppliers
        Schema::table('suppliers', function (Blueprint $table) {
            $table->string('device_id')->nullable()->after('version');
            $table->json('sync_metadata')->nullable()->after('device_id');
            
            $table->index('device_id');
        });

        // Add device_id and sync_metadata to products
        Schema::table('products', function (Blueprint $table) {
            $table->string('device_id')->nullable()->after('version');
            $table->json('sync_metadata')->nullable()->after('device_id');
            
            $table->index('device_id');
        });

        // Add device_id and sync_metadata to product_rates
        Schema::table('product_rates', function (Blueprint $table) {
            $table->string('device_id')->nullable()->after('version');
            $table->json('sync_metadata')->nullable()->after('device_id');
            
            $table->index('device_id');
        });

        // Add device_id and sync_metadata to collections
        Schema::table('collections', function (Blueprint $table) {
            $table->string('device_id')->nullable()->after('version');
            $table->json('sync_metadata')->nullable()->after('device_id');
            
            $table->index('device_id');
            $table->index('collection_date');
        });

        // Add device_id and sync_metadata to payments
        Schema::table('payments', function (Blueprint $table) {
            $table->string('device_id')->nullable()->after('version');
            $table->json('sync_metadata')->nullable()->after('device_id');
            
            $table->index('device_id');
            $table->index('payment_date');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('suppliers', function (Blueprint $table) {
            $table->dropIndex(['device_id']);
            $table->dropColumn(['device_id', 'sync_metadata']);
        });

        Schema::table('products', function (Blueprint $table) {
            $table->dropIndex(['device_id']);
            $table->dropColumn(['device_id', 'sync_metadata']);
        });

        Schema::table('product_rates', function (Blueprint $table) {
            $table->dropIndex(['device_id']);
            $table->dropColumn(['device_id', 'sync_metadata']);
        });

        Schema::table('collections', function (Blueprint $table) {
            $table->dropIndex(['device_id']);
            $table->dropColumn(['device_id', 'sync_metadata']);
        });

        Schema::table('payments', function (Blueprint $table) {
            $table->dropIndex(['device_id']);
            $table->dropColumn(['device_id', 'sync_metadata']);
        });
    }
};
