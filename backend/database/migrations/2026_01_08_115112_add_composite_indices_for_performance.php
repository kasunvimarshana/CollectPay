<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     *
     * Adds composite indices to improve query performance
     * for commonly used query patterns
     */
    public function up(): void
    {
        // Suppliers - frequently queried by status and region
        Schema::table('suppliers', function (Blueprint $table) {
            $table->index('is_active', 'idx_suppliers_is_active');
            $table->index(['region', 'is_active'], 'idx_suppliers_region_active');
        });

        // Products - frequently queried by status
        Schema::table('products', function (Blueprint $table) {
            $table->index('is_active', 'idx_products_is_active');
        });

        // Rates - frequently queried by product, effective date, and unit
        Schema::table('rates', function (Blueprint $table) {
            $table->index(['product_id', 'effective_from', 'unit'], 'idx_rates_product_date_unit');
            $table->index(['effective_from', 'unit'], 'idx_rates_date_unit');
        });

        // Payments - frequently queried by supplier, date, and type
        Schema::table('payments', function (Blueprint $table) {
            $table->index(['supplier_id', 'payment_date'], 'idx_payments_supplier_date');
            $table->index(['type', 'payment_date'], 'idx_payments_type_date');
            $table->index('payment_date', 'idx_payments_date');
        });

        // Audit Logs - frequently queried by user and date
        Schema::table('audit_logs', function (Blueprint $table) {
            $table->index(['user_id', 'created_at'], 'idx_audit_logs_user_created');
            $table->index(['event', 'created_at'], 'idx_audit_logs_event_created');
            $table->index('created_at', 'idx_audit_logs_created');
        });

        // Collections - additional indices for performance
        // Note: Some indices already exist from original migration
        Schema::table('collections', function (Blueprint $table) {
            $table->index('collection_date', 'idx_collections_date');
            $table->index(['product_id', 'unit'], 'idx_collections_product_unit');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        // Drop indices for suppliers
        Schema::table('suppliers', function (Blueprint $table) {
            $table->dropIndex('idx_suppliers_is_active');
            $table->dropIndex('idx_suppliers_region_active');
        });

        // Drop indices for products
        Schema::table('products', function (Blueprint $table) {
            $table->dropIndex('idx_products_is_active');
        });

        // Drop indices for rates
        Schema::table('rates', function (Blueprint $table) {
            $table->dropIndex('idx_rates_product_date_unit');
            $table->dropIndex('idx_rates_date_unit');
        });

        // Drop indices for payments
        Schema::table('payments', function (Blueprint $table) {
            $table->dropIndex('idx_payments_supplier_date');
            $table->dropIndex('idx_payments_type_date');
            $table->dropIndex('idx_payments_date');
        });

        // Drop indices for audit_logs
        Schema::table('audit_logs', function (Blueprint $table) {
            $table->dropIndex('idx_audit_logs_user_created');
            $table->dropIndex('idx_audit_logs_event_created');
            $table->dropIndex('idx_audit_logs_created');
        });

        // Drop indices for collections
        Schema::table('collections', function (Blueprint $table) {
            $table->dropIndex('idx_collections_date');
            $table->dropIndex('idx_collections_product_unit');
        });
    }
};
