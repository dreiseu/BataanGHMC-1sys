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
        if (!Schema::hasTable('imiss_request_types')) {
            Schema::create('imiss_request_types', function (Blueprint $table) {
                $table->id();
                $table->string('value')->unique();
                $table->string('label');
                $table->text('description')->nullable();
                $table->boolean('is_active')->default(true);
                $table->timestamps();
            });

            // Seed initial data
            $initialTypes = [
                ['value' => 'hardware', 'label' => 'Hardware Repair / Issue'],
                ['value' => 'network', 'label' => 'Network / Internet Connectivity'],
                ['value' => 'software', 'label' => 'Software Installation / Error'],
                ['value' => 'account', 'label' => 'Account Access / Password Reset'],
                ['value' => 'hims', 'label' => 'HIMS (Reopening / Cancellation)'],
                ['value' => 'emr', 'label' => 'EMR (Records / Charges)'],
                ['value' => 'other', 'label' => 'Other Inquiry'],
            ];

            foreach ($initialTypes as $type) {
                \App\Models\ImissRequestType::create($type);
            }
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('imiss_request_types');
    }
};
