<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    public function up(): void
    {
        // Drop the two redundant separate indexes on user_notifications that were
        // created in earlier migrations (bioid+created_at ASC, and bioid+created_at DESC).
        // These cause SQL Server to do Key Lookups since they don't cover all selected columns.
        DB::statement('DROP INDEX IF EXISTS idx_user_notifications_bioid_created ON user_notifications');
        DB::statement('DROP INDEX IF EXISTS idx_user_notifications_optimized ON user_notifications');

        // Replace with a single proper covering index:
        // - Keyed on (bioid, created_at DESC) to match the exact query ORDER BY
        // - INCLUDEs all other columns so SELECT * requires zero Key Lookups
        $exists = DB::select("SELECT 1 FROM sys.indexes WHERE name = 'idx_user_notifications_covering' AND object_id = OBJECT_ID('user_notifications')");
        if (empty($exists)) {
            DB::statement('CREATE NONCLUSTERED INDEX idx_user_notifications_covering ON user_notifications (bioid, created_at DESC) INCLUDE (id, title, message, link, is_read, updated_at)');
        }
    }

    public function down(): void
    {
        DB::statement('DROP INDEX IF EXISTS idx_user_notifications_covering ON user_notifications');
        // Restore originals
        DB::statement('CREATE NONCLUSTERED INDEX idx_user_notifications_bioid_created ON user_notifications (bioid, created_at)');
        DB::statement('CREATE NONCLUSTERED INDEX idx_user_notifications_optimized ON user_notifications (bioid, created_at DESC)');
    }
};
