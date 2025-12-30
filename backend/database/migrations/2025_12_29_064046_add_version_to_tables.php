<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     * Add version columns to tables for optimistic locking
     */
    public function up(): void
    {
        // Add version to suppliers table if not exists
        if (!Schema::hasColumn('suppliers', 'version')) {
            Schema::table('suppliers', function (Blueprint $table) {
                $table->unsignedInteger('version')->default(1)->after('is_active');
                $table->index('version');
            });
        }

        // Add version to products table if not exists
        if (!Schema::hasColumn('products', 'version')) {
            Schema::table('products', function (Blueprint $table) {
                $table->unsignedInteger('version')->default(1)->after('is_active');
                $table->index('version');
            });
        }

        // Collections and payments already have version in their migrations
        // Verify they exist
        if (!Schema::hasColumn('collections', 'version')) {
            Schema::table('collections', function (Blueprint $table) {
                $table->unsignedInteger('version')->default(1)->after('notes');
                $table->index('version');
            });
        }

        if (!Schema::hasColumn('payments', 'version')) {
            Schema::table('payments', function (Blueprint $table) {
                $table->unsignedInteger('version')->default(1)->after('notes');
                $table->index('version');
            });
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('suppliers', function (Blueprint $table) {
            if (Schema::hasColumn('suppliers', 'version')) {
                $table->dropColumn('version');
            }
        });

        Schema::table('products', function (Blueprint $table) {
            if (Schema::hasColumn('products', 'version')) {
                $table->dropColumn('version');
            }
        });

        Schema::table('collections', function (Blueprint $table) {
            if (Schema::hasColumn('collections', 'version')) {
                $table->dropColumn('version');
            }
        });

        Schema::table('payments', function (Blueprint $table) {
            if (Schema::hasColumn('payments', 'version')) {
                $table->dropColumn('version');
            }
        });
    }
};
