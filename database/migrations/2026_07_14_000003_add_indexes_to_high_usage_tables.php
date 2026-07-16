<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        // hr_documents - queried by type + is_active + sort_order/created_at on dashboard & hr portal
        // This table was missing indexes, causing full table scans and memory pool exhaustion
        Schema::table('hr_documents', function (Blueprint $table) {
            $table->index('type', 'idx_hr_docs_type');
            $table->index('is_active', 'idx_hr_docs_active');
            $table->index(['type', 'is_active', 'sort_order', 'created_at'], 'idx_hr_docs_type_active_sort');
        });
    }

    public function down(): void
    {
        Schema::table('hr_documents', function (Blueprint $table) {
            $table->dropIndex('idx_hr_docs_type');
            $table->dropIndex('idx_hr_docs_active');
            $table->dropIndex('idx_hr_docs_type_active_sort');
        });
    }
};
