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
        Schema::table('imiss_ticket_comments', function (Blueprint $table) {
            if (!Schema::hasColumn('imiss_ticket_comments', 'attachment_path')) {
                $table->string('attachment_path')->nullable();
            }
            if (!Schema::hasColumn('imiss_ticket_comments', 'read_at')) {
                $table->timestamp('read_at')->nullable();
            }
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('imiss_ticket_comments', function (Blueprint $table) {
            $table->dropColumn(['attachment_path', 'read_at']);
        });
    }
};
