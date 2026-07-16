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
        if (Schema::hasTable('imiss_ticket_comments')) {
            Schema::table('imiss_ticket_comments', function (Blueprint $table) {
                $table->index(['ticket_id', 'created_at'], 'idx_ticket_comments_ticket_created');
            });
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        if (Schema::hasTable('imiss_ticket_comments')) {
            Schema::table('imiss_ticket_comments', function (Blueprint $table) {
                $table->dropIndex('idx_ticket_comments_ticket_created');
            });
        }
    }
};
