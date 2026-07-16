<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        // SQL Server optimized indexes with correct sort direction
        DB::statement('CREATE INDEX idx_audit_logs_created_id_desc ON audit_logs (created_at DESC, id DESC)');
        
        // hr_documents already has an index from a previous migration, but it's ASC. Let's add a DESC one.
        DB::statement('CREATE INDEX idx_hr_docs_optimized ON hr_documents (type, is_active, sort_order ASC, created_at DESC)');
        
        // user_notifications is often queried by bioid and created_at DESC
        DB::statement('CREATE INDEX idx_user_notifications_optimized ON user_notifications (bioid, created_at DESC)');
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        DB::statement('DROP INDEX idx_audit_logs_created_id_desc ON audit_logs');
        DB::statement('DROP INDEX idx_hr_docs_optimized ON hr_documents');
        DB::statement('DROP INDEX idx_user_notifications_optimized ON user_notifications');
    }
};
