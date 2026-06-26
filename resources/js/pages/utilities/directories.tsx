import LineWaves from '@/components/ui/linewaves';
import { Head, router, usePage } from '@inertiajs/react';
import { Search, Copy } from 'lucide-react';
import { useMemo, useState } from 'react';
import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { toast } from 'sonner';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import {
    Pagination,
    PaginationContent,
    PaginationEllipsis,
    PaginationItem,
    PaginationLink,
    PaginationNext,
    PaginationPrevious,
} from '@/components/ui/pagination';

type DirectoryEntry = {
    id: number;
    department: string;
    local_no: string;
    section: string;
    is_active: boolean;
    sort_order: number;
};

type Props = {
    entries: DirectoryEntry[];
};

export default function UtilitiesDirectories({ entries }: Props) {
    const [showAddForm, setShowAddForm] = useState(false);
    const [form, setForm] = useState({
        department: '',
        local_no: '',
        section: '',
        sort_order: 0,
    });

    const [editingEntry, setEditingEntry] = useState<DirectoryEntry | null>(null);

    function openEditDialog(entry: DirectoryEntry) {
        setEditingEntry(entry);
        setForm({
            department: entry.department,
            local_no: entry.local_no,
            section: entry.section,
            sort_order: entry.sort_order,
        });
        setShowAddForm(true);
    }

    function resetDialog() {
        setEditingEntry(null);
        setErrors({});
        setForm({
            department: '',
            local_no: '',
            section: 'BataanGHMC',
            sort_order: 0,
        });
    }

    const [entryToDelete, setEntryToDelete] = useState<DirectoryEntry | null>(null);
    const [search, setSearch] = useState('');
    const [sectionFilter, setSectionFilter] = useState('all');
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 10;

    const filteredDirectory = useMemo(() => {
        const keyword = search.toLowerCase().trim();
        if (!keyword) return entries;
        return entries.filter((item) => {
            const matchesSearch =
                item.department.toLowerCase().includes(keyword) ||
                item.local_no.includes(keyword) ||
                item.section.toLowerCase().includes(keyword);
            const matchesSection =
                sectionFilter === 'all' || item.section === sectionFilter;
            return matchesSearch && matchesSection;
        });
    }, [search, sectionFilter, entries]);

    const totalPages = Math.ceil(filteredDirectory.length / itemsPerPage);
    const paginatedDirectory = useMemo(() => {
        const start = (currentPage - 1) * itemsPerPage;
        return filteredDirectory.slice(start, start + itemsPerPage);
    }, [filteredDirectory, currentPage]);

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

    const [errors, setErrors] = useState<Record<string, string>>({});
    const [isSaving, setIsSaving] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);

    return (
        <>
            <Head title="Manage Directories" />

            <div className="p-6 mx-auto w-full max-w-7xl space-y-8">
                {/* Hero Banner */}
                <section className="relative overflow-hidden rounded-3xl border border-[#00D4FF]/20 bg-gradient-to-br from-[#0F172A] via-[#1E293B] to-[#0F172A] p-8 sm:p-10 shadow-lg min-h-[180px] flex flex-col justify-center group">
                    <div className="absolute inset-0 z-0 opacity-30 mix-blend-screen">
                        <LineWaves />
                    </div>

                    {/* Glowing Orbs */}
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
                            Manage Directories
                        </h1>
                        <p className="mt-3 text-base sm:text-lg text-slate-300 leading-relaxed font-medium max-w-2xl">
                            Add, edit, or remove hospital directory entries. Maintain accurate local numbers and trunk lines for internal and external hospital communication.
                        </p>
                    </div>
                </section>
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
                    <div className="flex items-center gap-3 flex-1">
                        <div className="relative flex-1 max-w-sm group">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground transition-colors group-focus-within:text-[#00D4FF]" />
                            <Input
                                value={search}
                                onChange={(e) => {
                                    setSearch(e.target.value);
                                    setCurrentPage(1);
                                }}
                                placeholder="Search entries..."
                                className="pl-10 border-muted-foreground/20 focus-visible:ring-[#00D4FF]/30 transition-all shadow-sm rounded-xl"
                            />
                        </div>
                        <Select 
                            value={sectionFilter} 
                            onValueChange={(value) => {
                                setSectionFilter(value);
                                setCurrentPage(1);
                            }}
                        >
                            <SelectTrigger className="w-[180px] rounded-xl border-muted-foreground/20 shadow-sm focus:ring-[#00D4FF]/30 !bg-background cursor-pointer">
                                <SelectValue placeholder="Filter by Section" />
                            </SelectTrigger>
                            <SelectContent className="rounded-xl">
                                <SelectItem value="all" className="cursor-pointer">All Sections</SelectItem>
                                <SelectItem value="BataanGHMC" className="cursor-pointer">BataanGHMC</SelectItem>
                                <SelectItem value="BUCAS" className="cursor-pointer">BUCAS</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    <Button
                        onClick={() => setShowAddForm(true)}
                        className="cursor-pointer bg-[#1E293B] hover:bg-[#00D4FF] hover:shadow-[0_0_20px_rgba(0,212,255,0.4)] hover:-translate-y-0.5 text-white font-semibold rounded-xl shadow-md shadow-[#00D4FF]/20 transition-all hover:scale-[1.02] active:scale-95"
                    >
                        Add Entry
                    </Button>
                </div>

                <div className="overflow-hidden rounded-2xl border border-muted-foreground/10 bg-card shadow-sm">
                    <table className="w-full text-sm">
                        <thead className="bg-[#1E293B]/5 text-left text-muted-foreground uppercase tracking-wider text-[11px] font-bold border-b border-muted-foreground/10">
                            <tr>
                                <th className="px-5 py-4">Department / Ward / Office</th>
                                <th className="px-5 py-4 text-center">Local No.</th>
                                <th className="px-5 py-4 text-center">Section</th>
                                <th className="px-5 py-4 text-center">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {paginatedDirectory.map((item, index) => (
                                <tr key={`${item.id}-${index}`} className="border-t border-muted-foreground/5 transition-colors hover:bg-muted/30">
                                    <td className="px-5 py-4 font-semibold text-foreground">{item.department}</td>
                                    <td className="px-5 py-4 text-center">
                                        <button
                                            onClick={() => {
                                                navigator.clipboard.writeText(item.local_no);
                                                toast.success('Local number copied.');
                                            }}
                                            className="group inline-flex items-center justify-center gap-1.5 hover:text-[#00D4FF] transition-colors rounded-lg px-3 py-1.5 hover:bg-[#00D4FF]/10"
                                        >
                                            <span className="font-medium tracking-wide">{item.local_no}</span>
                                            <Copy className="h-3.5 w-3.5 opacity-0 group-hover:opacity-100 transition-opacity" />
                                        </button>
                                    </td>
                                    <td className="px-5 py-4 text-center">
                                        <span className="inline-flex items-center rounded-full bg-muted px-2.5 py-0.5 text-xs font-semibold text-muted-foreground">
                                            {item.section}
                                        </span>
                                    </td>
                                    <td className="px-5 py-4 text-center">
                                        <div className="flex justify-center gap-2">
                                            <button
                                                onClick={() => openEditDialog(item)}
                                                className="cursor-pointer rounded-lg border border-muted-foreground/20 px-3 py-1.5 text-xs font-semibold hover:bg-muted transition-colors"
                                            >
                                                Edit
                                            </button>
                                            <button
                                                onClick={() => setEntryToDelete(item)}
                                                className="cursor-pointer rounded-lg border border-destructive/30 px-3 py-1.5 text-xs font-semibold text-destructive hover:bg-destructive hover:text-destructive-foreground transition-colors"
                                            >
                                                Delete
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                            {filteredDirectory.length === 0 && (
                                <tr>
                                    <td colSpan={4} className="px-4 py-8 text-center text-muted-foreground">
                                        No directory records found.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                    
                    {totalPages > 1 && (
                        <div className="flex flex-col sm:flex-row items-center justify-between px-5 py-4 border-t border-muted-foreground/10 gap-4">
                            <span className="text-sm text-muted-foreground font-medium">
                                Showing {(currentPage - 1) * itemsPerPage + 1} to {Math.min(currentPage * itemsPerPage, filteredDirectory.length)} of {filteredDirectory.length} records
                            </span>
                            <Pagination className="justify-end w-auto mx-0">
                                <PaginationContent>
                                    <PaginationItem>
                                        <PaginationPrevious 
                                            href="#" 
                                            onClick={(e) => { e.preventDefault(); setCurrentPage(prev => Math.max(prev - 1, 1)); }} 
                                            className={currentPage === 1 ? 'pointer-events-none opacity-50' : 'cursor-pointer'} 
                                        />
                                    </PaginationItem>
                                    
                                    {paginationRange.map((item, index) => (
                                        <PaginationItem key={index}>
                                            {item === 'ellipsis' ? (
                                                <PaginationEllipsis />
                                            ) : (
                                                <PaginationLink
                                                    href="#"
                                                    isActive={currentPage === item}
                                                    onClick={(e) => { e.preventDefault(); setCurrentPage(item as number); }}
                                                >
                                                    {item}
                                                </PaginationLink>
                                            )}
                                        </PaginationItem>
                                    ))}

                                    <PaginationItem>
                                        <PaginationNext 
                                            href="#" 
                                            onClick={(e) => { e.preventDefault(); setCurrentPage(prev => Math.min(prev + 1, totalPages)); }} 
                                            className={currentPage === totalPages ? 'pointer-events-none opacity-50' : 'cursor-pointer'} 
                                        />
                                    </PaginationItem>
                                </PaginationContent>
                            </Pagination>
                        </div>
                    )}
                </div>
            </div>

            <Dialog open={showAddForm} onOpenChange={(open) => { setShowAddForm(open); if (!open) resetDialog(); }}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>{editingEntry ? 'Edit Directory Entry' : 'Add Directory Entry'}</DialogTitle>
                        <DialogDescription>Manage the directory listing details.</DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4 py-2">
                        <div className="grid gap-2">
                            <label className="text-sm font-medium">Department / Ward / Office</label>
                            <Input value={form.department} onChange={(e) => setForm({ ...form, department: e.target.value })} />
                            {errors.department && <p className="text-sm text-destructive">{errors.department}</p>}
                        </div>
                        <div className="grid gap-2">
                            <label className="text-sm font-medium">Local No.</label>
                            <Input value={form.local_no} onChange={(e) => setForm({ ...form, local_no: e.target.value })} />
                            {errors.local_no && <p className="text-sm text-destructive">{errors.local_no}</p>}
                        </div>
                        <div className="grid gap-2">
                            <label className="text-sm font-medium">Section</label>
                            <Select value={form.section} onValueChange={(value) => setForm({ ...form, section: value })}>
                                <SelectTrigger><SelectValue placeholder="Select section" /></SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="BataanGHMC">BataanGHMC</SelectItem>
                                    <SelectItem value="BUCAS">BUCAS</SelectItem>
                                </SelectContent>
                            </Select>
                            {errors.section && <p className="text-sm text-destructive">{errors.section}</p>}
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setShowAddForm(false)}>Cancel</Button>
                        <Button
                            className="bg-[#00D4FF] hover:bg-[#00D4FF]/80 text-[#0F172A]"
                            onClick={() => {
                                setIsSaving(true);
                                if (editingEntry) {
                                    router.put(`/directory/${editingEntry.id}`, form, {
                                        onSuccess: () => { toast.success('Updated successfully.'); resetDialog(); setShowAddForm(false); },
                                        onError: (err) => { setErrors(err); toast.error('Failed to update.'); },
                                        onFinish: () => setIsSaving(false),
                                    });
                                } else {
                                    router.post('/directory', form, {
                                        onSuccess: () => { toast.success('Added successfully.'); resetDialog(); setShowAddForm(false); },
                                        onError: (err) => { setErrors(err); toast.error('Failed to add.'); },
                                        onFinish: () => setIsSaving(false),
                                    });
                                }
                            }}
                        >
                            {isSaving ? 'Saving...' : 'Save'}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            <AlertDialog open={!!entryToDelete} onOpenChange={(open) => { if (!open) setEntryToDelete(null); }}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Delete Directory Entry?</AlertDialogTitle>
                        <AlertDialogDescription>
                            This will permanently delete <strong>{entryToDelete?.department}</strong>. This action cannot be undone.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                            disabled={isDeleting}
                            className="bg-destructive text-destructive-foreground"
                            onClick={() => {
                                if (!entryToDelete) return;
                                setIsDeleting(true);
                                router.delete(`/directory/${entryToDelete.id}`, {
                                    onSuccess: () => { toast.success('Deleted successfully.'); setEntryToDelete(null); },
                                    onError: () => toast.error('Failed to delete.'),
                                    onFinish: () => setIsDeleting(false),
                                });
                            }}
                        >
                            {isDeleting ? 'Deleting...' : 'Delete'}
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </>
    );
}
