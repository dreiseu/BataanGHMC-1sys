<?php

namespace App\Http\Controllers;

use App\Models\HospitalSystem;
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

    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'url' => 'required|string|max:255',
        ]);

        HospitalSystem::create($validated);

        return back();
    }

    public function update(Request $request, HospitalSystem $system)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'url' => 'required|string|max:255',
        ]);

        $system->update($validated);

        return back();
    }

    public function destroy(HospitalSystem $system)
    {
        $system->delete();

        return back();
    }
}
