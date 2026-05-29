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
        'priority',
        'attachments',
        'status',
        'remarks',
        'accepted_by_name',
        'accepted_at',
        'rating',
        'feedback_text',
    ];

    protected $casts = [
        'attachments' => 'array',
        'accepted_at' => 'datetime',
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
