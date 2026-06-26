<?php

namespace App\Auth;

use App\Models\AuthUser;
use Illuminate\Contracts\Auth\UserProvider;
use Illuminate\Contracts\Auth\Authenticatable;
use Exception;
use SoapClient;
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

        try {
            // Retrieve SOAP config from Laravel environment/config
            $soapAddress = env('SOAP_ADDRESS_1APP');
            $appCode = env('SOAP_CODE_1APP');

            $param = [
                "appCode"       => $appCode,
                "bioUserName"   => htmlspecialchars($bioid),
                "password"      => htmlspecialchars($password)
            ];

            // 1. Authenticate via SOAP
            $soap = new SoapClient($soapAddress);
            $result = $soap->LogIn($param)->LogInResult;
            $userdata = (array) $result;

            if (isset($userdata['Code']) && ($userdata['Code'] == 100 || $userdata['Code'] == 103)) {
                
                $account = $result->Account ?? null;
                if (!$account) {
                    Log::error('HRIS Auth: Missing Account data from SOAP for bioid=' . $bioid);
                    return null;
                }

                $sectionName = $account->SectionName ?? '';

                // 2. Custom Authorization Check
                if ($sectionName !== "Integrated Management Information System Section" && 
                    $sectionName !== "Human Resource Management Section") {
                    
                    // Check tblModulesUserAccess if not in allowed sections
                    $hasAccess = DB::table('tblModulesUserAccess')
                        ->where('BiometricID', $bioid)
                        ->exists();

                    if (!$hasAccess) {
                        Log::info('HRIS Auth: User lacks required section/module permissions: ' . $bioid);
                        return null; // Deny login
                    }
                }

                // 3. Map User Data from SOAP Response
                $employeeName = $account->FullName ?? 'Unknown User';
                
                $attributes = [
                    'id'            => $bioid,
                    'bioid'         => $bioid,
                    'password'      => $password, // Be cautious storing raw passwords in session
                    'name'          => $employeeName,
                    'FullName'      => $employeeName,
                    'Section'       => $account->Section ?? '',
                    'Division'      => $account->Division ?? '',
                    'Position'      => $account->Position ?? '',
                    'SectionName'   => $sectionName,
                    'PositionName'  => $account->PositionName ?? '',
                    'UserPrivilege' => 0,
                    'avatar'        => null, 
                ];

                // Note: If you still need the Base64 photo, you can do a quick lookup to the HRIS DB here.
                $employeePhoto = DB::connection('hris')->table('tblEmployee')->where('bioID', $bioid)->value('photo');
                if ($employeePhoto) {
                    $attributes['avatar'] = 'data:image/png;base64,' . base64_encode($employeePhoto);
                }

                // 4. Sync Database and Initialize Session
                $authorityData = $this->upsertUserAuthority($bioid, $attributes);
                $attributes['UserPrivilege'] = $authorityData['UserPrivilege'];
                $attributes['role']          = $authorityData['role'];
                $attributes['permissions']   = $authorityData['permissions'];

                Session::put('soap_user_data', $attributes);

                Log::info('HRIS Auth: Login successful via SOAP for bioid=' . $bioid);

                return new AuthUser($attributes);
            }

            Log::info('HRIS Auth: Invalid credentials via SOAP for bioid=' . $bioid);
            return null;

        } catch (Exception $e) {
            Log::error('HRIS Auth Error (SOAP): ' . $e->getMessage());
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
        return true; 
    }

    public function rehashPasswordIfRequired(Authenticatable $user, array $credentials, bool $force = false)
    {
        return false;
    }
}
