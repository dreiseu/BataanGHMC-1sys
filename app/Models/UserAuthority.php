<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class UserAuthority extends Model
{
    /**
     * The table associated with the model.
     *
     * @var string
     */
    protected $table = 'UserAuthority';

    /**
     * Indicates if the model should be timestamped.
     *
     * @var bool
     */
    public $timestamps = false;

    /**
     * The primary key associated with the table.
     *
     * @var string
     */
    protected $primaryKey = 'BiometricID';

    /**
     * Indicates if the model's ID is auto-incrementing.
     *
     * @var bool
     */
    public $incrementing = false;

    /**
     * The data type of the auto-incrementing ID.
     *
     * @var string
     */
    protected $keyType = 'string';

    /**
     * The attributes that are mass assignable.
     *
     * @var array
     */
    protected $fillable = [
        'BiometricID',
        'FullName',
        'Section',
        'Division',
        'Position',
        'SectionName',
        'PositionName',
        'UserPrivilege',
        'role',
        'permissions',
        'LastLogin',
    ];

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'permissions' => 'array',
            'LastLogin' => 'datetime',
            'UserPrivilege' => 'integer',
        ];
    }
}
