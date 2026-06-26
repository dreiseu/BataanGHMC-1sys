<?php

use Illuminate\Support\Facades\Route;
use Inertia\Inertia;
use Laravel\Fortify\Features;
use App\Http\Controllers\DirectoryController;
use App\Http\Controllers\ImissController;
use App\Http\Controllers\SystemController;
use App\Http\Controllers\ImissRequestTypeController;

Route::get('/migrate-remarks', function() {
    \Illuminate\Support\Facades\Schema::table('imiss_tickets', function (\Illuminate\Database\Schema\Blueprint $table) {
        if (!\Illuminate\Support\Facades\Schema::hasColumn('imiss_tickets', 'remarks')) {
            $table->text('remarks')->nullable();
        }
        if (!\Illuminate\Support\Facades\Schema::hasColumn('imiss_tickets', 'accepted_by_name')) {
            $table->string('accepted_by_name')->nullable();
        }
        if (!\Illuminate\Support\Facades\Schema::hasColumn('imiss_tickets', 'accepted_at')) {
            $table->timestamp('accepted_at')->nullable();
        }
    });
    return 'done';
});

Route::get('/migrate-preferences', function() {
    if (!\Illuminate\Support\Facades\Schema::hasTable('user_preferences')) {
        \Illuminate\Support\Facades\Schema::create('user_preferences', function (\Illuminate\Database\Schema\Blueprint $table) {
            $table->id();
            $table->string('bioid')->unique();
            $table->json('pinned_modules')->nullable();
            $table->timestamps();
        });
    }
    return 'done';
});

Route::get('/migrate-imiss-v2', function() {
    \Illuminate\Support\Facades\Schema::table('imiss_tickets', function (\Illuminate\Database\Schema\Blueprint $table) {
        if (!\Illuminate\Support\Facades\Schema::hasColumn('imiss_tickets', 'rating')) {
            $table->tinyInteger('rating')->nullable();
        }
        if (!\Illuminate\Support\Facades\Schema::hasColumn('imiss_tickets', 'feedback_text')) {
            $table->text('feedback_text')->nullable();
        }
    });

    if (!\Illuminate\Support\Facades\Schema::hasTable('imiss_ticket_comments')) {
        \Illuminate\Support\Facades\Schema::create('imiss_ticket_comments', function (\Illuminate\Database\Schema\Blueprint $table) {
            $table->id();
            $table->foreignId('ticket_id')->constrained('imiss_tickets')->onDelete('cascade');
            $table->string('sender_bioid');
            $table->string('sender_name');
            $table->text('message')->nullable();
            $table->text('attachments')->nullable();
            $table->timestamps();
        });
    } else {
        \Illuminate\Support\Facades\Schema::table('imiss_ticket_comments', function (\Illuminate\Database\Schema\Blueprint $table) {
            if (!\Illuminate\Support\Facades\Schema::hasColumn('imiss_ticket_comments', 'attachments')) {
                $table->text('attachments')->nullable();
            }
            // Allow message to be nullable in case they only send an attachment
            $table->text('message')->nullable()->change();
        });
    }

    if (!\Illuminate\Support\Facades\Schema::hasTable('user_notifications')) {
        \Illuminate\Support\Facades\Schema::create('user_notifications', function (\Illuminate\Database\Schema\Blueprint $table) {
            $table->id();
            $table->string('bioid');
            $table->string('title');
            $table->string('message');
            $table->string('link')->nullable();
            $table->boolean('is_read')->default(false);
            $table->timestamps();
        });
    }

    return 'done';
});

