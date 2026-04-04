<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     *
     * Makes rate_id, rate_applied, and total_amount nullable so that collections
     * can be created without an immediately assigned rate. Rates can be applied
     * at a later stage via the apply-rate endpoint.
     */
    public function up(): void
    {
        Schema::table('collections', function (Blueprint $table) {
            $table->foreignId('rate_id')->nullable()->change();
            $table->decimal('rate_applied', 10, 2)->nullable()->change();
            $table->decimal('total_amount', 12, 2)->nullable()->change();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('collections', function (Blueprint $table) {
            $table->foreignId('rate_id')->nullable(false)->change();
            $table->decimal('rate_applied', 10, 2)->nullable(false)->change();
            $table->decimal('total_amount', 12, 2)->nullable(false)->change();
        });
    }
};
