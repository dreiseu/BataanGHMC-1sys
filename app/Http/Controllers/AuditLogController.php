<?php

namespace App\Http\Controllers;

use App\Models\AuditLog;
use Inertia\Inertia;

class AuditLogController extends Controller
{
    public function index()
    {
        $logs = AuditLog::orderByDesc('created_at')
            ->orderByDesc('id')
            ->get();

        return Inertia::render('utilities/audit-logs', [
            'logs' => $logs,
        ]);
    }
}
