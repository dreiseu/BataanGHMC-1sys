<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('recognition_likes', function (Blueprint $table) {
            $table->id();
            $table->foreignId('recognition_id')->constrained()->cascadeOnDelete();
            $table->string('bioid');
            $table->timestamps();

            $table->unique(['recognition_id', 'bioid']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('recognition_likes');
    }
};