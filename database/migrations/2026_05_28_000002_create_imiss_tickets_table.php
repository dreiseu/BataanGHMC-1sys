<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('imiss_tickets', function (Blueprint $table) {
            $table->id();
            $table->string('ticket_number')->unique();
            $table->string('bio_id');
            $table->string('request_type')->nullable();
            $table->text('description');
            $table->string('location')->nullable();
            $table->string('local_number')->nullable();
            $table->string('priority')->default('normal');
            $table->json('attachments')->nullable();
            $table->string('status')->default('Ticket Submitted');
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('imiss_tickets');
    }
};
