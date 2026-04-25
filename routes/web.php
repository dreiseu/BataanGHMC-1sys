<?php

use Illuminate\Support\Facades\Route;
use Laravel\Fortify\Features;
use App\Http\Controllers\DirectoryController;

Route::inertia('/', 'welcome', [
    'canRegister' => Features::enabled(Features::registration()),
])->name('home');

Route::middleware(['auth', 'verified'])->group(function () {
    Route::inertia('dashboard', 'dashboard')->name('dashboard');

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
    Route::inertia('/ihomp', 'ihomp');
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
