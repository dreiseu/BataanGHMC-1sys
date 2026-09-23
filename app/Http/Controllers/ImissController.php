<?php

namespace App\Http\Controllers;

use App\Models\Department;
use App\Models\DirectoryEntry;
use App\Models\HospitalSystem;
use App\Models\ImissTicket;
use App\Services\NasStorage;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Cache;
use Inertia\Inertia;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Str;
use Illuminate\Support\Facades\Response;

class ImissController extends Controller
{
    public function index()
    {
        // Assuming Auth::user() has a bio_id property, otherwise fallback to id
        $bioId = (string) (Auth::user()->bio_id ?? Auth::id());

        // Comments are eager-loaded (mirroring admin()) now that updates are pushed via
        // WebSocket events instead of interval polling — a single user's own tickets is a
        // much smaller set than admin() already loads for every ticket, so this is safe.
        $tickets = ImissTicket::with('comments')
            ->where('bio_id', $bioId)
            ->get()
            ->sortByDesc('created_at')
            ->values();

        $requestTypes = Cache::remember('imiss_request_types_active', 86400, function () {
            if (\Illuminate\Support\Facades\Schema::hasTable('imiss_request_types')) {
                return \App\Models\ImissRequestType::where('is_active', true)->get()->toArray();
            }
            return [];
        });

        if (empty($requestTypes)) {
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

        // Shares the "directory_entries_all" cache key with DirectoryController so a
        // directory edit (which forgets that key) invalidates this list too.
        $directoryEntries = collect(Cache::remember('directory_entries_all', 3600, function () {
            return DirectoryEntry::get()
                ->sortBy([
                    ['section', 'asc'],
                    ['sort_order', 'asc'],
                    ['department', 'asc'],
                ])
                ->values()
                ->toArray();
        }))->where('is_active', true)->values()->all();

        $departments = Cache::remember('departments_all', 3600, function () {
            return Department::orderBy('Department')->get(['id', 'Code', 'Department'])->toArray();
        });

        return Inertia::render('imiss/index', [
            'tickets' => $tickets,
            'requestTypes' => $requestTypes,
            'directoryEntries' => $directoryEntries,
            'departments' => $departments,
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'request_type' => 'required|string|max:50',
            'description' => 'required|string',
            'local_number' => 'required|string|max:50',
            'pc_number' => 'nullable|string|max:50',
            'location' => 'required|string|max:100',
            'priority' => 'required|string|max:20',
            'attachments' => 'nullable|array',
            'attachments.*' => 'file|max:10240', // 10MB max per file
        ]);

        // Auth::user() (AuthUser) exposes the requester's biometric ID as
        // "bioid" (see AuthUser::getAuthIdentifierName) — "bio_id" is not a
        // real attribute on it, so that check must come first or this
        // silently falls through to whatever raw identifier was used to log in.
        $bioId = Auth::user()->bioid ?? Auth::user()->bio_id ?? Auth::id();

        $hasActiveTicket = ImissTicket::where('bio_id', $bioId)
            ->whereNotIn('status', ['Resolved', 'Cancelled'])
            ->exists();

        if ($hasActiveTicket) {
            return back()->withErrors([
                'active_ticket' => 'You already have an active ticket. Please wait for it to be resolved before submitting a new one.',
            ]);
        }

        // Generate Ticket Number (e.g., TKT-260715-001)
        $datePrefix = date('ymd');
        $latestTicket = ImissTicket::where('ticket_number', 'like', "TKT-{$datePrefix}-%")->orderBy('id', 'desc')->first();
        $nextNumber = 1;
        if ($latestTicket) {
            $parts = explode('-', $latestTicket->ticket_number);
            $nextNumber = intval(end($parts)) + 1;
        }
        $ticketNumber = sprintf("TKT-%s-%03d", $datePrefix, $nextNumber);

        $attachmentPaths = [];
        if ($request->hasFile('attachments')) {
            $files = $request->file('attachments');

            if (is_array($files)) {
                foreach ($files as $file) {
                    if ($file instanceof \Illuminate\Http\UploadedFile && $file->isValid()) {
                        try {
                            $path = NasStorage::store($file, 'imiss_attachments');
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
                    $path = NasStorage::store($files, 'imiss_attachments');
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
            'feedback_text' => [
                'nullable',
                'string',
                function ($attribute, $value, $fail) use ($request) {
                    $rating = $request->input('rating');
                    if ($rating !== null && $rating <= 3) {
                        if (trim((string) $value) === '') {
                            $fail('Feedback is required when the rating is 3 or below.');
                        } elseif (strlen(trim($value)) < 10) {
                            $fail('Feedback must be at least 10 characters when the rating is 3 or below.');
                        }
                    }
                },
            ],
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
        $tickets = ImissTicket::with('comments')
            ->get()
            ->sortByDesc('created_at')
            ->values();
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
            $notification = \App\Models\UserNotification::create([
                'bioid' => $ticket->bio_id,
                'title' => 'Ticket Update',
                'message' => "Your ticket {$ticket->ticket_number} is now: {$ticket->status}",
                'link' => '/imiss',
            ]);

            try {
                broadcast(new \App\Events\Imiss\TicketStatusUpdated($ticket, $oldStatus));
            } catch (\Exception $e) {
                \Illuminate\Support\Facades\Log::error('IMISS TicketStatusUpdated broadcast failed: ' . $e->getMessage());
            }

            try {
                broadcast(new \App\Events\Imiss\NotificationCreated($notification));
            } catch (\Exception $e) {
                \Illuminate\Support\Facades\Log::error('IMISS NotificationCreated broadcast failed: ' . $e->getMessage());
            }
        }

        return back();
    }

    /**
     * Return comments for a single ticket — called on-demand when the user opens the ticket panel.
     * Keeping this out of the main index() load eliminates concurrent LOB I/O on page load/polls.
     */
    public function getComments(ImissTicket $ticket)
    {
        // Release session file lock immediately for read-only request
        session_write_close();

        $bioId = (string) (Auth::user()->bio_id ?? Auth::id());

        // Ensure the ticket belongs to this user (or they are an admin/tech)
        if ($ticket->bio_id != $bioId) {
            $authority = \Illuminate\Support\Facades\DB::table('UserAuthority')
                ->where('BiometricID', $bioId)
                ->first(['role']);
            if (!$authority || !in_array($authority->role, ['admin', 'imiss_tech', 'imiss_admin'])) {
                abort(403);
            }
        }

        $comments = $ticket->comments()
            ->select('id', 'ticket_id', 'sender_bioid', 'sender_name', 'message', 'attachments', 'created_at')
            ->get()
            ->toArray();

        return response()->json($comments);
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
                            $path = NasStorage::store($file, 'imiss_comment_attachments');
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
                    $path = NasStorage::store($files, 'imiss_comment_attachments');
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

        $comment = \App\Models\ImissTicketComment::create([
            'ticket_id' => $ticket->id,
            'sender_bioid' => $bioId,
            'sender_name' => $name,
            'message' => $validated['message'] ?? '',
            'attachments' => count($attachmentPaths) > 0 ? $attachmentPaths : null,
        ]);

        // Clear ticket comments cache when a new comment is posted
        Cache::forget("ticket_comments_{$ticket->id}");
        Cache::forget("ticket_comments_count_{$ticket->id}");

        try {
            broadcast(new \App\Events\Imiss\CommentPosted($comment, $ticket))->toOthers();
        } catch (\Exception $e) {
            \Illuminate\Support\Facades\Log::error('IMISS CommentPosted broadcast failed: ' . $e->getMessage());
        }

        if ($ticket->bio_id != $bioId) {
            $notification = \App\Models\UserNotification::create([
                'bioid' => $ticket->bio_id,
                'title' => 'New Message',
                'message' => "You have a new comment on ticket {$ticket->ticket_number}",
                'link' => '/imiss',
            ]);

            try {
                broadcast(new \App\Events\Imiss\NotificationCreated($notification));
            } catch (\Exception $e) {
                \Illuminate\Support\Facades\Log::error('IMISS NotificationCreated broadcast failed: ' . $e->getMessage());
            }
        }

        return back();
    }

    public function attachment($file)
    {
        // Release session lock immediately for read-only request
        session_write_close();

        // Prevent path traversal attacks
        $file = basename($file);

        // Served via the IIS "1bghmc_attachments" virtual directory (which holds its own
        // working NAS credentials) instead of reading the UNC path directly from PHP,
        // since the app pool identity cannot reliably read the NAS share itself.
        $nasResponse = Http::timeout(10)->get(rtrim(env('APP_URL'), '/') . '/1bghmc_attachments/imiss_attachments/' . $file);

        if (!$nasResponse->successful()) {
            abort(404);
        }

        return response($nasResponse->body(), 200)
            ->header('Content-Type', $nasResponse->header('Content-Type') ?: 'application/octet-stream');
    }

    public function openCommentAttachment($file)
    {
        // Release session lock immediately for read-only request
        session_write_close();

        $file = basename($file);

        $nasResponse = Http::timeout(10)->get(rtrim(env('APP_URL'), '/') . '/1bghmc_attachments/imiss_comment_attachments/' . $file);

        if ($nasResponse->successful()) {
            return response($nasResponse->body(), 200)
                ->header('Content-Type', $nasResponse->header('Content-Type') ?: 'application/octet-stream');
        }

        // Fallback 1: check main imiss_attachments folder
        $fallbackResponse = Http::timeout(10)->get(rtrim(env('APP_URL'), '/') . '/1bghmc_attachments/imiss_attachments/' . $file);

        if ($fallbackResponse->successful()) {
            return response($fallbackResponse->body(), 200)
                ->header('Content-Type', $fallbackResponse->header('Content-Type') ?: 'application/octet-stream');
        }

        // Fallback 2: Fetch from external CMS server via HTTP (to bypass UNC permission issues)
        $cmsUrl = 'http://192.168.42.73/imiss_comment_attachments/' . $file;
        try {
            $cmsUser = env('CMS_USERNAME');
            $cmsPass = env('CMS_PASSWORD');
            $cmsDomain = env('CMS_DOMAIN', 'CMS-PLUS-SVR');

            // Disconnect from database before making slow external HTTP request
            \Illuminate\Support\Facades\DB::disconnect();

            $ch = curl_init($cmsUrl);
            curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
            curl_setopt($ch, CURLOPT_CONNECTTIMEOUT, 3); // 3 seconds connection timeout
            curl_setopt($ch, CURLOPT_TIMEOUT, 5);        // 5 seconds total timeout
            curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, false);
            curl_setopt($ch, CURLOPT_SSL_VERIFYHOST, false);

            if ($cmsUser && $cmsPass) {
                $authStr = $cmsDomain ? $cmsDomain . '\\' . $cmsUser . ':' . $cmsPass : $cmsUser . ':' . $cmsPass;
                curl_setopt($ch, CURLOPT_HTTPAUTH, CURLAUTH_NTLM | CURLAUTH_BASIC);
                curl_setopt($ch, CURLOPT_USERPWD, $authStr);
            }

            $responseBody = curl_exec($ch);
            $statusCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
            $contentType = curl_getinfo($ch, CURLINFO_CONTENT_TYPE);

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
}
