export const APP_TIMEZONE = 'Asia/Manila';

export function formatDateTime(value: string, options?: Intl.DateTimeFormatOptions) {
    const parsed = new Date(value);

    if (Number.isNaN(parsed.getTime())) {
        return value;
    }

    return parsed.toLocaleString('en-PH', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        hour12: true,
        timeZone: APP_TIMEZONE,
        ...options,
    });
}

const DATE_FIELD_KEYS = new Set(['created_at', 'updated_at', 'event_date']);

function isDateField(key: string) {
    return DATE_FIELD_KEYS.has(key) || key.endsWith('_at') || key.endsWith('_date');
}

function formatJsonValue(key: string, value: unknown): unknown {
    if (typeof value === 'string' && isDateField(key)) {
        const parsed = Date.parse(value);
        if (!Number.isNaN(parsed)) {
            return formatDateTime(value);
        }
    }

    if (Array.isArray(value)) {
        return value.map((item) =>
            item && typeof item === 'object' && !Array.isArray(item)
                ? formatJsonObject(item as Record<string, unknown>)
                : item,
        );
    }

    if (value && typeof value === 'object') {
        return formatJsonObject(value as Record<string, unknown>);
    }

    return value;
}

function formatJsonObject(obj: Record<string, unknown>): Record<string, unknown> {
    return Object.fromEntries(
        Object.entries(obj).map(([key, val]) => [key, formatJsonValue(key, val)]),
    );
}

export function formatJsonWithTimezone(value: Record<string, unknown> | null) {
    if (!value || Object.keys(value).length === 0) {
        return '—';
    }

    return JSON.stringify(formatJsonObject(value), null, 2);
}
