<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class ImissTicket extends Model
{
    protected $fillable = [
        'ticket_number',
        'bio_id',
        'request_type',
        'description',
        'location',
        'local_number',
        'pc_number',
        'priority',
        'attachments',
        'status',
        'remarks',
        'accepted_by',
        'accepted_at',
        'cancelled_at',
        'reviewed_at',
        'reviewed_by',
        'endorsed_at',
        'endorsed_by',
        'returned_at',
        'returned_by',
        'finished_at',
        'finished_by',
        'resolved_at',
        'rating',
        'feedback_text',
    ];

    protected $casts = [
        'attachments' => 'array',
        'accepted_at' => 'datetime',
        'cancelled_at' => 'datetime',
        'reviewed_at' => 'datetime',
        'endorsed_at' => 'datetime',
        'returned_at' => 'datetime',
        'finished_at' => 'datetime',
        'resolved_at' => 'datetime',
    ];

    protected $appends = ['subject'];

    public function getSubjectAttribute()
    {
        return \Illuminate\Support\Str::limit($this->description, 50);
    }

    public function comments()
    {
        return $this->hasMany(ImissTicketComment::class, 'ticket_id')->orderBy('created_at', 'asc');
    }
}
