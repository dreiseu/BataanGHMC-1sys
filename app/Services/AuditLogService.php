<?php

namespace App\Services;

use App\Models\AuditLog;
use Illuminate\Support\Carbon;

class AuditLogService
{
    public function log(
        string $action,
        string $auditableType,
        ?string $auditableId = null,
        ?string $auditableLabel = null,
        ?array $oldValues = null,
        ?array $newValues = null,
        ?array $metadata = null,
    ): AuditLog {
        $userData = session('soap_user_data', []);

        return AuditLog::create([
            'actor_biometric_id' => (string) ($userData['bioid'] ?? 'system'),
            'actor_name' => $userData['FullName'] ?? $userData['name'] ?? 'Unknown',
            'action' => $action,
            'auditable_type' => $auditableType,
            'auditable_id' => $auditableId,
            'auditable_label' => $auditableLabel,
            'old_values' => $this->normalizeValues($oldValues),
            'new_values' => $this->normalizeValues($newValues),
            'metadata' => $metadata ?? $this->defaultMetadata(),
            'created_at' => now(),
        ]);
    }

    private function normalizeValues(?array $values): ?array
    {
        if ($values === null) {
            return null;
        }

        foreach ($values as $key => $value) {
            if (! in_array($key, ['created_at', 'updated_at', 'event_date'], true) || $value === null) {
                continue;
            }

            $values[$key] = Carbon::parse($value)
                ->timezone(config('app.timezone'))
                ->format('M j, Y g:i A');
        }

        return $values;
    }

    private function defaultMetadata(): array
    {
        $request = request();

        return [
            'ip' => $request->ip(),
            'user_agent' => $request->userAgent(),
            'route' => $request->route()?->getName() ?? $request->path(),
        ];
    }
}
