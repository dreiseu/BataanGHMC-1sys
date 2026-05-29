<?php

namespace App\Auth;

use App\Models\AuthUser;
use Illuminate\Contracts\Auth\UserProvider;
use Illuminate\Contracts\Auth\Authenticatable;
use Exception;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Session;
use Illuminate\Support\Facades\Log;

class SoapUserProvider implements UserProvider
{
    public function retrieveById($identifier)
    {
        $data = Session::get('soap_user_data');
        if ($data && ($data['bioid'] ?? null) == $identifier) {
            // Always pull fresh role and permissions from the DB
            // so changes take effect without requiring a re-login
            $authority = DB::table('UserAuthority')
                ->where('BiometricID', $identifier)
                ->first(['role', 'permissions']);

            if ($authority) {
                $data['role'] = $authority->role ?? 'user';
                $permissions = $authority->permissions ?? '[]';
                $data['permissions'] = is_string($permissions)
                    ? (json_decode($permissions, true) ?? [])
                    : ($permissions ?? []);
            } else {
                $data['role'] = 'user';
                $data['permissions'] = [];
            }

            return new AuthUser($data);
        }
        return null;
    }

    public function retrieveByToken($identifier, $token)
    {
        return null;
    }

    public function updateRememberToken(Authenticatable $user, $token)
    {
        // Not supported
    }

    public function retrieveByCredentials(array $credentials)
    {
        $bioid    = trim((string) ($credentials['bioid'] ?? ''));
        $password = trim((string) ($credentials['password'] ?? ''));

        if (!$bioid || !$password) {
            return null;
        }

        // Fast fail: password must equal the bioid (temporary rule)
        if ($password !== $bioid) {
            Log::info('HRIS Auth: Invalid credentials for bioid=' . $bioid);
            return null;
        }

        try {
            // Query HRIS to check if the employee exists and is active.
            $employee = DB::connection('hris')
                ->table('tblEmployee')
                ->where('bioID', $bioid)
                ->where('isActive', 1)
                ->first();

            if (!$employee) {
                Log::info('HRIS Auth: Biometric ID not found or inactive: ' . $bioid);
                return null;
            }

            // Build employee name
            $firstName     = trim($employee->FirstName ?? '');
            $middle        = trim($employee->Middle ?? '');
            $lastName      = trim($employee->LastName ?? '');
            $nameExt       = trim($employee->NameExt ?? '');
            $middleInitial = $middle ? strtoupper(substr($middle, 0, 1)) . '.' : '';
            $employeeName  = trim(implode(' ', array_filter([$firstName, $middleInitial, $lastName, $nameExt])));

            if (!$employeeName) {
                $employeeName = 'Unknown User';
            }

            $sectionId   = $employee->sectionID ?? '';
            $positionId  = $employee->posID ?? '';
            $sectionName = '';
            $divisionId  = '';
            $positionName = '';
            $avatarDataUri = null;

            // Lookup Section Name and Division
            if (!empty($sectionId)) {
                $section = DB::connection('hris')
                    ->table('tblSection')
                    ->where('sectionID', $sectionId)
                    ->first();
                if ($section) {
                    $sectionName = $section->sectionName ?? '';
                    $divisionId  = $section->division ?? '';
                }
            }

            // Lookup Position Name
            if (!empty($positionId)) {
                $pos = DB::connection('hris')
                    ->table('tblPosition')
                    ->where('posID', $positionId)
                    ->first();
                if ($pos) {
                    $positionName = $pos->posName ?? '';
                }
            }

            // Photo as base64 data URI
            if (!empty($employee->photo)) {
                $avatarDataUri = 'data:image/png;base64,' . base64_encode($employee->photo);
            }

            $attributes = [
                'id'            => $bioid,
                'bioid'         => $bioid,
                'password'      => $password,
                'name'          => $employeeName,
                'FullName'      => $employeeName,
                'Section'       => $sectionId,
                'Division'      => $divisionId,
                'Position'      => $positionId,
                'SectionName'   => $sectionName,
                'PositionName'  => $positionName,
                'UserPrivilege' => 0,
                'avatar'        => $avatarDataUri,
            ];

            $authorityData = $this->upsertUserAuthority($bioid, $attributes);
            $attributes['UserPrivilege'] = $authorityData['UserPrivilege'];
            $attributes['role'] = $authorityData['role'];
            $attributes['permissions'] = $authorityData['permissions'];

            Session::put('soap_user_data', $attributes);

            Log::info('HRIS Auth: Login successful for bioid=' . $bioid);

            return new AuthUser($attributes);

        } catch (Exception $e) {
            Log::error('HRIS Auth Error: ' . $e->getMessage());
        }

        return null;
    }

    /**
     * Upsert the UserAuthority record in the local database.
     */
    private function upsertUserAuthority(string $bioid, array $data): array
    {
        $existing = DB::table('UserAuthority')->where('BiometricID', $bioid)->first();

        $now = now();

        $payload = [
            'FullName'     => $data['FullName'] ?? null,
            'Section'      => $data['Section'] ?? null,
            'Division'     => $data['Division'] ?? null,
            'Position'     => $data['Position'] ?? null,
            'SectionName'  => $data['SectionName'] ?? null,
            'PositionName' => $data['PositionName'] ?? null,
            'LastLogin'    => $now,
            'updated_at'   => $now,
        ];

        if ($existing) {
            DB::table('UserAuthority')->where('BiometricID', $bioid)->update($payload);
            return [
                'UserPrivilege' => (int) $existing->UserPrivilege,
                'role' => $existing->role ?? 'user',
                'permissions' => json_decode($existing->permissions ?? '[]', true) ?: [],
            ];
        }

        // First-time login
        $payload['BiometricID']   = $bioid;
        $payload['UserPrivilege'] = 0;
        $payload['role']          = 'user';
        $payload['permissions']   = json_encode([]);
        $payload['created_at']    = $now;

        DB::table('UserAuthority')->insert($payload);

        return [
            'UserPrivilege' => 0,
            'role' => 'user',
            'permissions' => [],
        ];
    }

    /**
     * Validate the user's credentials.
     * For now, the password must match the bioid exactly.
     */
    public function validateCredentials(Authenticatable $user, array $credentials)
    {
        $bioid    = $credentials['bioid'] ?? null;
        $password = $credentials['password'] ?? null;

        // Password must equal the bioid (temporary rule)
        return $bioid && $password && $password === $bioid;
    }

    public function rehashPasswordIfRequired(Authenticatable $user, array $credentials, bool $force = false)
    {
        return false;
    }
}
