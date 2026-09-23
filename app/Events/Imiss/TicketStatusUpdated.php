<?php

namespace App\Events\Imiss;

use App\Models\ImissTicket;
use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Broadcasting\PrivateChannel;
use Illuminate\Contracts\Broadcasting\ShouldBroadcastNow;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

class TicketStatusUpdated implements ShouldBroadcastNow
{
    use Dispatchable, InteractsWithSockets, SerializesModels;

    public function __construct(
        public ImissTicket $ticket,
        public string $oldStatus,
    ) {}

    public function broadcastOn(): array
    {
        return [
            new PrivateChannel('imiss.user.' . $this->ticket->bio_id),
            new PrivateChannel('imiss.admin'),
        ];
    }

    public function broadcastWith(): array
    {
        return [
            'id' => $this->ticket->id,
            'ticket_number' => $this->ticket->ticket_number,
            'status' => $this->ticket->status,
            'old_status' => $this->oldStatus,
            'remarks' => $this->ticket->remarks,
            'reviewed_at' => $this->ticket->reviewed_at,
            'endorsed_at' => $this->ticket->endorsed_at,
            'accepted_at' => $this->ticket->accepted_at,
            'returned_at' => $this->ticket->returned_at,
            'finished_at' => $this->ticket->finished_at,
            'updated_at' => $this->ticket->updated_at,
        ];
    }

    public function broadcastAs(): string
    {
        return 'ticket.status-updated';
    }
}
