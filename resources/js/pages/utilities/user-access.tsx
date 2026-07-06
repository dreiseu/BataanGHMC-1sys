import { Head, router, usePage } from '@inertiajs/react';
import { useState, useMemo, useRef, useEffect } from 'react';
import {
    Users,
    Search,
    ShieldCheck,
    CheckCircle2,
    Settings,
    Building2,
    Check,
    ChevronsUpDown,
    X,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Checkbox } from '@/components/ui/checkbox';
import { Card } from '@/components/ui/card';
import LineWaves from '@/components/ui/linewaves';
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
    Popover,
    PopoverContent,
    PopoverTrigger,
} from '@/components/ui/popover';
import { cn } from '@/lib/utils';

const DEFAULT_SYSTEMS = [
    'DiCe',
    'EFMS Job Order Request System',
    "Employee's Portal",
    'Health & Wellness Clinic',
    'Parking Management System',
    'PGS Online System'
];

// Reusable combobox filter component — search is inline in the trigger input
function FilterCombobox({
    label,
    options,
    value,
    onChange,
}: {
    label: string;
    options: string[];
    value: string;
    onChange: (val: string) => void;
}) {
    const [open, setOpen] = useState(false);
    const [search, setSearch] = useState('');
    const inputRef = useRef<HTMLInputElement>(null);

    // Auto-focus the input whenever the popover opens
    useEffect(() => {
        if (open) {
            // Small timeout so Radix finishes rendering the popover before focusing
            const t = setTimeout(() => inputRef.current?.focus(), 10);
            return () => clearTimeout(t);
        }
    }, [open]);

    const filteredOptions = options.filter((opt) =>
        opt.toLowerCase().includes(search.toLowerCase())
    );

    const handleSelect = (opt: string) => {
        onChange(opt === value ? 'All' : opt);
        setSearch('');
        setOpen(false);
    };

    const handleClear = (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();
        onChange('All');
        setSearch('');
        setOpen(false);
    };

    return (
        <Popover open={open} onOpenChange={(o) => { setOpen(o); if (!o) setSearch(''); }}>
            <div className="relative w-full">
                <PopoverTrigger asChild>
                    <div
                        className={cn(
                            'flex items-center h-10 w-full rounded-xl border bg-white shadow-sm px-3 text-sm cursor-pointer transition-all',
                            open && 'ring-2 ring-[#1E293B]/20 border-[#1E293B]/40',
                            value !== 'All' && 'border-[#1E293B]/40'
                        )}
                        onClick={() => setOpen(true)}
                    >
                        <input
                            ref={inputRef}
                            className="flex-1 bg-transparent outline-none text-sm placeholder:text-muted-foreground cursor-pointer"
                            placeholder={value !== 'All' ? value : `All ${label}s`}
                            value={search}
                            onChange={(e) => {
                                setSearch(e.target.value);
                                if (!open) setOpen(true);
                            }}
                            onFocus={() => setOpen(true)}
                            onClick={(e) => e.stopPropagation()}
                            readOnly={!open}
                        />
                        {value !== 'All' ? (
                            <button
                                type="button"
                                className="ml-1 shrink-0 rounded-sm p-0.5 text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
                                onMouseDown={handleClear}
                            >
                                <X className="h-3.5 w-3.5" />
                            </button>
                        ) : (
                            <ChevronsUpDown className="ml-1 h-4 w-4 shrink-0 text-muted-foreground opacity-50" />
                        )}
                    </div>
                </PopoverTrigger>
            </div>
            <PopoverContent className="w-[300px] p-1 rounded-2xl" align="start">
                <div className="max-h-[260px] overflow-y-auto">
                    {filteredOptions.length === 0 ? (
                        <p className="py-6 text-center text-sm text-muted-foreground">No {label.toLowerCase()} found.</p>
                    ) : (
                        filteredOptions.map((opt) => (
                            <button
                                key={opt}
                                type="button"
                                className={cn(
                                    'flex items-center gap-2 w-full rounded-xl px-3 py-2 text-sm text-left transition-colors hover:bg-muted',
                                    value === opt && 'bg-[#1E293B]/5 font-medium text-[#1E293B]'
                                )}
                                onClick={() => handleSelect(opt)}
                            >
                                <Check className={cn('h-4 w-4 shrink-0', value === opt ? 'opacity-100' : 'opacity-0')} />
                                {opt}
                            </button>
                        ))
                    )}
                </div>
            </PopoverContent>
        </Popover>
    );
}


