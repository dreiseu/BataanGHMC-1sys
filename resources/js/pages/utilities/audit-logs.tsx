import LineWaves from '@/components/ui/linewaves';
import { APP_TIMEZONE, formatDateTime } from '@/lib/datetime';
import { cn } from '@/lib/utils';
import { Head } from '@inertiajs/react';
import { format } from 'date-fns';
import { Calendar as CalendarIcon, Eye, History, Search, X } from 'lucide-react';
import { useMemo, useState } from 'react';
import type { DateRange } from 'react-day-picker';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from '@/components/ui/popover';
import {
    Pagination,
    PaginationContent,
    PaginationEllipsis,
    PaginationItem,
    PaginationLink,
    PaginationNext,
    PaginationPrevious,
} from '@/components/ui/pagination';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';

type AuditLog = {
    id: number;
    actor_biometric_id: string;
    actor_name: string | null;
    action: 'created' | 'updated' | 'deleted' | 'reordered';
    auditable_type: string;
    auditable_id: string | null;
    auditable_label: string | null;
    old_values: Record<string, unknown> | null;
    new_values: Record<string, unknown> | null;
    metadata: Record<string, unknown> | null;
    created_at: string;
};

type Props = {
    logs: AuditLog[];
};

const ENTITY_LABELS: Record<string, string> = {
    hospital_system: 'Systems & Portals',
    user_access: 'User Access',
    directory_entry: 'Directory',
    event: 'Event',
    imiss_request_type: 'IMISS Request Type',
    video_orientation: 'Video Orientation',
    hr_document: 'HR Document',
};

const ACTION_LABELS: Record<string, string> = {
    created: 'Added',
    updated: 'Edited',
    deleted: 'Deleted',
    reordered: 'Reordered',
};

const ACTION_VARIANTS: Record<string, 'default' | 'secondary' | 'destructive' | 'outline'> = {
    created: 'default',
    updated: 'secondary',
    deleted: 'destructive',
    reordered: 'outline',
};

function formatJson(value: Record<string, unknown> | null) {
    if (!value || Object.keys(value).length === 0) {
        return '—';
    }

    return JSON.stringify(value, null, 2);
}

function toDateKey(value: string | Date): string {
    const date = typeof value === 'string' ? new Date(value) : value;

    return date.toLocaleDateString('en-CA', { timeZone: APP_TIMEZONE });
}

function isWithinDateRange(createdAt: string, range: DateRange | undefined): boolean {
    if (!range?.from) {
        return true;
    }

    const logDate = toDateKey(createdAt);
    const fromDate = toDateKey(range.from);

    if (!range.to) {
        return logDate === fromDate;
    }

    const toDate = toDateKey(range.to);

    return logDate >= fromDate && logDate <= toDate;
}

function formatDateRangeLabel(range: DateRange | undefined): string {
    if (!range?.from) {
        return 'All dates';
    }

    if (!range.to || toDateKey(range.from) === toDateKey(range.to)) {
        return format(range.from, 'MMM d, yyyy');
    }

    return `${format(range.from, 'MMM d, yyyy')} – ${format(range.to, 'MMM d, yyyy')}`;
}

