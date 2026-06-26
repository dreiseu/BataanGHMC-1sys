<?php

namespace App\Http\Controllers;

use App\Models\HospitalSystem;
use App\Models\ImissTicket;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;

class ImissController extends Controller
{
    public function index()
    {
        $systems = HospitalSystem::all();
        
        // Assuming Auth::user() has a bio_id property, otherwise fallback to id
        $bioId = Auth::user()->bio_id ?? Auth::id();
        
        $tickets = ImissTicket::with('comments')
            ->where('bio_id', $bioId)
            ->orderBy('created_at', 'desc')
            ->get();

        $requestTypes = [];
        if (\Illuminate\Support\Facades\Schema::hasTable('imiss_request_types')) {
            $requestTypes = \App\Models\ImissRequestType::where('is_active', true)->get();
        } else {
            // Fallback before migration is run
            $requestTypes = [
                (object)['value' => 'hardware', 'label' => 'Hardware Repair / Issue'],
                (object)['value' => 'network', 'label' => 'Network / Internet Connectivity'],
                (object)['value' => 'software', 'label' => 'Software Installation / Error'],
                (object)['value' => 'account', 'label' => 'Account Access / Password Reset'],
                (object)['value' => 'hims', 'label' => 'HIMS (Reopening / Cancellation)'],
                (object)['value' => 'emr', 'label' => 'EMR (Records / Charges)'],
                (object)['value' => 'other', 'label' => 'Other Inquiry'],
            ];
        }

        return Inertia::render('imiss', [
            'systems' => $systems,
            'tickets' => $tickets,
            'requestTypes' => $requestTypes,
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'request_type' => 'required|string|max:50',
            'description' => 'required|string',
            'local_number' => 'nullable|string|max:50',
            'pc_number' => 'nullable|string|max:50',
            'location' => 'required|string|max:100',
            'priority' => 'required|string|max:20',
            'attachments' => 'nullable|array',
            'attachments.*' => 'file|max:10240', // 10MB max per file
        ]);

        $bioId = Auth::user()->bio_id ?? Auth::id();

        // Generate Ticket Number (e.g., TKT-2026-001)
        $year = date('Y');
        $latestTicket = ImissTicket::where('ticket_number', 'like', "TKT-{$year}-%")->orderBy('id', 'desc')->first();
        $nextNumber = 1;
        if ($latestTicket) {
            $parts = explode('-', $latestTicket->ticket_number);
            $nextNumber = intval(end($parts)) + 1;
        }
        $ticketNumber = sprintf("TKT-%s-%03d", $year, $nextNumber);

        $attachmentPaths = [];
        if ($request->hasFile('attachments')) {
            $files = $request->file('attachments');
            
            if (is_array($files)) {
                foreach ($files as $file) {
                    if ($file instanceof \Illuminate\Http\UploadedFile && $file->isValid()) {
                        try {
                            $name = $file->hashName();
                            $content = file_get_contents($file->getPathname());
                            \Illuminate\Support\Facades\Storage::disk('public')->put('imiss_attachments/' . $name, $content);
                            $attachmentPaths[] = 'imiss_attachments/' . $name;
                        } catch (\Exception $e) {
                            \Illuminate\Support\Facades\Log::error('IMISS File Upload Error: ' . $e->getMessage());
                        }
                    }
                }
            } elseif ($files instanceof \Illuminate\Http\UploadedFile && $files->isValid()) {
                try {
                    $name = $files->hashName();
                    $content = file_get_contents($files->getPathname());
                    \Illuminate\Support\Facades\Storage::disk('public')->put('imiss_attachments/' . $name, $content);
                    $attachmentPaths[] = 'imiss_attachments/' . $name;
                } catch (\Exception $e) {
                    \Illuminate\Support\Facades\Log::error('IMISS File Upload Error: ' . $e->getMessage());
                }
            }
        }

        ImissTicket::create([
            'ticket_number' => $ticketNumber,
            'bio_id' => $bioId,
            'request_type' => $validated['request_type'],
            'description' => $validated['description'],
            'location' => $validated['location'],
            'local_number' => $validated['local_number'],
            'pc_number' => $validated['pc_number'] ?? null,
            'priority' => $validated['priority'],
            'attachments' => count($attachmentPaths) > 0 ? $attachmentPaths : null,
            'status' => 'Ticket Submitted',
        ]);

        return back();
    }

