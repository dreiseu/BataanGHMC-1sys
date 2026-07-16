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
        if (Schema::hasTable('user_notifications')) {
            Schema::table('user_notifications', function (Blueprint $table) {
                // Add composite indexes for common queries to avoid full table scans
                $table->index(['bioid', 'created_at'], 'idx_user_notifications_bioid_created');
                $table->index(['bioid', 'is_read'], 'idx_user_notifications_bioid_read');
            });
        }

        if (Schema::hasTable('imiss_tickets')) {
            Schema::table('imiss_tickets', function (Blueprint $table) {
                // Index bio_id and created_at which is used heavily by polling
                $table->index(['bio_id', 'created_at'], 'idx_imiss_tickets_bio_created');
                $table->index(['status'], 'idx_imiss_tickets_status');
            });
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        if (Schema::hasTable('user_notifications')) {
            Schema::table('user_notifications', function (Blueprint $table) {
                $table->dropIndex('idx_user_notifications_bioid_created');
                $table->dropIndex('idx_user_notifications_bioid_read');
            });
        }

        if (Schema::hasTable('imiss_tickets')) {
            Schema::table('imiss_tickets', function (Blueprint $table) {
                $table->dropIndex('idx_imiss_tickets_bio_created');
                $table->dropIndex('idx_imiss_tickets_status');
            });
        }
    }
};
