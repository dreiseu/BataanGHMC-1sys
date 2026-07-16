<?php

namespace App\Http\Controllers;

use App\Models\ImissRequestType;
use App\Services\AuditLogService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Cache;
use Inertia\Inertia;

class ImissRequestTypeController extends Controller
{
    public function index()
    {
        $requestTypes = ImissRequestType::orderBy('id')->get();

        return Inertia::render('utilities/imiss-request-types', [
            'requestTypes' => $requestTypes,
        ]);
    }

    public function store(Request $request, AuditLogService $auditLog)
    {
        $validated = $request->validate([
            'value' => 'required|string|max:50|unique:imiss_request_types',
            'label' => 'required|string|max:255',
            'description' => 'nullable|string',
            'is_active' => 'boolean',
        ]);

        $requestType = ImissRequestType::create([
            'value' => $validated['value'],
            'label' => $validated['label'],
            'description' => $validated['description'] ?? null,
            'is_active' => $validated['is_active'] ?? true,
        ]);

        $auditLog->log(
            action: 'created',
            auditableType: 'imiss_request_type',
            auditableId: (string) $requestType->id,
            auditableLabel: $requestType->label,
            newValues: $requestType->toArray(),
        );

        Cache::forget('imiss_request_types_active');
        return back();
    }

    public function update(Request $request, ImissRequestType $imissRequestType, AuditLogService $auditLog)
    {
        $validated = $request->validate([
            'value' => 'required|string|max:50|unique:imiss_request_types,value,' . $imissRequestType->id,
            'label' => 'required|string|max:255',
            'description' => 'nullable|string',
            'is_active' => 'boolean',
        ]);

        $oldValues = $imissRequestType->toArray();

        $imissRequestType->update([
            'value' => $validated['value'],
            'label' => $validated['label'],
            'description' => $validated['description'] ?? null,
            'is_active' => $validated['is_active'] ?? true,
        ]);

        $imissRequestType->refresh();

        $auditLog->log(
            action: 'updated',
            auditableType: 'imiss_request_type',
            auditableId: (string) $imissRequestType->id,
            auditableLabel: $imissRequestType->label,
            oldValues: $oldValues,
            newValues: $imissRequestType->toArray(),
        );

        Cache::forget('imiss_request_types_active');
        return back();
    }

    public function destroy(ImissRequestType $imissRequestType, AuditLogService $auditLog)
    {
        $oldValues = $imissRequestType->toArray();
        $label = $imissRequestType->label;
        $id = (string) $imissRequestType->id;

        $imissRequestType->delete();

        $auditLog->log(
            action: 'deleted',
            auditableType: 'imiss_request_type',
            auditableId: $id,
            auditableLabel: $label,
            oldValues: $oldValues,
        );

        Cache::forget('imiss_request_types_active');
        return back();
    }
}
