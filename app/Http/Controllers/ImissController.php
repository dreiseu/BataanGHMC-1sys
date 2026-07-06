<?php

namespace App\Http\Controllers;

use App\Models\HospitalSystem;
use App\Models\ImissTicket;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;
use Illuminate\Support\Facades\Response;

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

        return Inertia::render('imiss/index', [
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
                            $path = $file->store('imiss_attachments', 'public');
                            if ($path) {
                                $attachmentPaths[] = $path;
                            }
                        } catch (\Exception $e) {
                            \Illuminate\Support\Facades\Log::error('IMISS File Upload Error: ' . $e->getMessage());
                        }
                    }
                }
            } elseif ($files instanceof \Illuminate\Http\UploadedFile && $files->isValid()) {
                try {
                    $path = $files->store('imiss_attachments', 'public');
                    if ($path) {
                        $attachmentPaths[] = $path;
                    }
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
            $ticket->resolved_at = now();
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
            $ticket->cancelled_at = now();
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
        return Inertia::render('imiss/admin', [
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

        $bioId = Auth::user()->bio_id ?? Auth::id();

        switch ($validated['status']) {
            case 'Under Review':
                if (!$ticket->reviewed_at) {
                    $ticket->reviewed_at = now();
                    $ticket->reviewed_by = $bioId;
                }
                break;
            case 'Endorsed':
                if (!$ticket->endorsed_at) {
                    $ticket->endorsed_at = now();
                    $ticket->endorsed_by = $bioId;
                }
                break;
            case 'In Progress':
                if (!$ticket->accepted_at) {
                    $ticket->accepted_at = now();
                    $ticket->accepted_by = $bioId;
                }
                break;
            case 'Returned':
                if (!$ticket->returned_at) {
                    $ticket->returned_at = now();
                    $ticket->returned_by = $bioId;
                }
                break;
            case 'Accomplished':
                if (!$ticket->finished_at) {
                    $ticket->finished_at = now();
                    $ticket->finished_by = $bioId;
                }
                break;
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
                        try {
                            $path = $file->store('imiss_comment_attachments', 'public');
                            if ($path) {
                                $attachmentPaths[] = $path;
                            }
                        } catch (\Exception $e) {
                            \Illuminate\Support\Facades\Log::error('IMISS Comment Upload Error: ' . $e->getMessage());
                        }
                    }
                }
            } elseif ($files instanceof \Illuminate\Http\UploadedFile && $files->isValid()) {
                try {
                    $path = $files->store('imiss_comment_attachments', 'public');
                    if ($path) {
                        $attachmentPaths[] = $path;
                    }
                } catch (\Exception $e) {
                    \Illuminate\Support\Facades\Log::error('IMISS Comment Upload Error: ' . $e->getMessage());
                }
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

    public function attachment($file)
    {
        // Prevent path traversal attacks
        $file = basename($file);

        $path = storage_path('app/public/imiss_attachments/' . $file);

        if (!file_exists($path)) {
            abort(404);
        }

        return response()->file($path);
    }

    public function openCommentAttachment($file)
    {
        $file = basename($file);

        $path = storage_path(
            'app/public/imiss_comment_attachments/' . $file
        );

        if (!file_exists($path)) {
            // Fallback 1: check main imiss_attachments folder
            $fallbackPath = storage_path('app/public/imiss_attachments/' . $file);
            
            if (file_exists($fallbackPath)) {
                return response()->file($fallbackPath);
            } 
            
            // Fallback 2: Fetch from external CMS server via HTTP (to bypass UNC permission issues)
            $cmsUrl = 'http://192.168.42.73/imiss_comment_attachments/' . $file;
            try {
                $cmsUser = env('CMS_USERNAME');
                $cmsPass = env('CMS_PASSWORD');

                $ch = curl_init($cmsUrl);
                curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
                curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, false);
                curl_setopt($ch, CURLOPT_SSL_VERIFYHOST, false);
                
                // First try anonymous access
                $responseBody = curl_exec($ch);
                $statusCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
                $contentType = curl_getinfo($ch, CURLINFO_CONTENT_TYPE);
                
                // If unauthorized and we have credentials, try again with auth
                if ($statusCode == 401 && $cmsUser && $cmsPass) {
                    curl_setopt($ch, CURLOPT_HTTPAUTH, CURLAUTH_ANY);
                    curl_setopt($ch, CURLOPT_USERPWD, $cmsUser . ':' . $cmsPass);
                    $responseBody = curl_exec($ch);
                    $statusCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
                    $contentType = curl_getinfo($ch, CURLINFO_CONTENT_TYPE);
                }
                
                curl_close($ch);
                
                if ($statusCode == 200) {
                    return response($responseBody, 200)
                        ->header('Content-Type', $contentType ?? 'image/jpeg');
                } else {
                    return response("Failed to fetch from CMS. HTTP Status: " . $statusCode . " | Attempted URL: " . $cmsUrl, 404);
                }
            } catch (\Exception $e) {
                return response("Exception fetching from CMS: " . $e->getMessage(), 500);
            }
        }

        return response()->file($path);
    }
}
