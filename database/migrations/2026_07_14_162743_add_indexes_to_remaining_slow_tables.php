<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        // directory_entries: full table scan on (section, sort_order, department)
        // Covering index includes all columns to avoid Key Lookups
        $exists = DB::select("SELECT 1 FROM sys.indexes WHERE name = 'idx_directory_entries_covering' AND object_id = OBJECT_ID('directory_entries')");
        if (empty($exists)) {
            DB::statement("
                CREATE NONCLUSTERED INDEX idx_directory_entries_covering
                ON directory_entries (section ASC, sort_order ASC, department ASC)
                INCLUDE (id, local_no, created_at, updated_at)
            ");
        }

        // hospital_systems: queried with ORDER BY name — small table but no index
        $exists = DB::select("SELECT 1 FROM sys.indexes WHERE name = 'idx_hospital_systems_name' AND object_id = OBJECT_ID('hospital_systems')");
        if (empty($exists)) {
            DB::statement("
                CREATE NONCLUSTERED INDEX idx_hospital_systems_name
                ON hospital_systems (name ASC)
                INCLUDE (id, url, is_sso, is_default, created_at, updated_at)
            ");
        }

        // video_orientations: queried with ORDER BY sort_order, created_at DESC
        $exists = DB::select("SELECT 1 FROM sys.indexes WHERE name = 'idx_video_orientations_covering' AND object_id = OBJECT_ID('video_orientations')");
        if (empty($exists)) {
            DB::statement("
                CREATE NONCLUSTERED INDEX idx_video_orientations_covering
                ON video_orientations (sort_order ASC, created_at DESC)
                INCLUDE (id, title, description, embed_url, video_path, is_active, updated_at)
            ");
        }
    }

    public function down(): void
    {
        DB::statement('DROP INDEX IF EXISTS idx_directory_entries_covering ON directory_entries');
        DB::statement('DROP INDEX IF EXISTS idx_hospital_systems_name ON hospital_systems');
        DB::statement('DROP INDEX IF EXISTS idx_video_orientations_covering ON video_orientations');
    }
};
