<?php

namespace App\Http\Controllers;

use App\Models\DirectoryEntry;
use App\Services\AuditLogService;
use Illuminate\Support\Facades\Cache;
use Inertia\Inertia;

class DirectoryController extends Controller
{
    public function index()
    {
        $entries = Cache::remember('directory_entries_all', 3600, function () {
            return DirectoryEntry::get()
                ->sortBy([
                    ['section', 'asc'],
                    ['sort_order', 'asc'],
                    ['department', 'asc'],
                ])
                ->values()
                ->toArray();
        });

        return Inertia::render('modules/directory', [
            'entries' => $entries,
        ]);
    }

    public function printPdf()
    {
        $entries = collect(Cache::remember('directory_entries_all', 3600, function () {
            return DirectoryEntry::get()
                ->sortBy([
                    ['section', 'asc'],
                    ['sort_order', 'asc'],
                    ['department', 'asc'],
                ])
                ->values()
                ->toArray();
        }));

        $bataanDirectory = $entries->where('section', 'BataanGHMC')->values();
        $bucasDirectory = $entries->where('section', 'BUCAS')->values();

        $chunkBataan = [];
        if ($bataanDirectory->count() > 0) {
            $size = (int) ceil($bataanDirectory->count() / 3);
            $chunkBataan = [
                $bataanDirectory->slice(0, $size)->values(),
                $bataanDirectory->slice($size, $size)->values(),
                $bataanDirectory->slice($size * 2)->values(),
            ];
        }

        $chunkBucas = [];
        if ($bucasDirectory->count() > 0) {
            $size = (int) ceil($bucasDirectory->count() / 3);
            $chunkBucas = [
                $bucasDirectory->slice(0, $size)->values(),
                $bucasDirectory->slice($size, $size)->values(),
                $bucasDirectory->slice($size * 2)->values(),
            ];
        }

        $latestEntry = $entries->sortByDesc('updated_at')->first();
        $currentDate = $latestEntry && $latestEntry->updated_at ? $latestEntry->updated_at->format('F j, Y') : date('F j, Y');
        $currentYear = date('Y');
        $trunkLines = [
            'bghmc' => '(047) 237-9771, 237-9772, 237-1274',
            'bucas' => '(047) 240-9200 to 9204',
        ];

        if (!class_exists('\TCPDF')) {
            abort(500, 'TCPDF is not installed. Please run composer require tecnickcom/tcpdf');
        }

        $pdf = new \TCPDF('P', 'mm', 'A4', true, 'UTF-8', false);
        
        $pdf->SetCreator(PDF_CREATOR);
        $pdf->SetAuthor('IMISS');
        $pdf->SetTitle('BGHMC Telephone Directory ' . $currentYear);
        
        $pdf->setPrintHeader(false);
        $pdf->setPrintFooter(false);
        $pdf->SetMargins(10, 10, 10); // Left=10mm, Top=10mm, Right=10mm
        $pdf->SetAutoPageBreak(TRUE, 10); // Bottom margin = 10mm
        
        $pdf->AddPage();

        $html = view('pdf.directory', [
            'chunkBataan' => $chunkBataan,
            'chunkBucas' => $chunkBucas,
            'currentDate' => $currentDate,
            'currentYear' => $currentYear,
            'trunkLines' => $trunkLines,
        ])->render();

        $pdf->writeHTML($html, true, false, true, false, '');
        $pdf->Output('BataanGHMC_Directory_'.$currentYear.'.pdf', 'I');
    }

    public function manage()
    {
        $entries = Cache::remember('directory_entries_all', 3600, function () {
            return DirectoryEntry::get()
                ->sortBy([
                    ['section', 'asc'],
                    ['sort_order', 'asc'],
                    ['department', 'asc'],
                ])
                ->values()
                ->toArray();
        });

        return Inertia::render('utilities/directories', [
            'entries' => $entries,
        ]);
    }

    public function store(AuditLogService $auditLog)
    {
        request()->validate([
            'department' => ['required'],
            'local_no' => ['required'],
            'section' => ['required'],
            'sort_order' => ['nullable', 'integer'],
        ]);

        $entry = DirectoryEntry::create([
            'department' => request('department'),
            'local_no' => request('local_no'),
            'section' => request('section'),
            'sort_order' => request('sort_order', 0),
        ]);

        $auditLog->log(
            action: 'created',
            auditableType: 'directory_entry',
            auditableId: (string) $entry->id,
            auditableLabel: $entry->department,
            newValues: $entry->toArray(),
        );

        Cache::forget('directory_entries_all');
        return back();
    }

    public function update(DirectoryEntry $directoryEntry, AuditLogService $auditLog)
    {
        request()->validate([
            'department' => ['required'],
            'local_no' => ['required'],
            'section' => ['required'],
            'sort_order' => ['nullable', 'integer'],
        ]);

        $oldValues = $directoryEntry->toArray();

        $directoryEntry->fill([
            'department' => request('department'),
            'local_no' => request('local_no'),
            'section' => request('section'),
            'sort_order' => request()->input('sort_order', $directoryEntry->sort_order),
        ]);

        if ($directoryEntry->isDirty()) {
            $directoryEntry->save();
        }

        $directoryEntry->touch();
        $directoryEntry->refresh();

        $auditLog->log(
            action: 'updated',
            auditableType: 'directory_entry',
            auditableId: (string) $directoryEntry->id,
            auditableLabel: $directoryEntry->department,
            oldValues: $oldValues,
            newValues: $directoryEntry->toArray(),
        );

        Cache::forget('directory_entries_all');
        return back();
    }

    public function destroy(DirectoryEntry $directoryEntry, AuditLogService $auditLog)
    {
        $oldValues = $directoryEntry->toArray();
        $label = $directoryEntry->department;
        $id = (string) $directoryEntry->id;

        $directoryEntry->delete();

        $auditLog->log(
            action: 'deleted',
            auditableType: 'directory_entry',
            auditableId: $id,
            auditableLabel: $label,
            oldValues: $oldValues,
        );

        Cache::forget('directory_entries_all');
        return back();
    }
}
