<?php

namespace App\Http\Controllers;

use App\Models\Event;
use Illuminate\Http\Request;
use Inertia\Inertia;

class EventController extends Controller
{
    public function index()
    {
        $events = Event::where('is_active', true)
            ->orderBy('event_date')
            ->get();

        return Inertia::render('modules/events', [
            'events' => $events,
        ]);
    }

    public function manage()
    {
        $events = Event::orderBy('event_date', 'desc')->get();

        return Inertia::render('utilities/events', [
            'events' => $events,
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'title' => 'required|string|max:255',
            'description' => 'nullable|string',
            'event_date' => 'required|date',
            'time' => 'nullable|string|max:100',
            'location' => 'nullable|string|max:255',
            'department' => 'nullable|string|max:255',
            'type' => 'required|in:training,meeting,event,holiday,seminar',
            'is_active' => 'boolean',
        ]);

        Event::create($validated);

        return redirect()->back()->with('success', 'Event created successfully.');
    }

    public function update(Request $request, Event $event)
    {
        $validated = $request->validate([
            'title' => 'required|string|max:255',
            'description' => 'nullable|string',
            'event_date' => 'required|date',
            'time' => 'nullable|string|max:100',
            'location' => 'nullable|string|max:255',
            'department' => 'nullable|string|max:255',
            'type' => 'required|in:training,meeting,event,holiday,seminar',
            'is_active' => 'boolean',
        ]);

        $event->update($validated);

        return redirect()->back()->with('success', 'Event updated successfully.');
    }

    public function destroy(Event $event)
    {
        $event->delete();

        return redirect()->back()->with('success', 'Event deleted successfully.');
    }
}