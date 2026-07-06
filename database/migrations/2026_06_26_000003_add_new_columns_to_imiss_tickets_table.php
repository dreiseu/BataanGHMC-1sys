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
        Schema::table('imiss_tickets', function (Blueprint $table) {
            if (!Schema::hasColumn('imiss_tickets', 'remarks')) {
                $table->text('remarks')->nullable();
            }
            if (!Schema::hasColumn('imiss_tickets', 'accepted_by_name')) {
                $table->string('accepted_by_name')->nullable();
            }
            if (!Schema::hasColumn('imiss_tickets', 'accepted_at')) {
                $table->timestamp('accepted_at')->nullable();
            }
            if (!Schema::hasColumn('imiss_tickets', 'rating')) {
                $table->tinyInteger('rating')->nullable();
            }
            if (!Schema::hasColumn('imiss_tickets', 'feedback_text')) {
                $table->text('feedback_text')->nullable();
            }
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('imiss_tickets', function (Blueprint $table) {
            $table->dropColumn([
                'remarks',
                'accepted_by_name',
                'accepted_at',
                'rating',
                'feedback_text'
            ]);
        });
    }
};
