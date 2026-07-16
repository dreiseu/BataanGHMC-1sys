<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('events', function (Blueprint $table) {
            $table->index('is_active', 'idx_events_is_active');
            $table->index('event_date', 'idx_events_event_date');
            $table->index(['is_active', 'event_date'], 'idx_events_active_date');
        });
    }

    public function down(): void
    {
        Schema::table('events', function (Blueprint $table) {
            $table->dropIndex('idx_events_is_active');
            $table->dropIndex('idx_events_event_date');
            $table->dropIndex('idx_events_active_date');
        });
    }
};