export default function UtilitiesAuditLogs({ logs }: Props) {
    const [search, setSearch] = useState('');
    const [actionFilter, setActionFilter] = useState('all');
    const [entityFilter, setEntityFilter] = useState('all');
    const [dateRange, setDateRange] = useState<DateRange | undefined>(undefined);
    const [currentPage, setCurrentPage] = useState(1);
    const [selectedLog, setSelectedLog] = useState<AuditLog | null>(null);
    const itemsPerPage = 15;

    const entityOptions = useMemo(() => {
        const types = new Set([
            ...Object.keys(ENTITY_LABELS),
            ...logs.map((log) => log.auditable_type),
        ]);

        return Array.from(types).sort((a, b) =>
            (ENTITY_LABELS[a] ?? a).localeCompare(ENTITY_LABELS[b] ?? b),
        );
    }, [logs]);

    const filteredLogs = useMemo(() => {
        const keyword = search.toLowerCase().trim();

        return logs.filter((log) => {
            if (actionFilter !== 'all' && log.action !== actionFilter) {
                return false;
            }

            if (entityFilter !== 'all' && log.auditable_type !== entityFilter) {
                return false;
            }

            if (!isWithinDateRange(log.created_at, dateRange)) {
                return false;
            }

            if (!keyword) {
                return true;
            }

            const haystack = [
                log.actor_name,
                log.actor_biometric_id,
                log.auditable_label,
                log.auditable_id,
                ENTITY_LABELS[log.auditable_type] ?? log.auditable_type,
                ACTION_LABELS[log.action] ?? log.action,
            ]
                .filter(Boolean)
                .join(' ')
                .toLowerCase();

            return haystack.includes(keyword);
        });
    }, [logs, search, actionFilter, entityFilter, dateRange]);

    const paginatedLogs = useMemo(() => {
        const start = (currentPage - 1) * itemsPerPage;
        return filteredLogs.slice(start, start + itemsPerPage);
    }, [filteredLogs, currentPage]);

    const totalPages = Math.max(1, Math.ceil(filteredLogs.length / itemsPerPage));

    const paginationRange = useMemo(() => {
        if (totalPages <= 4) {
            return Array.from({ length: totalPages }, (_, i) => i + 1);
        }

        let start = Math.max(1, currentPage - 1);
        let end = Math.min(totalPages, start + 2);

        if (end - start < 2) {
            start = Math.max(1, end - 2);
        }

        const pages: (number | 'ellipsis')[] = [];
        for (let i = start; i <= end; i++) {
            pages.push(i);
        }

        if (end < totalPages) {
            if (end < totalPages - 1) {
                pages.push('ellipsis');
            }
            pages.push(totalPages);
        }

        return pages;
    }, [currentPage, totalPages]);

    return (
        <>
            <Head title="Audit Logs" />

            <div className="p-6 mt-6 mx-auto w-full max-w-7xl space-y-8">
                <section className="relative overflow-hidden rounded-3xl border border-[#00D4FF]/20 bg-gradient-to-br from-[#0F172A] via-[#1E293B] to-[#0F172A] p-8 sm:p-10 shadow-lg min-h-[180px] flex flex-col justify-center group">
                    <div className="absolute inset-0 z-0 opacity-30 mix-blend-screen">
                        <LineWaves />
                    </div>

                    <div className="absolute top-0 right-0 -mt-20 -mr-20 h-72 w-72 rounded-full bg-[#00D4FF] opacity-10 blur-[80px] group-hover:opacity-20 transition-opacity duration-700 pointer-events-none"></div>
                    <div className="absolute bottom-0 left-0 -mb-20 -ml-20 h-72 w-72 rounded-full bg-blue-600 opacity-10 blur-[80px] group-hover:opacity-20 transition-opacity duration-700 pointer-events-none"></div>

                    <div className="relative z-10 w-full max-w-3xl">
                        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#00D4FF]/10 border border-[#00D4FF]/20 text-[#00D4FF] text-xs font-bold tracking-widest uppercase mb-4 shadow-[0_0_15px_rgba(0,212,255,0.15)]">
                            <span className="relative flex h-2 w-2">
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#00D4FF] opacity-75"></span>
                                <span className="relative inline-flex rounded-full h-2 w-2 bg-[#00D4FF]"></span>
                            </span>
                            Utility Module
                        </div>
                        <h1 className="text-3xl font-black tracking-tight text-white sm:text-4xl drop-shadow-md">
                            Audit Logs
                        </h1>
                        <p className="mt-3 text-base sm:text-lg text-slate-300 leading-relaxed font-medium max-w-2xl">
                            Review a complete history of records added, edited, deleted, and reordered across all utility modules.
                        </p>
                    </div>
                </section>

                <div className="flex flex-col lg:flex-row lg:items-center gap-4">
                    <div className="relative flex-1 max-w-md group">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground transition-colors group-focus-within:text-[#00D4FF]" />
                        <Input
                            value={search}
                            onChange={(e) => {
                                setSearch(e.target.value);
                                setCurrentPage(1);
                            }}
                            placeholder="Search by user, record, or module..."
                            className="pl-10 border-muted-foreground/20 focus-visible:ring-[#00D4FF]/30 transition-all shadow-sm rounded-xl"
                        />
                    </div>

                    <div className="flex flex-col sm:flex-row gap-3 flex-wrap">
                        <div className="relative">
                            <Popover>
                                <PopoverTrigger asChild>
                                    <Button
                                        variant="outline"
                                        className={cn(
                                            'w-full sm:w-[240px] justify-start text-left font-normal rounded-xl pr-10',
                                            !dateRange?.from && 'text-muted-foreground',
                                        )}
                                    >
                                        <CalendarIcon className="mr-2 h-4 w-4 shrink-0" />
                                        <span className="truncate">{formatDateRangeLabel(dateRange)}</span>
                                    </Button>
                                </PopoverTrigger>
                                <PopoverContent className="w-auto p-0 z-[100] pointer-events-auto" align="start">
                                    <Calendar
                                        mode="range"
                                        selected={dateRange}
                                        onSelect={(range) => {
                                            setDateRange(range);
                                            setCurrentPage(1);
                                        }}
                                        initialFocus
                                    />
                                </PopoverContent>
                            </Popover>
                            {dateRange?.from && (
                                <button
                                    type="button"
                                    onClick={() => {
                                        setDateRange(undefined);
                                        setCurrentPage(1);
                                    }}
                                    className="absolute right-2 top-1/2 -translate-y-1/2 h-6 w-6 rounded-full bg-muted/50 flex items-center justify-center hover:bg-muted text-muted-foreground"
                                    aria-label="Clear date filter"
                                >
                                    <X className="h-3.5 w-3.5" />
                                </button>
                            )}
                        </div>

                        <Select
                            value={actionFilter}
                            onValueChange={(value) => {
                                setActionFilter(value);
                                setCurrentPage(1);
                            }}
                        >
                            <SelectTrigger className="w-full sm:w-[160px] rounded-xl">
                                <SelectValue placeholder="All actions" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">All actions</SelectItem>
                                <SelectItem value="created">Added</SelectItem>
                                <SelectItem value="updated">Edited</SelectItem>
                                <SelectItem value="deleted">Deleted</SelectItem>
                                <SelectItem value="reordered">Reordered</SelectItem>
                            </SelectContent>
                        </Select>

                        <Select
                            value={entityFilter}
                            onValueChange={(value) => {
                                setEntityFilter(value);
                                setCurrentPage(1);
                            }}
                        >
                            <SelectTrigger className="w-full sm:w-[200px] rounded-xl">
                                <SelectValue placeholder="All modules" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">All modules</SelectItem>
                                {entityOptions.map((type) => (
                                    <SelectItem key={type} value={type}>
                                        {ENTITY_LABELS[type] ?? type}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                </div>

                <div className="overflow-hidden rounded-2xl border border-muted-foreground/10 bg-card shadow-sm">
                    <table className="w-full text-sm">
                        <thead className="bg-[#1E293B]/5 text-left text-muted-foreground uppercase tracking-wider text-[11px] font-bold border-b border-muted-foreground/10">
                            <tr>
                                <th className="px-5 py-4">Date & Time</th>
                                <th className="px-5 py-4">User</th>
                                <th className="px-5 py-4">Action</th>
                                <th className="px-5 py-4">Module</th>
                                <th className="px-5 py-4">Record</th>
                                <th className="px-5 py-4 text-center">Details</th>
                            </tr>
                        </thead>
                        <tbody>
                            {paginatedLogs.length === 0 ? (
                                <tr>
                                    <td colSpan={6} className="px-5 py-12 text-center text-muted-foreground">
                                        <div className="flex flex-col items-center gap-3">
                                            <History className="h-8 w-8 opacity-40" />
                                            <p>No audit records found.</p>
                                        </div>
                                    </td>
                                </tr>
                            ) : (
                                paginatedLogs.map((log) => (
                                    <tr
                                        key={log.id}
                                        className="border-b border-muted-foreground/5 hover:bg-muted/30 transition-colors"
                                    >
                                        <td className="px-5 py-4 whitespace-nowrap text-muted-foreground">
                                            {formatDateTime(log.created_at)}
                                        </td>
                                        <td className="px-5 py-4">
                                            <div className="font-semibold">{log.actor_name ?? 'Unknown'}</div>
                                            <div className="text-xs text-muted-foreground">ID: {log.actor_biometric_id}</div>
                                        </td>
                                        <td className="px-5 py-4">
                                            <Badge variant={ACTION_VARIANTS[log.action] ?? 'outline'}>
                                                {ACTION_LABELS[log.action] ?? log.action}
                                            </Badge>
                                        </td>
                                        <td className="px-5 py-4">
                                            {ENTITY_LABELS[log.auditable_type] ?? log.auditable_type}
                                        </td>
                                        <td className="px-5 py-4">
                                            <div className="font-medium">{log.auditable_label ?? '—'}</div>
                                            {log.auditable_id && (
                                                <div className="text-xs text-muted-foreground">ID: {log.auditable_id}</div>
                                            )}
                                        </td>
                                        <td className="px-5 py-4 text-center">
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                className="rounded-lg"
                                                onClick={() => setSelectedLog(log)}
                                            >
                                                <Eye className="h-4 w-4 mr-1" />
                                                View
                                            </Button>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>

                {filteredLogs.length > itemsPerPage && (
                    <Pagination>
                        <PaginationContent>
                            <PaginationItem>
                                <PaginationPrevious
                                    href="#"
                                    onClick={(e) => {
                                        e.preventDefault();
                                        setCurrentPage((page) => Math.max(1, page - 1));
                                    }}
                                    className={currentPage === 1 ? 'pointer-events-none opacity-50' : 'cursor-pointer'}
                                />
                            </PaginationItem>

                            {paginationRange.map((page, index) =>
                                page === 'ellipsis' ? (
                                    <PaginationItem key={`ellipsis-${index}`}>
                                        <PaginationEllipsis />
                                    </PaginationItem>
                                ) : (
                                    <PaginationItem key={page}>
                                        <PaginationLink
                                            href="#"
                                            isActive={currentPage === page}
                                            onClick={(e) => {
                                                e.preventDefault();
                                                setCurrentPage(page);
                                            }}
                                            className="cursor-pointer"
                                        >
                                            {page}
                                        </PaginationLink>
                                    </PaginationItem>
                                ),
                            )}

                            <PaginationItem>
                                <PaginationNext
                                    href="#"
                                    onClick={(e) => {
                                        e.preventDefault();
                                        setCurrentPage((page) => Math.min(totalPages, page + 1));
                                    }}
                                    className={currentPage === totalPages ? 'pointer-events-none opacity-50' : 'cursor-pointer'}
                                />
                            </PaginationItem>
                        </PaginationContent>
                    </Pagination>
                )}
            </div>

            <Dialog open={!!selectedLog} onOpenChange={(open) => !open && setSelectedLog(null)}>
                <DialogContent className="max-w-3xl max-h-[85vh] overflow-y-auto">
                    {selectedLog && (
                        <>
                            <DialogHeader>
                                <DialogTitle>Audit Record Details</DialogTitle>
                                <DialogDescription>
                                    {ACTION_LABELS[selectedLog.action] ?? selectedLog.action}{' '}
                                    {ENTITY_LABELS[selectedLog.auditable_type] ?? selectedLog.auditable_type}
                                    {selectedLog.auditable_label ? `: ${selectedLog.auditable_label}` : ''}
                                </DialogDescription>
                            </DialogHeader>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
                                <div>
                                    <p className="text-muted-foreground text-xs uppercase tracking-wide font-bold mb-1">Performed By</p>
                                    <p className="font-medium">{selectedLog.actor_name ?? 'Unknown'}</p>
                                    <p className="text-muted-foreground">Bio ID: {selectedLog.actor_biometric_id}</p>
                                </div>
                                <div>
                                    <p className="text-muted-foreground text-xs uppercase tracking-wide font-bold mb-1">Timestamp</p>
                                    <p className="font-medium">{formatDateTime(selectedLog.created_at)}</p>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                                <div>
                                    <p className="text-muted-foreground text-xs uppercase tracking-wide font-bold mb-2">Before</p>
                                    <pre className="rounded-xl border bg-muted/40 p-4 text-xs overflow-x-auto whitespace-pre-wrap break-words">
                                        {formatJson(selectedLog.old_values)}
                                    </pre>
                                </div>
                                <div>
                                    <p className="text-muted-foreground text-xs uppercase tracking-wide font-bold mb-2">After</p>
                                    <pre className="rounded-xl border bg-muted/40 p-4 text-xs overflow-x-auto whitespace-pre-wrap break-words">
                                        {formatJson(selectedLog.new_values)}
                                    </pre>
                                </div>
                            </div>

                            {selectedLog.metadata && Object.keys(selectedLog.metadata).length > 0 && (
                                <div>
                                    <p className="text-muted-foreground text-xs uppercase tracking-wide font-bold mb-2">Metadata</p>
                                    <pre className="rounded-xl border bg-muted/40 p-4 text-xs overflow-x-auto whitespace-pre-wrap break-words">
                                        {formatJson(selectedLog.metadata)}
                                    </pre>
                                </div>
                            )}
                        </>
                    )}
                </DialogContent>
            </Dialog>
        </>
    );
}
