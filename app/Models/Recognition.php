<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Recognition extends Model
{
    protected $fillable = [
        'sender_name',
        'sender_department',
        'recipient_name',
        'recipient_department',
        'message',
        'likes_count',
        'is_pinned',
    ];

    protected $casts = [
        'is_pinned' => 'boolean',
        'likes_count' => 'integer',
    ];

    public function likes()
    {
        return $this->hasMany(RecognitionLike::class);
    }

    public function isLikedByUser(string $bioid): bool
    {
        return $this->likes()->where('bioid', $bioid)->exists();
    }
}
