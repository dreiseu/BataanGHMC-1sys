<?php

namespace App\Http\Controllers;

use App\Models\UserNotification;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class NotificationController extends Controller
{
    public function index()
    {
        // Release session file lock immediately for read-only request
        session_write_close();

        return response()->json(
            UserNotification::where('bioid', (string) (Auth::user()->bio_id ?? Auth::id()))
                ->orderBy('created_at', 'desc')
                ->take(20)
                ->get()
        );
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'title' => 'required|string',
            'message' => 'required|string',
            'link' => 'nullable|string'
        ]);

        UserNotification::create([
            'bioid' => Auth::user()->bio_id ?? Auth::id(),
            'title' => $validated['title'],
            'message' => $validated['message'],
            'link' => $validated['link']
        ]);

        return back();
    }

    public function markAsRead(UserNotification $notification)
    {
        if ($notification->bioid == (Auth::user()->bio_id ?? Auth::id())) {
            $notification->is_read = true;
            $notification->save();
        }
        return back();
    }

    public function markAsUnread(UserNotification $notification)
    {
        if ($notification->bioid == (Auth::user()->bio_id ?? Auth::id())) {
            $notification->is_read = false;
            $notification->save();
        }
        return back();
    }

    public function destroy(UserNotification $notification)
    {
        if ($notification->bioid == (Auth::user()->bio_id ?? Auth::id())) {
            $notification->delete();
        }
        return back();
    }

    public function bulkRead(Request $request)
    {
        $ids = $request->input('ids', []);
        if (is_array($ids) && count($ids) > 0) {
            UserNotification::whereIn('id', $ids)
                ->where('bioid', (string) (Auth::user()->bio_id ?? Auth::id()))
                ->update(['is_read' => true]);
        }
        return back();
    }

    public function bulkDelete(Request $request)
    {
        $ids = $request->input('ids', []);
        if (is_array($ids) && count($ids) > 0) {
            UserNotification::whereIn('id', $ids)
                ->where('bioid', (string) (Auth::user()->bio_id ?? Auth::id()))
                ->delete();
        }
        return back();
    }

    public function markTicketAsRead(Request $request)
    {
        $ticketNumber = $request->input('ticket_number');
        if ($ticketNumber) {
            UserNotification::where('bioid', (string) (Auth::user()->bio_id ?? Auth::id()))
                ->where('message', 'like', "%{$ticketNumber}%")
                ->where('is_read', false)
                ->update(['is_read' => true]);
        }
        return back();
    }
}
