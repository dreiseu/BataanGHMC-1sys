<?php

use App\Models\ImissTicket;
use Illuminate\Support\Facades\Broadcast;

const IMISS_SECTION_NAME = 'Integrated Management Information System Section';

// Matches the IMISS-staff check already proven to work in resources/js/components/app-sidebar.tsx
// (auth.user.SectionName), rather than the UserAuthority.role table, which has no confirmed-correct
// role values for this app and is never actually exercised on the admin path.
$isImissStaff = function ($user): bool {
    return ($user->SectionName ?? '') === IMISS_SECTION_NAME;
};

// IMISS ticket chat — subscribed only while that ticket's detail/chat panel is open.
Broadcast::channel('imiss.ticket.{ticketId}', function ($user, $ticketId) use ($isImissStaff) {
    $ticket = ImissTicket::find($ticketId);
    if (!$ticket) {
        return false;
    }

    if ((string) $ticket->bio_id === (string) $user->getAuthIdentifier()) {
        return true;
    }

    return $isImissStaff($user);
});

// Per-user — ticket status changes and notifications targeted at one person.
Broadcast::channel('imiss.user.{bioId}', function ($user, $bioId) {
    return (string) $user->getAuthIdentifier() === (string) $bioId;
});

// Admin-wide — feeds the admin ticket list (imiss/admin.tsx).
Broadcast::channel('imiss.admin', function ($user) use ($isImissStaff) {
    return $isImissStaff($user);
});
