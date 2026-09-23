<?php

namespace App\Http\Controllers;

use App\Models\Department;
use App\Services\AuditLogService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Cache;
use Inertia\Inertia;

class DepartmentController extends Controller
{
    public function index()
    {
        $departments = Department::orderBy('Department')->get(['id', 'Code', 'Department']);

        return Inertia::render('utilities/departments', [
            'departments' => $departments,
        ]);
    }

    public function store(Request $request, AuditLogService $auditLog)
    {
        $validated = $request->validate([
            'Code' => 'nullable|string|max:50|unique:departments,Code',
            'Department' => 'required|string|max:255|unique:departments,Department',
        ]);

        $department = Department::create([
            'Code' => $validated['Code'] ?? null,
            'Department' => $validated['Department'],
        ]);

        $auditLog->log(
            action: 'created',
            auditableType: 'department',
            auditableId: (string) $department->id,
            auditableLabel: $department->Department,
            newValues: $department->toArray(),
        );

        Cache::forget('departments_all');
        return back();
    }

    public function update(Request $request, Department $department, AuditLogService $auditLog)
    {
        $validated = $request->validate([
            'Code' => 'nullable|string|max:50|unique:departments,Code,' . $department->id,
            'Department' => 'required|string|max:255|unique:departments,Department,' . $department->id,
        ]);

        $oldValues = $department->toArray();

        $department->update([
            'Code' => $validated['Code'] ?? null,
            'Department' => $validated['Department'],
        ]);

        $department->refresh();

        $auditLog->log(
            action: 'updated',
            auditableType: 'department',
            auditableId: (string) $department->id,
            auditableLabel: $department->Department,
            oldValues: $oldValues,
            newValues: $department->toArray(),
        );

        Cache::forget('departments_all');
        return back();
    }

    public function destroy(Department $department, AuditLogService $auditLog)
    {
        $oldValues = $department->toArray();
        $label = $department->Department;
        $id = (string) $department->id;

        $department->delete();

        $auditLog->log(
            action: 'deleted',
            auditableType: 'department',
            auditableId: $id,
            auditableLabel: $label,
            oldValues: $oldValues,
        );

        Cache::forget('departments_all');
        return back();
    }
}
