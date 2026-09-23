<?php

namespace App\Events\Imiss;

use App\Models\UserNotification;
use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Broadcasting\PrivateChannel;
use Illuminate\Contracts\Broadcasting\ShouldBroadcastNow;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

class NotificationCreated implements ShouldBroadcastNow
{
    use Dispatchable, InteractsWithSockets, SerializesModels;

    public function __construct(
        public UserNotification $notification,
    ) {}

    public function broadcastOn(): array
    {
        return [
            new PrivateChannel('imiss.user.' . $this->notification->bioid),
        ];
    }

    public function broadcastWith(): array
    {
        return [
            'id' => $this->notification->id,
            'title' => $this->notification->title,
            'message' => $this->notification->message,
            'link' => $this->notification->link,
            'is_read' => $this->notification->is_read,
            'created_at' => $this->notification->created_at,
        ];
    }

    public function broadcastAs(): string
    {
        return 'notification.created';
    }
}