Route::get('/migrate-imiss-request-types', function() {
    if (!\Illuminate\Support\Facades\Schema::hasTable('imiss_request_types')) {
        \Illuminate\Support\Facades\Schema::create('imiss_request_types', function (\Illuminate\Database\Schema\Blueprint $table) {
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
    return 'done';
});

Route::post('/session-end', function () {
    Auth::logout();
    request()->session()->invalidate();
    request()->session()->regenerateToken();
    return response()->noContent();
})->middleware('web')->name('session.end');

Route::redirect('/', '/login')->name('home');

Route::middleware(['auth', 'verified'])->group(function () {
    Route::get('dashboard', function () {
        $prefs = \Illuminate\Support\Facades\DB::table('user_preferences')
            ->where('bioid', auth()->user()->bioid)
            ->first();
        $pinnedModules = $prefs && $prefs->pinned_modules ? json_decode($prefs->pinned_modules, true) : [];
        return Inertia::render('dashboard', [
            'pinnedModules' => $pinnedModules
        ]);
    })->name('dashboard');

    Route::post('/user-preferences/pinned-modules', function (\Illuminate\Http\Request $request) {
        $validated = $request->validate([
            'pinned_modules' => 'array',
            'pinned_modules.*' => 'string'
        ]);

        \Illuminate\Support\Facades\DB::table('user_preferences')->updateOrInsert(
            ['bioid' => auth()->user()->bioid],
            ['pinned_modules' => json_encode($validated['pinned_modules']), 'updated_at' => now()]
        );
        return back();
    });

    Route::inertia('/hr-portal', 'hr-portal');
    Route::inertia('/hr-portal/video-orientation', 'hr-portal/video-orientation');
    Route::inertia('/hr-portal/downloadable-forms', 'hr-portal/downloadable-forms');
    Route::inertia('/hr-portal/policies', 'hr-portal/policies');
    Route::inertia('/hr-portal/leave-benefits', 'hr-portal/leave-benefits');
    Route::inertia('/hr-portal/announcements', 'hr-portal/announcements');
    Route::inertia('/hr-portal/faqs', 'hr-portal/faqs');

    Route::inertia('/petro', 'petro');
    Route::inertia('/pgs', 'pgs');
    Route::inertia('/covid-sat', 'covid-sat');
    Route::inertia('/efms', 'efms');
    Route::get('/imiss', [ImissController::class, 'index'])->name('imiss');
    Route::post('/imiss/tickets', [ImissController::class, 'store'])->name('imiss.ticket.store');
    Route::put('/imiss/tickets/{ticket}/resolve', [ImissController::class, 'resolve'])->name('imiss.ticket.resolve');
    Route::put('/imiss/tickets/{ticket}/cancel', [ImissController::class, 'cancel'])->name('imiss.ticket.cancel');
    Route::put('/imiss/tickets/{ticket}/correction', [ImissController::class, 'correction'])->name('imiss.ticket.correction');
    Route::post('/imiss/tickets/{ticket}/comments', [ImissController::class, 'storeComment'])->name('imiss.ticket.comments.store');
    
    Route::get('/notifications', [\App\Http\Controllers\NotificationController::class, 'index']);
    Route::post('/notifications', [\App\Http\Controllers\NotificationController::class, 'store']);
    Route::post('/notifications/{notification}/read', [\App\Http\Controllers\NotificationController::class, 'markAsRead']);
    Route::post('/notifications/{notification}/unread', [\App\Http\Controllers\NotificationController::class, 'markAsUnread']);
    Route::delete('/notifications/{notification}', [\App\Http\Controllers\NotificationController::class, 'destroy']);
    Route::post('/notifications/bulk-read', [\App\Http\Controllers\NotificationController::class, 'bulkRead']);
    Route::post('/notifications/bulk-delete', [\App\Http\Controllers\NotificationController::class, 'bulkDelete']);
    Route::post('/notifications/read-by-ticket', [\App\Http\Controllers\NotificationController::class, 'markTicketAsRead']);
    Route::get('/imiss/admin', [ImissController::class, 'admin'])->name('imiss.admin');
    Route::put('/imiss/admin/tickets/{ticket}/status', [ImissController::class, 'updateStatus'])->name('imiss.admin.ticket.status');
    Route::inertia('/praise', 'praise');
    Route::get('/sso-portal', function(\Illuminate\Http\Request $request) {
        $userData = session('soap_user_data');
        
        $systemName = $request->query('system');
        if ($systemName) {
            $system = \App\Models\HospitalSystem::where('name', $systemName)->first();
        } else {
            $system = \App\Models\HospitalSystem::where('name', "Employee's Portal")->first();
        }

        $url = $system ? $system->url : 'https://eportalplus.bataanghmc.net/login';
        
        if (!str_starts_with($url, 'http')) {
            $url = 'https://' . $url;
        }

        return Inertia::render('sso-portal', [
            'bioid' => $userData['bioid'] ?? '',
            'password' => $userData['password'] ?? '',
            'portalUrl' => $url,
            'systemName' => $system ? $system->name : "Employee's Portal"
        ]);
    });
    Route::inertia('/user-guide', 'user-guide');

    Route::get('/directory', [DirectoryController::class, 'index']);
    Route::get('/utilities/directories', [DirectoryController::class, 'manage']);
    Route::post('/directory', [DirectoryController::class, 'store']);
    Route::put('/directory/{directoryEntry}', [DirectoryController::class, 'update']);
    Route::delete('/directory/{directoryEntry}', [DirectoryController::class, 'destroy']);

    Route::get('/utilities/systems', [SystemController::class, 'index']);
    Route::post('/utilities/systems', [SystemController::class, 'store']);
    Route::put('/utilities/systems/{system}', [SystemController::class, 'update']);
    Route::delete('/utilities/systems/{system}', [SystemController::class, 'destroy']);

    Route::get('/utilities/imiss-request-types', [ImissRequestTypeController::class, 'index']);
    Route::post('/utilities/imiss-request-types', [ImissRequestTypeController::class, 'store']);
    Route::put('/utilities/imiss-request-types/{imissRequestType}', [ImissRequestTypeController::class, 'update']);
    Route::delete('/utilities/imiss-request-types/{imissRequestType}', [ImissRequestTypeController::class, 'destroy']);

    Route::inertia('/cert', 'cert');
    Route::inertia('/qr-pass', 'qr-pass');
    Route::inertia('/health-wellness', 'health-wellness');
});

require __DIR__.'/settings.php';
