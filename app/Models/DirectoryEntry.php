<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class DirectoryEntry extends Model
{
    protected $fillable = [
        'department',
        'local_no',
        'section',
        'is_active',
        'sort_order',
    ];

    protected $casts = [
        'is_active' => 'boolean',
    ];
}