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
        // Check if index exists first (since it may have been applied manually)
        $exists = DB::select("SELECT * FROM sys.indexes WHERE name = 'idx_ticket_comments_covering' AND object_id = OBJECT_ID('imiss_ticket_comments')");
        
        if (empty($exists)) {
            // A covering index includes all requested columns so SQL Server never has to perform expensive Key Lookups against the clustered index.
            DB::statement('CREATE NONCLUSTERED INDEX idx_ticket_comments_covering ON imiss_ticket_comments (ticket_id, created_at) INCLUDE (sender_bioid, sender_name, message, attachments, updated_at, attachment_path, read_at)');
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        DB::statement('DROP INDEX IF EXISTS idx_ticket_comments_covering ON imiss_ticket_comments');
    }
};
