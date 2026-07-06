import LineWaves from '@/components/ui/linewaves';
import { Head, router } from '@inertiajs/react';
import { Search } from 'lucide-react';
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

type ImissRequestType = {
    id: number;
    value: string;
    label: string;
    description: string | null;
    is_active: boolean;
};

type Props = {
    requestTypes: ImissRequestType[];
};

export default function UtilitiesImissRequestTypes({ requestTypes }: Props) {
    const [showAddForm, setShowAddForm] = useState(false);
    const [form, setForm] = useState({
        value: '',
        label: '',
        description: '',
        is_active: true,
    });

    const [editingType, setEditingType] = useState<ImissRequestType | null>(null);

    function openEditDialog(type: ImissRequestType) {
        setEditingType(type);
        setForm({
            value: type.value,
            label: type.label,
            description: type.description || '',
            is_active: type.is_active,
        });
        setShowAddForm(true);
    }

    function resetDialog() {
        setEditingType(null);
        setErrors({});
        setForm({
            value: '',
            label: '',
            description: '',
            is_active: true,
        });
    }

    const [typeToDelete, setTypeToDelete] = useState<ImissRequestType | null>(null);
    const [search, setSearch] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 10;

    const filteredTypes = useMemo(() => {
        const keyword = search.toLowerCase().trim();
        if (!keyword) return requestTypes;
        return requestTypes.filter((item) => {
            return (
                item.value.toLowerCase().includes(keyword) ||
                item.label.toLowerCase().includes(keyword)
            );
        });
    }, [search, requestTypes]);

    const paginatedTypes = useMemo(() => {
        const start = (currentPage - 1) * itemsPerPage;
        return filteredTypes.slice(start, start + itemsPerPage);
    }, [filteredTypes, currentPage]);

    const totalPages = Math.ceil(filteredTypes.length / itemsPerPage);

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
            <Head title="Manage IMISS Request Types" />

            <div className="p-6 mt-6 mx-auto w-full max-w-7xl space-y-8">
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
                            Manage Request Types
                        </h1>
                        <p className="mt-3 text-base sm:text-lg text-slate-300 leading-relaxed font-medium max-w-2xl">
                            Configure, edit, or remove the categories available when users submit new Job Order Requests.
                        </p>
                    </div>
                </section>

                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
                    <div className="relative flex-1 max-w-sm group">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground transition-colors group-focus-within:text-[#00D4FF]" />
                        <Input
                            value={search}
                            onChange={(e) => {
                                setSearch(e.target.value);
                                setCurrentPage(1);
                            }}
                            placeholder="Search types..."
                            className="pl-10 border-muted-foreground/20 focus-visible:ring-[#00D4FF]/30 transition-all shadow-sm rounded-xl"
                        />
                    </div>

                    <Button
                        onClick={() => { resetDialog(); setShowAddForm(true); }}
                        className="cursor-pointer bg-[#1E293B] hover:bg-[#00D4FF] hover:shadow-[0_0_20px_rgba(0,212,255,0.4)] hover:-translate-y-0.5 text-white font-semibold rounded-xl shadow-md shadow-[#00D4FF]/20 transition-all hover:scale-[1.02] active:scale-95"
                    >
                        Add Request Type
                    </Button>
                </div>

                <div className="overflow-hidden rounded-2xl border border-muted-foreground/10 bg-card shadow-sm">
                    <table className="w-full text-sm">
                        <thead className="bg-[#1E293B]/5 text-left text-muted-foreground uppercase tracking-wider text-[11px] font-bold border-b border-muted-foreground/10">
                            <tr>
                                <th className="px-5 py-4">Value / Key</th>
                                <th className="px-5 py-4">Label</th>
                                <th className="px-5 py-4 text-center">Status</th>
                                <th className="px-5 py-4 text-center">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {paginatedTypes.map((item, index) => (
                                <tr key={`${item.id}-${index}`} className="border-t border-muted-foreground/5 transition-colors hover:bg-muted/30">
                                    <td className="px-5 py-4 font-mono text-xs text-muted-foreground">{item.value}</td>
                                    <td className="px-5 py-4 font-semibold text-foreground">{item.label}</td>
                                    <td className="px-5 py-4 text-center">
                                        <span className={`px-2 py-1 rounded text-[10px] font-bold uppercase tracking-wider ${item.is_active ? 'bg-green-500/10 text-green-600' : 'bg-destructive/10 text-destructive'}`}>
                                            {item.is_active ? 'Active' : 'Inactive'}
                                        </span>
                                    </td>
                                    <td className="px-5 py-4 text-center">
                                        <div className="flex justify-center gap-2">
                                            <button
                                                onClick={() => openEditDialog(item)}
                                                className="rounded-lg border border-muted-foreground/20 px-3 py-1.5 text-xs font-semibold hover:bg-muted transition-colors"
                                            >
                                                Edit
                                            </button>
                                            <button
                                                onClick={() => setTypeToDelete(item)}
                                                className="rounded-lg border border-destructive/30 px-3 py-1.5 text-xs font-semibold text-destructive hover:bg-destructive hover:text-destructive-foreground transition-colors"
                                            >
                                                Delete
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                            {filteredTypes.length === 0 && (
                                <tr>
                                    <td colSpan={4} className="px-4 py-8 text-center text-muted-foreground">
                                        No request types found.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>

                    {totalPages > 1 && (
                        <div className="flex flex-col sm:flex-row items-center justify-between px-5 py-4 border-t border-muted-foreground/10 gap-4">
                            <span className="text-sm text-muted-foreground font-medium">
                                Showing {(currentPage - 1) * itemsPerPage + 1} to {Math.min(currentPage * itemsPerPage, filteredTypes.length)} of {filteredTypes.length} records
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
                        <DialogTitle>{editingType ? 'Edit Request Type' : 'Add Request Type'}</DialogTitle>
                        <DialogDescription>Configure the request category.</DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4 py-2">
                        <div className="grid gap-2">
                            <label className="text-sm font-medium">Value / Key <span className="text-destructive">*</span></label>
                            <Input
                                value={form.value}
                                onChange={(e) => setForm({ ...form, value: e.target.value })}
                                placeholder="e.g. hardware"
                                disabled={!!editingType}
                                className={editingType ? "bg-muted" : ""}
                            />
                            {errors.value && <p className="text-sm text-destructive">{errors.value}</p>}
                            <p className="text-[10px] text-muted-foreground">Unique identifier used in the database. Cannot be changed later.</p>
                        </div>
                        <div className="grid gap-2">
                            <label className="text-sm font-medium">Label <span className="text-destructive">*</span></label>
                            <Input
                                value={form.label}
                                onChange={(e) => setForm({ ...form, label: e.target.value })}
                                placeholder="e.g. Hardware Repair / Issue"
                            />
                            {errors.label && <p className="text-sm text-destructive">{errors.label}</p>}
                        </div>
                        <div className="flex items-center gap-2 mt-2">
                            <input
                                type="checkbox"
                                id="is_active"
                                checked={form.is_active}
                                onChange={(e) => setForm({ ...form, is_active: e.target.checked })}
                                className="rounded border-gray-300 text-[#00D4FF] focus:ring-[#00D4FF]"
                            />
                            <label htmlFor="is_active" className="text-sm font-medium cursor-pointer">
                                Active (Visible in dropdowns)
                            </label>
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => { resetDialog(); setShowAddForm(false); }}>Cancel</Button>
                        <Button
                            className="bg-[#00D4FF] hover:bg-[#00D4FF]/80 text-[#0F172A]"
                            onClick={() => {
                                setIsSaving(true);
                                if (editingType) {
                                    router.put(`/utilities/imiss-request-types/${editingType.id}`, form, {
                                        onSuccess: () => { toast.success('Updated successfully.'); resetDialog(); setShowAddForm(false); },
                                        onError: (err) => { setErrors(err); toast.error('Failed to update.'); },
                                        onFinish: () => setIsSaving(false),
                                    });
                                } else {
                                    router.post('/utilities/imiss-request-types', form, {
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

            <AlertDialog open={!!typeToDelete} onOpenChange={(open) => { if (!open) setTypeToDelete(null); }}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Delete Request Type?</AlertDialogTitle>
                        <AlertDialogDescription>
                            This will permanently delete <strong>{typeToDelete?.label}</strong>. This action cannot be undone.
                            Consider making it inactive instead if tickets are associated with it.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                            disabled={isDeleting}
                            className="bg-destructive text-destructive-foreground"
                            onClick={() => {
                                if (!typeToDelete) return;
                                setIsDeleting(true);
                                router.delete(`/utilities/imiss-request-types/${typeToDelete.id}`, {
                                    onSuccess: () => { toast.success('Deleted successfully.'); setTypeToDelete(null); },
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
