<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class ImissTicketComment extends Model
{
    protected $fillable = [
        'ticket_id',
        'sender_bioid',
        'sender_name',
        'message',
        'attachments',
    ];

    protected $casts = [
        'attachments' => 'array',
    ];

    public function ticket()
    {
        return $this->belongsTo(ImissTicket::class, 'ticket_id');
    }
}
