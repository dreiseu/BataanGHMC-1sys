<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class VideoOrientation extends Model
{
    use HasFactory;

    protected $fillable = [
        'title',
        'description',
        'embed_url',
        'video_path',
        'is_active',
        'sort_order',
    ];
}
