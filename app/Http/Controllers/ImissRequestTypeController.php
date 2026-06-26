<?php

namespace App\Http\Controllers;

use App\Models\ImissRequestType;
use Illuminate\Http\Request;
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

    public function store(Request $request)
    {
        $validated = $request->validate([
            'value' => 'required|string|max:50|unique:imiss_request_types',
            'label' => 'required|string|max:255',
            'description' => 'nullable|string',
            'is_active' => 'boolean',
        ]);

        ImissRequestType::create([
            'value' => $validated['value'],
            'label' => $validated['label'],
            'description' => $validated['description'] ?? null,
            'is_active' => $validated['is_active'] ?? true,
        ]);

        return back();
    }

    public function update(Request $request, ImissRequestType $imissRequestType)
    {
        $validated = $request->validate([
            'value' => 'required|string|max:50|unique:imiss_request_types,value,' . $imissRequestType->id,
            'label' => 'required|string|max:255',
            'description' => 'nullable|string',
            'is_active' => 'boolean',
        ]);

        $imissRequestType->update([
            'value' => $validated['value'],
            'label' => $validated['label'],
            'description' => $validated['description'] ?? null,
            'is_active' => $validated['is_active'] ?? true,
        ]);

        return back();
    }

    public function destroy(ImissRequestType $imissRequestType)
    {
        $imissRequestType->delete();

        return back();
    }
}
