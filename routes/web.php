<?php

use Illuminate\Support\Facades\Route;
use Inertia\Inertia;
use Laravel\Fortify\Features;
use App\Http\Controllers\DirectoryController;
use App\Http\Controllers\ImissController;

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
    
    Route::get('/notifications', function() {
        return response()->json(
            \App\Models\UserNotification::where('bioid', Auth::user()->bio_id ?? Auth::id())
                ->orderBy('created_at', 'desc')
                ->take(20)
                ->get()
        );
    });
    Route::post('/notifications/{notification}/read', function(\App\Models\UserNotification $notification) {
        if ($notification->bioid == (Auth::user()->bio_id ?? Auth::id())) {
            $notification->is_read = true;
            $notification->save();
        }
        return back();
    });
    Route::post('/notifications/{notification}/unread', function(\App\Models\UserNotification $notification) {
        if ($notification->bioid == (Auth::user()->bio_id ?? Auth::id())) {
            $notification->is_read = false;
            $notification->save();
        }
        return back();
    });
    Route::delete('/notifications/{notification}', function(\App\Models\UserNotification $notification) {
        if ($notification->bioid == (Auth::user()->bio_id ?? Auth::id())) {
            $notification->delete();
        }
        return back();
    });
    Route::post('/notifications/bulk-read', function(\Illuminate\Http\Request $request) {
        $ids = $request->input('ids', []);
        if (is_array($ids) && count($ids) > 0) {
            \App\Models\UserNotification::whereIn('id', $ids)
                ->where('bioid', Auth::user()->bio_id ?? Auth::id())
                ->update(['is_read' => true]);
        }
        return back();
    });
    Route::post('/notifications/bulk-delete', function(\Illuminate\Http\Request $request) {
        $ids = $request->input('ids', []);
        if (is_array($ids) && count($ids) > 0) {
            \App\Models\UserNotification::whereIn('id', $ids)
                ->where('bioid', Auth::user()->bio_id ?? Auth::id())
                ->delete();
        }
        return back();
    });
    Route::get('/imiss/admin', [ImissController::class, 'admin'])->name('imiss.admin');
    Route::put('/imiss/admin/tickets/{ticket}/status', [ImissController::class, 'updateStatus'])->name('imiss.admin.ticket.status');
    Route::inertia('/praise', 'praise');
    Route::inertia('/employees-portal', 'employees-portal');
    Route::inertia('/user-guide', 'user-guide');

    Route::get('/directory', [DirectoryController::class, 'index']);
    Route::middleware('admin')->group(function () {
        Route::post('/directory', [DirectoryController::class, 'store']);
        Route::put('/directory/{directoryEntry}', [DirectoryController::class, 'update']);
        Route::delete('/directory/{directoryEntry}', [DirectoryController::class, 'destroy']);
    });

    Route::inertia('/cert', 'cert');
    Route::inertia('/qr-pass', 'qr-pass');
    Route::inertia('/health-wellness', 'health-wellness');
});

require __DIR__.'/settings.php';
