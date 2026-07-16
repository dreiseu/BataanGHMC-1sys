<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class HospitalSystem extends Model
{
    protected $fillable = ['name', 'url', 'is_sso', 'is_default'];

    protected $casts = [
        'is_sso' => 'boolean',
        'is_default' => 'boolean',
    ];
}
