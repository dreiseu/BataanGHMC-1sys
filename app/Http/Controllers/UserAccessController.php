<?php

namespace App\Http\Controllers;

use App\Models\UserAuthority;
use App\Models\HospitalSystem;
use App\Services\AuditLogService;
use Illuminate\Http\Request;
use Inertia\Inertia;

class UserAccessController extends Controller
{
    public function index()
    {
        // Fetch HRIS employees with their section info
        $hrisEmployees = \Illuminate\Support\Facades\DB::connection('hris')
            ->table('tblEmployee')
            ->leftJoin('tblPosition', 'tblEmployee.posID', '=', 'tblPosition.posID')
            ->leftJoin('tblSection', 'tblEmployee.sectionID', '=', 'tblSection.sectionID')
            ->where('tblEmployee.isActive', 1)
            ->select(
                'tblEmployee.bioID', 
                'tblEmployee.LastName', 
                'tblEmployee.FirstName', 
                'tblEmployee.Middle',
                'tblEmployee.employmentStatus',
                'tblPosition.posName',
                'tblSection.sectionName',
                'tblSection.division as divisionID'
            )
            ->get();

        // Fetch divisions from one_sys DB and build an ID => Name map
        $divisionsMap = \Illuminate\Support\Facades\DB::connection('sqlsrv')
            ->table('tblDivisions')
            ->pluck('divisionName', 'divisionID');

        $userAuthorities = UserAuthority::all()->keyBy('BiometricID');

        $users = $hrisEmployees->map(function ($employee) use ($userAuthorities, $divisionsMap) {
            $bioIdStr = (string) $employee->bioID;
            $auth = $userAuthorities->get($bioIdStr);
            
            $middle = $employee->Middle ? " {$employee->Middle} " : " ";
            $fullName = "{$employee->FirstName}{$middle}{$employee->LastName}";
            
            // Prefer HRIS names, fallback to UserAuthority or N/A
            $positionName = $employee->posName ?: ($auth ? $auth->PositionName : 'N/A');
            $sectionName = $employee->sectionName ?: ($auth ? $auth->SectionName : 'N/A');
            $employmentStatus = $employee->employmentStatus ?: 'N/A';

            $divisionName = $divisionsMap->get($employee->divisionID, 'N/A');

            return [
                'BiometricID' => $bioIdStr,
                'FullName' => trim($fullName),
                'PositionName' => trim($positionName),
                'SectionName' => trim($sectionName),
                'DivisionName' => trim($divisionName),
                'EmploymentStatus' => trim($employmentStatus),
                'permissions' => $auth ? $auth->permissions : [],
            ];
        })->sortBy('FullName')->values();

        $systems = HospitalSystem::all();

        return Inertia::render('utilities/user-access', [
            'users' => $users,
            'systems' => $systems,
        ]);
    }

    public function update(Request $request, string $biometricId, AuditLogService $auditLog)
    {
        $request->validate([
            'systems' => ['present', 'array'],
            'systems.*' => ['integer', 'exists:hospital_systems,id'],
        ]);

        $user = UserAuthority::where('BiometricID', $biometricId)->first();
        
        if (!$user) {
            $user = new UserAuthority();
            $user->BiometricID = $biometricId;
            $user->UserPrivilege = 0;
            $user->role = 'user';
            
            $hrisEmp = \Illuminate\Support\Facades\DB::connection('hris')
                ->table('tblEmployee')
                ->where('bioID', $biometricId)
                ->first(['FirstName', 'LastName', 'Middle']);
            
            if ($hrisEmp) {
                $middle = $hrisEmp->Middle ? " {$hrisEmp->Middle} " : " ";
                $user->FullName = trim("{$hrisEmp->FirstName}{$middle}{$hrisEmp->LastName}");
            }
        }

        $permissions = $user->permissions ?? [];
        $oldSystemPermissions = array_values(array_filter(
            $permissions,
            fn ($permission) => str_starts_with($permission, 'system:')
        ));
        
        // Remove existing system access
        $permissions = array_filter($permissions, function ($permission) {
            return !str_starts_with($permission, 'system:');
        });

        // Add new system access
        foreach ($request->systems as $systemId) {
            $permissions[] = "system:{$systemId}";
        }

        // Re-index array
        $user->permissions = array_values($permissions);
        $user->save();

        $newSystemPermissions = array_map(
            fn ($systemId) => "system:{$systemId}",
            $request->systems
        );

        $auditLog->log(
            action: 'updated',
            auditableType: 'user_access',
            auditableId: $biometricId,
            auditableLabel: $user->FullName,
            oldValues: ['systems' => $oldSystemPermissions],
            newValues: ['systems' => $newSystemPermissions],
        );

        return back();
    }
}
