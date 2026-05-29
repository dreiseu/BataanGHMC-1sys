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
        Schema::create('UserAuthority', function (Blueprint $table) {
            $table->string('BiometricID')->primary();
            $table->string('FullName')->nullable();
            $table->string('Section')->nullable();
            $table->string('Division')->nullable();
            $table->string('Position')->nullable();
            $table->string('SectionName')->nullable();
            $table->string('PositionName')->nullable();
            $table->integer('UserPrivilege')->default(0);
            $table->string('role')->default('user');
            $table->text('permissions')->nullable();
            $table->dateTime('LastLogin')->nullable();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('UserAuthority');
    }
};
