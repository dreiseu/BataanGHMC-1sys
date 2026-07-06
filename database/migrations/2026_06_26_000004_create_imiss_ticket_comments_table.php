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
        if (!Schema::hasTable('imiss_ticket_comments')) {
            Schema::create('imiss_ticket_comments', function (Blueprint $table) {
                $table->id();
                $table->foreignId('ticket_id')->constrained('imiss_tickets')->onDelete('cascade');
                $table->string('sender_bioid');
                $table->string('sender_name');
                $table->text('message')->nullable();
                $table->string('attachment_path')->nullable();
                $table->text('attachments')->nullable();
                $table->timestamp('read_at')->nullable();
                $table->timestamps();
            });
        } else {
            Schema::table('imiss_ticket_comments', function (Blueprint $table) {
                if (!Schema::hasColumn('imiss_ticket_comments', 'attachment_path')) {
                    $table->string('attachment_path')->nullable();
                }
                if (!Schema::hasColumn('imiss_ticket_comments', 'attachments')) {
                    $table->text('attachments')->nullable();
                }
                if (!Schema::hasColumn('imiss_ticket_comments', 'read_at')) {
                    $table->timestamp('read_at')->nullable();
                }
                // Allow message to be nullable in case they only send an attachment
                $table->text('message')->nullable()->change();
            });
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('imiss_ticket_comments');
    }
};
