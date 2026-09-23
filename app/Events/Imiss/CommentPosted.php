<?php

namespace App\Events\Imiss;

use App\Models\ImissTicket;
use App\Models\ImissTicketComment;
use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Broadcasting\PrivateChannel;
use Illuminate\Contracts\Broadcasting\ShouldBroadcastNow;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

class CommentPosted implements ShouldBroadcastNow
{
    use Dispatchable, InteractsWithSockets, SerializesModels;

    public function __construct(
        public ImissTicketComment $comment,
        public ImissTicket $ticket,
    ) {}

    public function broadcastOn(): array
    {
        return [
            new PrivateChannel('imiss.ticket.' . $this->ticket->id),
            new PrivateChannel('imiss.user.' . $this->ticket->bio_id),
            new PrivateChannel('imiss.admin'),
        ];
    }

    public function broadcastWith(): array
    {
        return [
            'id' => $this->comment->id,
            'ticket_id' => $this->comment->ticket_id,
            'ticket_number' => $this->ticket->ticket_number,
            'sender_bioid' => $this->comment->sender_bioid,
            'sender_name' => $this->comment->sender_name,
            'message' => $this->comment->message,
            'attachments' => $this->comment->attachments,
            'created_at' => $this->comment->created_at,
        ];
    }

    public function broadcastAs(): string
    {
        return 'comment.posted';
    }
}
