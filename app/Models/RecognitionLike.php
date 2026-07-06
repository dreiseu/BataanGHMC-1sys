<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class RecognitionLike extends Model
{
    protected $fillable = [
        'recognition_id',
        'bioid',
    ];
}