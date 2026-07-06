<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('recognitions', function (Blueprint $table) {
            $table->id();
            $table->string('sender_name', 100);
            $table->string('sender_department', 100)->nullable();
            $table->string('recipient_name', 100);
            $table->string('recipient_department', 100)->nullable();
            $table->text('message');
            $table->unsignedInteger('likes_count')->default(0);
            $table->boolean('is_pinned')->default(false);
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('recognitions');
    }
};