export default function UserAccess() {
    const { users, systems } = usePage<any>().props;

    const [searchQuery, setSearchQuery] = useState('');
    const [filterDivision, setFilterDivision] = useState('All');
    const [filterSection, setFilterSection] = useState('All');
    const [filterPosition, setFilterPosition] = useState('All');
    const [filterStatus, setFilterStatus] = useState('All');

    const [page, setPage] = useState(1);
    const itemsPerPage = 15;

    const [selectedUser, setSelectedUser] = useState<any>(null);
    const [isManageOpen, setIsManageOpen] = useState(false);
    const [selectedSystems, setSelectedSystems] = useState<number[]>([]);
    const [isSaving, setIsSaving] = useState(false);

    // Derive unique filter options (exclude 'N/A' from filter lists)
    const divisions = useMemo(() => [...new Set((users || []).map((u: any) => u.DivisionName).filter((v: string) => v && v !== 'N/A'))].sort() as string[], [users]);
    const sections = useMemo(() => [...new Set((users || []).map((u: any) => u.SectionName).filter((v: string) => v && v !== 'N/A'))].sort() as string[], [users]);
    const positions = useMemo(() => [...new Set((users || []).map((u: any) => u.PositionName).filter((v: string) => v && v !== 'N/A'))].sort() as string[], [users]);
    const statuses = useMemo(() => [...new Set((users || []).map((u: any) => u.EmploymentStatus).filter((v: string) => v && v !== 'N/A'))].sort() as string[], [users]);

    const hasActiveFilters = filterDivision !== 'All' || filterSection !== 'All' || filterPosition !== 'All' || filterStatus !== 'All';

    const filteredUsers = useMemo(() => {
        setPage(1);
        return (users || []).filter((user: any) => {
            const search = searchQuery.toLowerCase();
            const matchesSearch = (
                (user.FullName || '').toLowerCase().includes(search) ||
                (user.BiometricID || '').toLowerCase().includes(search) ||
                (user.PositionName || '').toLowerCase().includes(search) ||
                (user.SectionName || '').toLowerCase().includes(search)
            );
            const matchesDivision = filterDivision === 'All' || user.DivisionName === filterDivision;
            const matchesSection = filterSection === 'All' || user.SectionName === filterSection;
            const matchesPosition = filterPosition === 'All' || user.PositionName === filterPosition;
            const matchesStatus = filterStatus === 'All' || user.EmploymentStatus === filterStatus;
            return matchesSearch && matchesDivision && matchesSection && matchesPosition && matchesStatus;
        });
    }, [users, searchQuery, filterDivision, filterSection, filterPosition, filterStatus]);

    const totalPages = Math.ceil(filteredUsers.length / itemsPerPage);
    const paginatedUsers = filteredUsers.slice((page - 1) * itemsPerPage, page * itemsPerPage);

    const paginationRange = useMemo(() => {
        if (totalPages <= 4) return Array.from({ length: totalPages }, (_, i) => i + 1);
        let start = Math.max(1, page - 1);
        let end = Math.min(totalPages, start + 2);
        if (end - start < 2) start = Math.max(1, end - 2);
        const pages: (number | 'ellipsis')[] = [];
        for (let i = start; i <= end; i++) pages.push(i);
        if (end < totalPages) {
            if (end < totalPages - 1) pages.push('ellipsis');
            pages.push(totalPages);
        }
        return pages;
    }, [page, totalPages]);

    const handleManageClick = (user: any) => {
        setSelectedUser(user);
        const assignedIds = (user.permissions || [])
            .filter((p: string) => p.startsWith('system:'))
            .map((p: string) => parseInt(p.split(':')[1], 10))
            .filter((id: number) => !isNaN(id));
        setSelectedSystems(assignedIds);
        setIsManageOpen(true);
    };

    const toggleSystem = (systemId: number) => {
        setSelectedSystems((prev) =>
            prev.includes(systemId) ? prev.filter(id => id !== systemId) : [...prev, systemId]
        );
    };

    const saveAccess = () => {
        if (!selectedUser) return;
        setIsSaving(true);
        router.put(`/utilities/user-access/${selectedUser.BiometricID}`, {
            systems: selectedSystems,
        }, {
            preserveScroll: true,
            onSuccess: () => { setIsManageOpen(false); setIsSaving(false); },
            onError: () => { setIsSaving(false); }
        });
    };

    return (
        <>
            <Head title="User Access Management" />

            <div className="flex flex-col gap-6 p-6 mt-6 mx-auto w-full max-w-7xl">
                {/* Hero Header */}
                <Card className="relative overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-br from-[#1E293B] to-[#0F172A] shadow-lg">
                    <div className="absolute inset-0 z-0"><LineWaves /></div>
                    <div className="absolute top-0 right-0 -mt-16 -mr-16 h-64 w-64 rounded-full bg-[#00D4FF] opacity-20 blur-3xl mix-blend-screen pointer-events-none"></div>
                    <div className="absolute bottom-0 left-0 -mb-16 -ml-16 h-64 w-64 rounded-full bg-[#1E293B] opacity-40 blur-3xl mix-blend-screen pointer-events-none"></div>
                    <div className="p-6 md:p-8 relative z-10">
                        <div className="flex items-center gap-5">
                            <div className="h-20 w-20 bg-white/10 backdrop-blur-md shadow-sm border border-white/20 flex items-center justify-center shrink-0 rounded-2xl">
                                <ShieldCheck className="h-10 w-10 text-[#00D4FF]" />
                            </div>
                            <div className="space-y-1">
                                <p className="text-sm font-bold tracking-widest text-[#00D4FF] uppercase flex items-center gap-2">
                                    <Building2 className="h-4 w-4" />
                                    Bataan General Hospital and Medical Center
                                </p>
                                <h1 className="text-3xl md:text-4xl font-black tracking-tight text-white">
                                    User <span className="text-[#00D4FF]">Access Management</span>
                                </h1>
                                <p className="text-white/80 font-medium">
                                    Assign or restrict access to hospital systems for individual users.
                                </p>
                            </div>
                        </div>
                    </div>
                </Card>

                {/* Users Table */}
                <div className="rounded-3xl border bg-card shadow-sm overflow-hidden flex flex-col min-h-[500px]">
                    <div className="p-6 border-b bg-muted/20 flex flex-col gap-4">
                        {/* Search + Count */}
                        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                            <div className="relative w-full sm:max-w-md">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                <Input
                                    placeholder="Search by name, biometric ID, or position..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    className="pl-9 rounded-xl bg-white focus-visible:ring-[#1E293B]/30 w-full shadow-sm"
                                />
                            </div>
                            <div className="flex items-center gap-2">
                                {hasActiveFilters && (
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        className="h-9 rounded-xl text-xs text-muted-foreground hover:text-foreground"
                                        onClick={() => {
                                            setFilterDivision('All');
                                            setFilterSection('All');
                                            setFilterPosition('All');
                                            setFilterStatus('All');
                                        }}
                                    >
                                        <X className="h-3 w-3 mr-1" /> Clear filters
                                    </Button>
                                )}
                                <div className="text-sm font-medium text-muted-foreground whitespace-nowrap bg-white px-4 py-2 rounded-xl shadow-sm border">
                                    Showing <span className="text-foreground font-bold">{filteredUsers.length}</span> users
                                </div>
                            </div>
                        </div>

                        {/* Combobox Filters */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                            <div className="space-y-1.5">
                                <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider px-1">Division</label>
                                <FilterCombobox label="Division" options={divisions} value={filterDivision} onChange={setFilterDivision} />
                            </div>
                            <div className="space-y-1.5">
                                <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider px-1">Section</label>
                                <FilterCombobox label="Section" options={sections} value={filterSection} onChange={setFilterSection} />
                            </div>
                            <div className="space-y-1.5">
                                <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider px-1">Position</label>
                                <FilterCombobox label="Position" options={positions} value={filterPosition} onChange={setFilterPosition} />
                            </div>
                            <div className="space-y-1.5">
                                <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider px-1">Employment Status</label>
                                <FilterCombobox label="Status" options={statuses} value={filterStatus} onChange={setFilterStatus} />
                            </div>
                        </div>
                    </div>

                    {/* Table */}
                    <div className="flex-1 overflow-x-auto">
                        <table className="w-full text-left text-sm whitespace-nowrap">
                            <thead className="bg-muted/50 border-b">
                                <tr>
                                    <th className="px-6 py-4 font-semibold text-muted-foreground w-24">Bio ID</th>
                                    <th className="px-6 py-4 font-semibold text-muted-foreground">Full Name</th>
                                    <th className="px-6 py-4 font-semibold text-muted-foreground">Position & Section</th>
                                    <th className="px-6 py-4 font-semibold text-muted-foreground">Employment Status</th>
                                    <th className="px-6 py-4 font-semibold text-muted-foreground text-right w-32">Action</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-border">
                                {paginatedUsers.length > 0 ? (
                                    paginatedUsers.map((user: any) => (
                                        <tr key={user.BiometricID} className="group hover:bg-[#1E293B]/5 transition-colors h-[64px]">
                                            <td className="px-6 py-2">
                                                <span className="inline-flex items-center rounded-md bg-[#1E293B]/10 px-2 py-1 text-xs font-bold text-[#1E293B] ring-1 ring-inset ring-[#1E293B]/20">
                                                    {user.BiometricID}
                                                </span>
                                            </td>
                                            <td className="px-6 py-2">
                                                <div className="font-bold text-foreground group-hover:text-[#1E293B] transition-colors">
                                                    {user.FullName || 'N/A'}
                                                </div>
                                                {user.DivisionName && user.DivisionName !== 'N/A' && (
                                                    <div className="text-xs text-muted-foreground">{user.DivisionName}</div>
                                                )}
                                            </td>
                                            <td className="px-6 py-2">
                                                <div className="flex flex-col">
                                                    <span className="text-foreground font-medium">{user.PositionName || 'No Position'}</span>
                                                    <span className="text-xs text-muted-foreground">{user.SectionName || 'No Section'}</span>
                                                </div>
                                            </td>
                                            <td className="px-6 py-2">
                                                <span className="inline-flex items-center rounded-md bg-green-50 px-2 py-1 text-xs font-medium text-green-700 ring-1 ring-inset ring-green-600/20">
                                                    {user.EmploymentStatus || 'Unknown'}
                                                </span>
                                            </td>
                                            <td className="px-6 py-2 text-right">
                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                    onClick={() => handleManageClick(user)}
                                                    className="rounded-lg h-8 border-[#1E293B]/20 hover:bg-[#1E293B] hover:text-white transition-all cursor-pointer shadow-sm"
                                                >
                                                    <Settings className="h-3.5 w-3.5 mr-1.5" />
                                                    Manage
                                                </Button>
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan={5} className="px-6 py-16 text-center text-muted-foreground">
                                            <div className="flex flex-col items-center justify-center gap-3">
                                                <div className="h-12 w-12 rounded-full bg-muted flex items-center justify-center">
                                                    <Users className="h-6 w-6 text-muted-foreground/50" />
                                                </div>
                                                <div>
                                                    <p className="font-medium text-foreground">No users found</p>
                                                    <p className="text-sm">Try adjusting your filters or search query.</p>
                                                </div>
                                            </div>
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>

                    {/* Pagination */}
                    {totalPages > 1 && (
                        <div className="flex items-center justify-between border-t bg-muted/20 px-6 py-3">
                            <div className="text-sm text-muted-foreground">
                                Page <span className="font-bold text-foreground">{page}</span> of <span className="font-bold text-foreground">{totalPages}</span>
                            </div>
                            <Pagination className="justify-end w-auto mx-0">
                                <PaginationContent>
                                    <PaginationItem>
                                        <PaginationPrevious
                                            onClick={() => setPage(p => Math.max(1, p - 1))}
                                            className={page === 1 ? 'pointer-events-none opacity-50' : 'cursor-pointer'}
                                        />
                                    </PaginationItem>
                                    {paginationRange.map((item, index) => (
                                        <PaginationItem key={index}>
                                            {item === 'ellipsis' ? (
                                                <PaginationEllipsis />
                                            ) : (
                                                <PaginationLink
                                                    onClick={() => setPage(item as number)}
                                                    isActive={page === item}
                                                    className="cursor-pointer"
                                                >
                                                    {item}
                                                </PaginationLink>
                                            )}
                                        </PaginationItem>
                                    ))}
                                    <PaginationItem>
                                        <PaginationNext
                                            onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                                            className={page === totalPages ? 'pointer-events-none opacity-50' : 'cursor-pointer'}
                                        />
                                    </PaginationItem>
                                </PaginationContent>
                            </Pagination>
                        </div>
                    )}
                </div>
            </div>

            {/* Manage Access Modal */}
            <Dialog open={isManageOpen} onOpenChange={setIsManageOpen}>
                <DialogContent className="sm:max-w-[700px] rounded-3xl p-0 overflow-hidden border-0 flex flex-col max-h-[90vh]">
                    <div className="bg-gradient-to-br from-[#1E293B] to-[#0F172A] p-6 text-white relative shrink-0">
                        <div className="absolute top-0 right-0 -mt-10 -mr-10 h-40 w-40 rounded-full bg-[#00D4FF] opacity-10 blur-3xl pointer-events-none"></div>
                        <DialogHeader>
                            <DialogTitle className="text-xl font-bold flex items-center gap-2 text-white">
                                <ShieldCheck className="h-5 w-5 text-[#00D4FF]" />
                                Edit System Access
                            </DialogTitle>
                            <DialogDescription className="text-white/80 mt-1">
                                Select which hospital systems <strong className="text-white">{selectedUser?.FullName}</strong> can access.
                            </DialogDescription>
                        </DialogHeader>
                    </div>

                    <div className="p-6 overflow-y-auto flex-1 emr-scrollbar">
                        <div className="grid gap-3 sm:grid-cols-2">
                            {systems && systems.map((system: any) => {
                                const isDefault = DEFAULT_SYSTEMS.includes(system.name);
                                const isChecked = isDefault || selectedSystems.includes(system.id);
                                return (
                                    <div
                                        key={system.id}
                                        className={`flex items-start gap-3 rounded-2xl border p-4 transition-all ${isChecked && !isDefault ? 'border-[#00D4FF] bg-[#00D4FF]/5 shadow-sm' : isDefault ? 'border-emerald-500/30 bg-emerald-500/5' : 'bg-card hover:bg-muted/30'}`}
                                        onClick={() => !isDefault && toggleSystem(system.id)}
                                    >
                                        <Checkbox
                                            checked={isChecked}
                                            disabled={isDefault}
                                            onCheckedChange={() => !isDefault && toggleSystem(system.id)}
                                            className={`mt-0.5 rounded ${isDefault ? 'opacity-50 data-[state=checked]:bg-emerald-500 data-[state=checked]:border-emerald-500' : 'data-[state=checked]:bg-[#00D4FF] data-[state=checked]:border-[#00D4FF]'}`}
                                        />
                                        <div className="grid gap-1 flex-1 cursor-pointer">
                                            <div className="flex items-center gap-2">
                                                <p className={`text-sm font-bold leading-none ${isChecked && !isDefault ? 'text-foreground' : isDefault ? 'text-emerald-700 dark:text-emerald-400' : 'text-foreground/80'}`}>
                                                    {system.name}
                                                </p>
                                                {isDefault && (
                                                    <span className="text-[9px] font-bold uppercase tracking-widest text-emerald-600 bg-emerald-500/10 px-1.5 py-0.5 rounded">Default</span>
                                                )}
                                            </div>
                                            <p className="text-xs text-muted-foreground line-clamp-1">{system.url}</p>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>

                    <DialogFooter className="px-6 py-4 bg-muted/30 border-t shrink-0">
                        <Button variant="ghost" onClick={() => setIsManageOpen(false)} className="rounded-xl font-semibold cursor-pointer">
                            Cancel
                        </Button>
                        <Button
                            onClick={saveAccess}
                            disabled={isSaving}
                            className="rounded-xl bg-[#1E293B] hover:bg-[#00D4FF] text-white font-semibold shadow-sm transition-all cursor-pointer flex items-center gap-2"
                        >
                            {isSaving ? 'Saving...' : (<><CheckCircle2 className="h-4 w-4" />Save Access Control</>)}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </>
    );
}
