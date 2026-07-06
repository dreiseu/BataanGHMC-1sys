<?php

use Illuminate\Support\Facades\Route;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;
use Laravel\Fortify\Features;
use App\Http\Controllers\DirectoryController;
use App\Http\Controllers\ImissController;
use App\Http\Controllers\SystemController;
use App\Http\Controllers\ImissRequestTypeController;
use App\Http\Controllers\UserAccessController;



Route::post('/session-end', function () {
    Auth::logout();
    request()->session()->invalidate();
    request()->session()->regenerateToken();
    return response()->noContent();
})->middleware('web')->name('session.end');

Route::redirect('/', '/login')->name('home');

Route::middleware(['auth', 'verified', 'prevent-back-history'])->group(function () {

    Route::get('dashboard', function () {
        $prefs = \Illuminate\Support\Facades\DB::table('user_preferences')
            ->where('bioid', Auth::user()->bioid)
            ->first();
        $pinnedModules = $prefs && $prefs->pinned_modules ? json_decode($prefs->pinned_modules, true) : [];
        $userAuthority = \App\Models\UserAuthority::where('BiometricID', Auth::user()->bioid)->first();
        $permissions = $userAuthority->permissions ?? [];
        
        $defaultSystems = [
            'DiCe',
            'EFMS Job Order Request System',
            "Employee's Portal",
            'Health & Wellness Clinic',
            'Parking Management System',
            'PGS Online System'
        ];

        $hospitalSystems = \App\Models\HospitalSystem::all()->filter(function ($system) use ($defaultSystems, $permissions) {
            return in_array($system->name, $defaultSystems) || in_array("system:{$system->id}", $permissions);
        })->values();

        $globalAnnouncements = \App\Models\HrDocument::where('type', 'memorandum')
            ->where('is_active', true)
            ->orderBy('sort_order')
            ->orderBy('created_at', 'desc')
            ->take(3)
            ->get();

        $events = \App\Models\Event::where('is_active', true)
            ->orderBy('event_date')
            ->get();

        return Inertia::render('dashboard', [
            'pinnedModules' => $pinnedModules,
            'hospitalSystems' => $hospitalSystems,
            'globalAnnouncements' => $globalAnnouncements,
            'events' => $events,
        ]);
    })->name('dashboard');

    Route::post('/user-preferences/pinned-modules', function (\Illuminate\Http\Request $request) {
        $validated = $request->validate([
            'pinned_modules' => 'array',
            'pinned_modules.*' => 'string'
        ]);

        \Illuminate\Support\Facades\DB::table('user_preferences')->updateOrInsert(
            ['bioid' => Auth::user()->bioid],
            ['pinned_modules' => json_encode($validated['pinned_modules']), 'updated_at' => now()]
        );
        return back();
    });

    Route::get('/hr-portal', function () {
        $announcements = \App\Models\HrDocument::where('type', 'memorandum')
            ->where('is_active', true)
            ->orderBy('sort_order')
            ->orderBy('created_at', 'desc')
            ->take(5)
            ->get();
        return Inertia::render('hr-portal/index', ['recentAnnouncements' => $announcements]);
    });
    Route::get('/hr-portal/video-orientation', function () {
        $videos = \App\Models\VideoOrientation::where('is_active', true)
            ->orderBy('sort_order')
            ->orderBy('created_at', 'desc')
            ->get();
        return Inertia::render('hr-portal/video-orientation', [
            'videos' => $videos
        ]);
    });
    Route::get('/hr-portal/downloadable-forms', function () {
        $forms = \App\Models\HrDocument::where('type', 'form')
            ->where('is_active', true)
            ->orderBy('sort_order')
            ->orderBy('created_at', 'desc')
            ->get();
        return Inertia::render('hr-portal/downloadable-forms', ['forms' => $forms]);
    });

    Route::get('/hr-portal/policies', function () {
        $policies = \App\Models\HrDocument::where('type', 'policy')
            ->where('is_active', true)
            ->orderBy('sort_order')
            ->orderBy('created_at', 'desc')
            ->get();
        return Inertia::render('hr-portal/policies', ['policies' => $policies]);
    });

    Route::get('/hr-portal/leave-benefits', function () {
        $benefits = \App\Models\HrDocument::where('type', 'leave_benefit')
            ->where('is_active', true)
            ->orderBy('sort_order')
            ->orderBy('created_at', 'desc')
            ->get();
        return Inertia::render('hr-portal/leave-benefits', ['benefits' => $benefits]);
    });

    Route::get('/hr-portal/announcements', function () {
        $announcements = \App\Models\HrDocument::where('type', 'memorandum')
            ->where('is_active', true)
            ->orderBy('sort_order')
            ->orderBy('created_at', 'desc')
            ->get();
        return Inertia::render('hr-portal/announcements', ['announcements' => $announcements]);
    });

    Route::get('/hr-portal/faqs', function () {
        $faqs = \App\Models\HrDocument::where('type', 'faq')
            ->where('is_active', true)
            ->orderBy('sort_order')
            ->orderBy('created_at', 'desc')
            ->get();
        return Inertia::render('hr-portal/faqs', ['faqs' => $faqs]);
    });

    Route::inertia('/petro', 'modules/petro');
    Route::get('/events', [\App\Http\Controllers\EventController::class, 'index']);
    Route::inertia('/facility-map', 'modules/facility-map');
    Route::get('/recognition', [\App\Http\Controllers\RecognitionController::class, 'index'])->name('recognition');
    Route::post('/recognition', [\App\Http\Controllers\RecognitionController::class, 'store']);
    Route::post('/recognition/{recognition}/like', [\App\Http\Controllers\RecognitionController::class, 'like']);
    Route::delete('/recognition/{recognition}', [\App\Http\Controllers\RecognitionController::class, 'destroy']);

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
    Route::inertia('/praise', 'modules/praise');
    Route::get('/sso-portal', function (\Illuminate\Http\Request $request) {
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

        return Inertia::render('sso/index', [
            'bioid' => $userData['bioid'] ?? '',
            'password' => $userData['password'] ?? '',
            'portalUrl' => $url,
            'systemName' => $system ? $system->name : "Employee's Portal"
        ]);
    });
    Route::inertia('/user-guide', 'modules/user-guide');

    Route::get('/directory', [DirectoryController::class, 'index']);
    Route::middleware(['imiss-section'])->group(function () {
        Route::get('/utilities/user-access', [UserAccessController::class, 'index']);
        Route::put('/utilities/user-access/{biometric_id}', [UserAccessController::class, 'update']);
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

        Route::get('/utilities/video-orientations', [\App\Http\Controllers\VideoOrientationController::class, 'index']);
        Route::post('/utilities/video-orientations', [\App\Http\Controllers\VideoOrientationController::class, 'store']);
        Route::post('/utilities/video-orientations/reorder', [\App\Http\Controllers\VideoOrientationController::class, 'reorder'])->name('video-orientations.reorder');
        Route::put('/utilities/video-orientations/{videoOrientation}', [\App\Http\Controllers\VideoOrientationController::class, 'update']); // Use POST via Inertia with _method=PUT to support file uploads
        Route::delete('/utilities/video-orientations/{videoOrientation}', [\App\Http\Controllers\VideoOrientationController::class, 'destroy']);

        Route::get('/utilities/hr-documents', [\App\Http\Controllers\HrDocumentController::class, 'index']);
        Route::post('/utilities/hr-documents', [\App\Http\Controllers\HrDocumentController::class, 'store']);
        Route::post('/utilities/hr-documents/reorder', [\App\Http\Controllers\HrDocumentController::class, 'reorder'])->name('hr-documents.reorder');
        Route::put('/utilities/hr-documents/{hrDocument}', [\App\Http\Controllers\HrDocumentController::class, 'update']);
        Route::delete('/utilities/hr-documents/{hrDocument}', [\App\Http\Controllers\HrDocumentController::class, 'destroy']);

        Route::get('/utilities/events', [\App\Http\Controllers\EventController::class, 'manage']);
        Route::post('/utilities/events', [\App\Http\Controllers\EventController::class, 'store']);
        Route::put('/utilities/events/{event}', [\App\Http\Controllers\EventController::class, 'update']);
        Route::delete('/utilities/events/{event}', [\App\Http\Controllers\EventController::class, 'destroy']);
    });

    Route::inertia('/cert', 'modules/cert');
    Route::inertia('/qr-pass', 'modules/qr-pass');
    Route::get('/api/qr-pass-proxy', function (Illuminate\Http\Request $request) {
        $bioID = $request->input('bioID');
        if (!$bioID) return response()->json(['status' => 'error', 'message' => 'Missing bioID']);

        try {
            $response = Illuminate\Support\Facades\Http::get('http://192.168.42.10:8091/qr-pass/1appget.php', [
                'bioID' => $bioID
            ]);
            return $response->json();
        } catch (\Exception $e) {
            return response()->json(['status' => 'error', 'message' => 'Failed to reach legacy server']);
        }
    });
});

Route::get(
    '/imiss/attachment/{file}',
    [ImissController::class, 'attachment']
)->name('imiss.attachment');

Route::get(
    '/imiss/comment-attachment/{file}',
    [ImissController::class, 'openCommentAttachment']
)->where('file', '.*');

require __DIR__ . '/settings.php';