    public function resolve(Request $request, ImissTicket $ticket)
    {
        $validated = $request->validate([
            'rating' => 'nullable|integer|min:1|max:5',
            'feedback_text' => 'nullable|string',
        ]);

        // Ensure user is authorized to resolve this ticket
        $bioId = Auth::user()->bio_id ?? Auth::id();
        if ($ticket->bio_id == $bioId) {
            $ticket->status = 'Resolved';
            $ticket->rating = $validated['rating'] ?? null;
            $ticket->feedback_text = $validated['feedback_text'] ?? null;
            $ticket->save();
        }
        
        return back();
    }

    public function cancel(ImissTicket $ticket)
    {
        // Ensure user is authorized to cancel this ticket
        $bioId = Auth::user()->bio_id ?? Auth::id();
        if ($ticket->bio_id == $bioId && $ticket->status === 'Ticket Submitted') {
            $ticket->status = 'Cancelled';
            $ticket->save();
        }
        
        return back();
    }

    public function correction(ImissTicket $ticket)
    {
        $bioId = Auth::user()->bio_id ?? Auth::id();
        if ($ticket->bio_id == $bioId && $ticket->status === 'Accomplished') {
            $ticket->status = 'For Correction';
            $ticket->save();
        }
        
        return back();
    }

    public function admin()
    {
        $tickets = ImissTicket::with('comments')->orderBy('created_at', 'desc')->get();
        return Inertia::render('imiss-admin', [
            'tickets' => $tickets,
        ]);
    }

    public function updateStatus(Request $request, ImissTicket $ticket)
    {
        $validated = $request->validate([
            'status' => 'required|string|max:50',
            'remarks' => 'nullable|string',
        ]);
        
        $oldStatus = $ticket->status;
        $ticket->status = $validated['status'];
        
        if (isset($validated['remarks'])) {
            $ticket->remarks = $validated['remarks'];
        }
        
        if ($validated['status'] === 'Ticket Accepted' || $validated['status'] === 'In Progress') {
            $user = Auth::user();
            $ticket->accepted_by_name = $user->name ?? ($user->firstname . ' ' . $user->lastname ?? 'IMISS Staff');
            if (!$ticket->accepted_at) {
                $ticket->accepted_at = now();
            }
        }

        $ticket->save();

        if ($oldStatus !== $ticket->status) {
            \App\Models\UserNotification::create([
                'bioid' => $ticket->bio_id,
                'title' => 'Ticket Update',
                'message' => "Your ticket {$ticket->ticket_number} is now: {$ticket->status}",
                'link' => '/imiss',
            ]);
        }

        return back();
    }

    public function storeComment(Request $request, ImissTicket $ticket)
    {
        $validated = $request->validate([
            'message' => 'nullable|string',
            'attachments' => 'nullable|array',
            'attachments.*' => 'nullable|file|mimes:jpeg,png,jpg,pdf|max:10240',
        ]);
        
        if (empty($validated['message']) && !$request->hasFile('attachments')) {
            return back()->withErrors(['message' => 'Please enter a message or attach a file.']);
        }
        
        $attachmentPaths = [];
        if ($request->hasFile('attachments')) {
            $files = $request->file('attachments');
            if (is_array($files)) {
                foreach ($files as $file) {
                    if ($file instanceof \Illuminate\Http\UploadedFile && $file->isValid()) {
                        $name = $file->hashName();
                        $content = file_get_contents($file->getPathname());
                        \Illuminate\Support\Facades\Storage::disk('public')->put('imiss_comment_attachments/' . $name, $content);
                        $attachmentPaths[] = 'imiss_comment_attachments/' . $name;
                    }
                }
            } elseif ($files instanceof \Illuminate\Http\UploadedFile && $files->isValid()) {
                $name = $files->hashName();
                $content = file_get_contents($files->getPathname());
                \Illuminate\Support\Facades\Storage::disk('public')->put('imiss_comment_attachments/' . $name, $content);
                $attachmentPaths[] = 'imiss_comment_attachments/' . $name;
            }
        }

        $user = Auth::user();
        $bioId = $user->bio_id ?? Auth::id();
        $name = $user->name ?? ($user->firstname . ' ' . $user->lastname ?? 'User');
        
        \App\Models\ImissTicketComment::create([
            'ticket_id' => $ticket->id,
            'sender_bioid' => $bioId,
            'sender_name' => $name,
            'message' => $validated['message'] ?? '',
            'attachments' => count($attachmentPaths) > 0 ? $attachmentPaths : null,
        ]);
        
        if ($ticket->bio_id != $bioId) {
            \App\Models\UserNotification::create([
                'bioid' => $ticket->bio_id,
                'title' => 'New Comment',
                'message' => "You have a new comment on ticket {$ticket->ticket_number}",
                'link' => '/imiss',
            ]);
        }

        return back();
    }
}
