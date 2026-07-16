<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        if (!Schema::hasTable('directory_entries')) {
            return;
        }

        Schema::table('directory_entries', function (Blueprint $table) {
            if (!Schema::hasColumn('directory_entries', 'created_at')) {
                $table->timestamp('created_at')->nullable();
            }

            if (!Schema::hasColumn('directory_entries', 'updated_at')) {
                $table->timestamp('updated_at')->nullable();
            }
        });
    }

    public function down(): void
    {
        // Intentionally left empty to avoid dropping shared timestamp columns.
    }
};
