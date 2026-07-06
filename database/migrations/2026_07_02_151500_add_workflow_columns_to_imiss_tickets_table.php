<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('imiss_tickets', function (Blueprint $table) {
            // Rename accepted_by_name to accepted_by
            if (Schema::hasColumn('imiss_tickets', 'accepted_by_name')) {
                $table->renameColumn('accepted_by_name', 'accepted_by');
            }
            
            // Add new timestamp columns
            if (!Schema::hasColumn('imiss_tickets', 'cancelled_at')) {
                $table->timestamp('cancelled_at')->nullable();
            }
            if (!Schema::hasColumn('imiss_tickets', 'reviewed_at')) {
                $table->timestamp('reviewed_at')->nullable();
            }
            if (!Schema::hasColumn('imiss_tickets', 'endorsed_at')) {
                $table->timestamp('endorsed_at')->nullable();
            }
            if (!Schema::hasColumn('imiss_tickets', 'returned_at')) {
                $table->timestamp('returned_at')->nullable();
            }
            if (!Schema::hasColumn('imiss_tickets', 'finished_at')) {
                $table->timestamp('finished_at')->nullable();
            }
            if (!Schema::hasColumn('imiss_tickets', 'resolved_at')) {
                $table->timestamp('resolved_at')->nullable();
            }
            
            // Add new bio_id user columns
            if (!Schema::hasColumn('imiss_tickets', 'reviewed_by')) {
                $table->string('reviewed_by')->nullable();
            }
            if (!Schema::hasColumn('imiss_tickets', 'endorsed_by')) {
                $table->string('endorsed_by')->nullable();
            }
            if (!Schema::hasColumn('imiss_tickets', 'returned_by')) {
                $table->string('returned_by')->nullable();
            }
            if (!Schema::hasColumn('imiss_tickets', 'finished_by')) {
                $table->string('finished_by')->nullable();
            }
        });
    }

    public function down(): void
    {
        Schema::table('imiss_tickets', function (Blueprint $table) {
            if (Schema::hasColumn('imiss_tickets', 'accepted_by')) {
                $table->renameColumn('accepted_by', 'accepted_by_name');
            }
            
            $table->dropColumn([
                'cancelled_at',
                'reviewed_at',
                'endorsed_at',
                'returned_at',
                'finished_at',
                'resolved_at',
                'reviewed_by',
                'endorsed_by',
                'returned_by',
                'finished_by'
            ]);
        });
    }
};
