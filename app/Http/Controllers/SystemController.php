<?php

namespace App\Http\Controllers;

use App\Models\HospitalSystem;
use App\Services\AuditLogService;
use Illuminate\Http\Request;
use Inertia\Inertia;

class SystemController extends Controller
{
    public function index()
    {
        $systems = HospitalSystem::orderBy('name')->get();

        return Inertia::render('utilities/systems', [
            'systems' => $systems,
        ]);
    }

    public function store(Request $request, AuditLogService $auditLog)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'url' => 'required|string|max:255',
            'is_sso' => 'boolean',
            'is_default' => 'boolean',
        ]);

        $system = HospitalSystem::create($validated);

        $auditLog->log(
            action: 'created',
            auditableType: 'hospital_system',
            auditableId: (string) $system->id,
            auditableLabel: $system->name,
            newValues: $system->toArray(),
        );

        return back();
    }

    public function update(Request $request, HospitalSystem $system, AuditLogService $auditLog)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'url' => 'required|string|max:255',
            'is_sso' => 'boolean',
            'is_default' => 'boolean',
        ]);

        $oldValues = $system->toArray();
        $system->update($validated);
        $system->refresh();

        $auditLog->log(
            action: 'updated',
            auditableType: 'hospital_system',
            auditableId: (string) $system->id,
            auditableLabel: $system->name,
            oldValues: $oldValues,
            newValues: $system->toArray(),
        );

        return back();
    }

    public function destroy(HospitalSystem $system, AuditLogService $auditLog)
    {
        $oldValues = $system->toArray();
        $label = $system->name;
        $id = (string) $system->id;

        $system->delete();

        $auditLog->log(
            action: 'deleted',
            auditableType: 'hospital_system',
            auditableId: $id,
            auditableLabel: $label,
            oldValues: $oldValues,
        );

        return back();
    }
}
