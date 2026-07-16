<?php

namespace App\Http\Controllers;

use App\Models\HrDocument;
use App\Services\AuditLogService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;

class HrDocumentController extends Controller
{
    public function index()
    {
        $documents = Cache::remember('hr_documents_all', 3600, function () {
            return HrDocument::get()
                ->sortBy([
                    ['type', 'asc'],
                    ['sort_order', 'asc'],
                    ['created_at', 'desc'],
                ])
                ->values()
                ->toArray();
        });
        return Inertia::render('utilities/hr-documents', [
            'entries' => $documents
        ]);
    }

    public function store(Request $request, AuditLogService $auditLog)
    {
        $validated = $request->validate([
            'title' => 'required|string|max:255',
            'description' => 'nullable|string',
            'type' => 'required|in:form,policy,memorandum,leave_benefit,faq',
            'category' => 'nullable|string|max:255',
            'file_file' => 'nullable|file|max:51200', // 50MB max
            'is_active' => 'boolean',
        ]);

        $maxSortOrder = HrDocument::where('type', $validated['type'])->max('sort_order') ?? 0;

        $data = [
            'title' => $validated['title'],
            'description' => $validated['description'] ?? null,
            'type' => $validated['type'],
            'category' => $validated['category'] ?? null,
            'is_active' => $validated['is_active'] ?? true,
            'sort_order' => $maxSortOrder + 1,
        ];

        if ($request->hasFile('file_file')) {
            $file = $request->file('file_file');
            $path = $file->store('hr_documents', 'public');
            $data['file_path'] = $path;
            $data['file_type'] = strtoupper($file->getClientOriginalExtension());
        }

        $document = HrDocument::create($data);

        $auditLog->log(
            action: 'created',
            auditableType: 'hr_document',
            auditableId: (string) $document->id,
            auditableLabel: $document->title,
            newValues: $document->toArray(),
        );

        Cache::forget('hr_documents_all');
        return redirect()->back()->with('success', 'Document added successfully.');
    }

    public function update(Request $request, HrDocument $hrDocument, AuditLogService $auditLog)
    {
        $validated = $request->validate([
            'title' => 'required|string|max:255',
            'description' => 'nullable|string',
            'type' => 'required|in:form,policy,memorandum,leave_benefit,faq',
            'category' => 'nullable|string|max:255',
            'file_file' => 'nullable|file|max:51200',
            'is_active' => 'boolean',
            'sort_order' => 'integer',
        ]);

        $oldValues = $hrDocument->toArray();

        $data = [
            'title' => $validated['title'],
            'description' => $validated['description'] ?? null,
            'type' => $validated['type'],
            'category' => $validated['category'] ?? null,
            'is_active' => $validated['is_active'] ?? true,
        ];

        if ($request->has('sort_order')) {
            $data['sort_order'] = $validated['sort_order'];
        }

        if ($request->hasFile('file_file')) {
            if ($hrDocument->file_path && Storage::disk('public')->exists($hrDocument->file_path)) {
                Storage::disk('public')->delete($hrDocument->file_path);
            }
            $file = $request->file('file_file');
            $path = $file->store('hr_documents', 'public');
            $data['file_path'] = $path;
            $data['file_type'] = strtoupper($file->getClientOriginalExtension());
        }

        $hrDocument->update($data);
        $hrDocument->refresh();

        $auditLog->log(
            action: 'updated',
            auditableType: 'hr_document',
            auditableId: (string) $hrDocument->id,
            auditableLabel: $hrDocument->title,
            oldValues: $oldValues,
            newValues: $hrDocument->toArray(),
        );

        Cache::forget('hr_documents_all');
        return redirect()->back()->with('success', 'Document updated successfully.');
    }

    public function destroy(HrDocument $hrDocument, AuditLogService $auditLog)
    {
        $oldValues = $hrDocument->toArray();
        $label = $hrDocument->title;
        $id = (string) $hrDocument->id;

        if ($hrDocument->file_path && Storage::disk('public')->exists($hrDocument->file_path)) {
            Storage::disk('public')->delete($hrDocument->file_path);
        }
        
        $hrDocument->delete();

        $auditLog->log(
            action: 'deleted',
            auditableType: 'hr_document',
            auditableId: $id,
            auditableLabel: $label,
            oldValues: $oldValues,
        );

        Cache::forget('hr_documents_all');
        return redirect()->back()->with('success', 'Document deleted successfully.');
    }

    public function reorder(Request $request, AuditLogService $auditLog)
    {
        $validated = $request->validate([
            'ordered_ids' => 'required|array',
            'ordered_ids.*' => 'integer|exists:hr_documents,id'
        ]);

        foreach ($validated['ordered_ids'] as $index => $id) {
            HrDocument::where('id', $id)->update(['sort_order' => $index]);
        }

        $auditLog->log(
            action: 'reordered',
            auditableType: 'hr_document',
            auditableLabel: 'HR Documents',
            newValues: ['ordered_ids' => $validated['ordered_ids']],
        );

        Cache::forget('hr_documents_all');
        return redirect()->back()->with('success', 'Order updated successfully.');
    }
}
