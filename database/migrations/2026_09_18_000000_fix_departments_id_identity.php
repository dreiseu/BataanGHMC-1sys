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
        if (! Schema::hasTable('departments')) {
            return;
        }

        // The existing 'id' column was created without the IDENTITY property
        // (e.g. via a manual script), so every insert that omits 'id' fails
        // with "Cannot insert the value NULL into column 'id'". Recreate the
        // table with a proper auto-incrementing primary key, preserving any
        // rows that already exist.
        $existing = DB::table('departments')->get(['Code', 'Department']);

        Schema::drop('departments');

        Schema::create('departments', function (Blueprint $table) {
            $table->id();
            $table->string('Code', 50)->nullable()->unique();
            $table->string('Department')->unique();
        });

        foreach ($existing as $row) {
            DB::table('departments')->insert([
                'Code' => $row->Code,
                'Department' => $row->Department,
            ]);
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        // No-op: this migration only repairs the 'id' column's IDENTITY property.
    }
};
