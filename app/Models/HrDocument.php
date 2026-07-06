<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class HrDocument extends Model
{
    protected $fillable = [
        'title',
        'description',
        'type',
        'category',
        'file_path',
        'file_type',
        'is_active',
        'sort_order',
    ];
}
