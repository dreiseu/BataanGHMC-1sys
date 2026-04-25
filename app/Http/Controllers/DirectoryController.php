<?php

namespace App\Http\Controllers;

use App\Models\DirectoryEntry;
use Inertia\Inertia;

class DirectoryController extends Controller
{
    public function index()
    {
        $entries = DirectoryEntry::orderBy('section')
            ->orderBy('sort_order')
            ->orderBy('department')
            ->get();

        return Inertia::render('directory', [
            'entries' => $entries,
        ]);
    }

    public function store()
    {
        request()->validate([
            'department' => ['required'],
            'local_no' => ['required'],
            'section' => ['required'],
        ]);

        DirectoryEntry::create([
            'department' => request('department'),
            'local_no' => request('local_no'),
            'section' => request('section'),
        ]);

        return back();
    }

    public function update(DirectoryEntry $directoryEntry)
    {
        request()->validate([
            'department' => ['required'],
            'local_no' => ['required'],
            'section' => ['required'],
        ]);

        $directoryEntry->update([
            'department' => request('department'),
            'local_no' => request('local_no'),
            'section' => request('section'),
        ]);

        return back();
    }

    public function destroy(DirectoryEntry $directoryEntry)
    {
        $directoryEntry->delete();

        return back();
    }
}
