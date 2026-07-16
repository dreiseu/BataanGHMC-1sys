<?php

namespace App\Http\Controllers;

use App\Models\Event;
use App\Services\AuditLogService;
use Illuminate\Http\Request;
use Inertia\Inertia;

class EventController extends Controller
{
    public function index()
    {
        $events = Event::where('is_active', true)
            ->orderBy('event_date')
            ->take(100)
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

    public function store(Request $request, AuditLogService $auditLog)
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

        $event = Event::create($validated);

        $auditLog->log(
            action: 'created',
            auditableType: 'event',
            auditableId: (string) $event->id,
            auditableLabel: $event->title,
            newValues: $event->toArray(),
        );

        return redirect()->back()->with('success', 'Event created successfully.');
    }

    public function update(Request $request, Event $event, AuditLogService $auditLog)
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

        $oldValues = $event->toArray();
        $event->update($validated);
        $event->refresh();

        $auditLog->log(
            action: 'updated',
            auditableType: 'event',
            auditableId: (string) $event->id,
            auditableLabel: $event->title,
            oldValues: $oldValues,
            newValues: $event->toArray(),
        );

        return redirect()->back()->with('success', 'Event updated successfully.');
    }

    public function destroy(Event $event, AuditLogService $auditLog)
    {
        $oldValues = $event->toArray();
        $label = $event->title;
        $id = (string) $event->id;

        $event->delete();

        $auditLog->log(
            action: 'deleted',
            auditableType: 'event',
            auditableId: $id,
            auditableLabel: $label,
            oldValues: $oldValues,
        );

        return redirect()->back()->with('success', 'Event deleted successfully.');
    }
}