import LineWaves from '@/components/ui/linewaves';
import { Head, router, usePage } from '@inertiajs/react';
import { Search, Link as LinkIcon } from 'lucide-react';
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

type HospitalSystem = {
    id: number;
    name: string;
    url: string;
};

type Props = {
    systems: HospitalSystem[];
};

export default function UtilitiesSystems({ systems }: Props) {
    const [showAddForm, setShowAddForm] = useState(false);
    const [form, setForm] = useState({
        name: '',
        url: '',
    });

    const [editingSystem, setEditingSystem] = useState<HospitalSystem | null>(null);

    function openEditDialog(system: HospitalSystem) {
        setEditingSystem(system);
        setForm({
            name: system.name,
            url: system.url,
        });
        setShowAddForm(true);
    }

    function resetDialog() {
        setEditingSystem(null);
        setErrors({});
        setForm({
            name: '',
            url: '',
        });
    }

    const [systemToDelete, setSystemToDelete] = useState<HospitalSystem | null>(null);
    const [search, setSearch] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 10;

    const filteredSystems = useMemo(() => {
        const keyword = search.toLowerCase().trim();
        if (!keyword) return systems;
        return systems.filter((item) => {
            return (
                item.name.toLowerCase().includes(keyword) ||
                item.url.toLowerCase().includes(keyword)
            );
        });
    }, [search, systems]);

    const paginatedSystems = useMemo(() => {
        const start = (currentPage - 1) * itemsPerPage;
        return filteredSystems.slice(start, start + itemsPerPage);
    }, [filteredSystems, currentPage]);

    const totalPages = Math.ceil(filteredSystems.length / itemsPerPage);

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
            <Head title="Manage Systems & Portals" />

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
                            Manage Systems & Portals
                        </h1>
                        <p className="mt-3 text-base sm:text-lg text-slate-300 leading-relaxed font-medium max-w-2xl">
                            Configure, edit, or remove the external systems linked to the IMISS Unified Access Portal. Keep URLs up to date to ensure seamless employee access.
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
                            placeholder="Search systems..."
                            className="pl-10 border-muted-foreground/20 focus-visible:ring-[#00D4FF]/30 transition-all shadow-sm rounded-xl"
                        />
                    </div>

                    <Button
                        onClick={() => setShowAddForm(true)}
                        className="cursor-pointer bg-[#1E293B] hover:bg-[#00D4FF] hover:shadow-[0_0_20px_rgba(0,212,255,0.4)] hover:-translate-y-0.5 text-white font-semibold rounded-xl shadow-md shadow-[#00D4FF]/20 transition-all hover:scale-[1.02] active:scale-95"
                    >
                        Add System
                    </Button>
                </div>

                <div className="overflow-hidden rounded-2xl border border-muted-foreground/10 bg-card shadow-sm">
                    <table className="w-full text-sm">
                        <thead className="bg-[#1E293B]/5 text-left text-muted-foreground uppercase tracking-wider text-[11px] font-bold border-b border-muted-foreground/10">
                            <tr>
                                <th className="px-5 py-4">System Name</th>
                                <th className="px-5 py-4">Portal URL</th>
                                <th className="px-5 py-4 text-center">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {paginatedSystems.map((item, index) => (
                                <tr key={`${item.id}-${index}`} className="border-t border-muted-foreground/5 transition-colors hover:bg-muted/30">
                                    <td className="px-5 py-4 font-semibold text-foreground">{item.name}</td>
                                    <td className="px-5 py-4">
                                        <a
                                            href={item.url.startsWith('http') ? item.url : `https://${item.url}`}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="inline-flex items-center gap-1.5 font-medium text-muted-foreground hover:text-[#00D4FF] transition-colors rounded-lg px-2 py-1 hover:bg-[#00D4FF]/10 -ml-2"
                                        >
                                            <LinkIcon className="h-3.5 w-3.5" />
                                            {item.url}
                                        </a>
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
                                                onClick={() => setSystemToDelete(item)}
                                                className="rounded-lg border border-destructive/30 px-3 py-1.5 text-xs font-semibold text-destructive hover:bg-destructive hover:text-destructive-foreground transition-colors"
                                            >
                                                Delete
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                            {filteredSystems.length === 0 && (
                                <tr>
                                    <td colSpan={3} className="px-4 py-8 text-center text-muted-foreground">
                                        No systems found.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>

                    {totalPages > 1 && (
                        <div className="flex flex-col sm:flex-row items-center justify-between px-5 py-4 border-t border-muted-foreground/10 gap-4">
                            <span className="text-sm text-muted-foreground font-medium">
                                Showing {(currentPage - 1) * itemsPerPage + 1} to {Math.min(currentPage * itemsPerPage, filteredSystems.length)} of {filteredSystems.length} records
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
                        <DialogTitle>{editingSystem ? 'Edit System' : 'Add System'}</DialogTitle>
                        <DialogDescription>Configure the connection details for the unified portal.</DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4 py-2">
                        <div className="grid gap-2">
                            <label className="text-sm font-medium">System Name</label>
                            <Input
                                value={form.name}
                                onChange={(e) => setForm({ ...form, name: e.target.value })}
                                placeholder="e.g. Employee's Portal"
                            />
                            {errors.name && <p className="text-sm text-destructive">{errors.name}</p>}
                        </div>
                        <div className="grid gap-2">
                            <label className="text-sm font-medium">Portal URL</label>
                            <Input
                                value={form.url}
                                onChange={(e) => setForm({ ...form, url: e.target.value })}
                                placeholder="e.g. https://eportalplus.bataanghmc.net"
                            />
                            {errors.url && <p className="text-sm text-destructive">{errors.url}</p>}
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setShowAddForm(false)}>Cancel</Button>
                        <Button
                            className="bg-[#00D4FF] hover:bg-[#00D4FF]/80 text-[#0F172A]"
                            onClick={() => {
                                setIsSaving(true);
                                if (editingSystem) {
                                    router.put(`/utilities/systems/${editingSystem.id}`, form, {
                                        onSuccess: () => { toast.success('Updated successfully.'); resetDialog(); setShowAddForm(false); },
                                        onError: (err) => { setErrors(err); toast.error('Failed to update.'); },
                                        onFinish: () => setIsSaving(false),
                                    });
                                } else {
                                    router.post('/utilities/systems', form, {
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

            <AlertDialog open={!!systemToDelete} onOpenChange={(open) => { if (!open) setSystemToDelete(null); }}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Delete System?</AlertDialogTitle>
                        <AlertDialogDescription>
                            This will permanently delete <strong>{systemToDelete?.name}</strong>. This action cannot be undone.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                            disabled={isDeleting}
                            className="bg-destructive text-destructive-foreground"
                            onClick={() => {
                                if (!systemToDelete) return;
                                setIsDeleting(true);
                                router.delete(`/utilities/systems/${systemToDelete.id}`, {
                                    onSuccess: () => { toast.success('Deleted successfully.'); setSystemToDelete(null); },
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
