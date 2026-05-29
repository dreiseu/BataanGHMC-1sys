import ModulePageHeader from '@/components/module-page-header';
import LineWaves from '@/components/ui/linewaves';
import { Head, router, usePage } from '@inertiajs/react';
import { Search, Phone, Copy } from 'lucide-react';
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

export default function Directory({ entries }: Props) {
    const { auth } = usePage().props as unknown as {
        auth: {
            user: {
                role: string;
            };
        };
    };

    const isAdmin = auth?.user?.role === 'admin';

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

    const filteredDirectory = useMemo(() => {
        const keyword = search.toLowerCase().trim();

        if (!keyword) {
            return entries;
        }

        return entries.filter((item) => {
            const matchesSearch =
                item.department.toLowerCase().includes(keyword) ||
                item.local_no.includes(keyword) ||
                item.section.toLowerCase().includes(keyword);

            const matchesSection =
                sectionFilter === 'all' ||
                item.section === sectionFilter;

            return matchesSearch && matchesSection;
        });
    }, [search, sectionFilter, entries]);

    const [errors, setErrors] = useState<Record<string, string>>({});

    const [isSaving, setIsSaving] = useState(false);

    const [isDeleting, setIsDeleting] = useState(false);


    return (
        <>
            <Head title="Directory" />

            <div className="p-6 mx-auto w-full max-w-7xl">
                {/* Search Hero Banner */}
                <section className="relative overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-br from-[#5B0FBE] to-[#260554] p-8 shadow-lg min-h-[220px] flex flex-col justify-center">
                    <div className="absolute inset-0 z-0">
                        <LineWaves />
                    </div>
                    <div className="absolute top-0 right-0 -mt-16 -mr-16 h-64 w-64 rounded-full bg-[#00D4FF] opacity-20 blur-3xl mix-blend-screen pointer-events-none"></div>
                    <div className="absolute bottom-0 left-0 -mb-16 -ml-16 h-64 w-64 rounded-full bg-[#5B0FBE] opacity-40 blur-3xl mix-blend-screen pointer-events-none"></div>

                    <div className="relative z-10 w-full max-w-3xl">
                        <p className="text-sm font-bold tracking-widest text-[#00D4FF] uppercase drop-shadow-sm">
                            BataanGHMC & BUCAS
                        </p>
                        <h1 className="mt-2 text-3xl font-bold tracking-tight text-white sm:text-4xl drop-shadow-md">
                            Hospital Directory
                        </h1>
                        <p className="mt-3 text-base text-white/90 leading-relaxed font-medium mb-6">
                            Search for department, ward, and office local numbers.
                        </p>

                        <div className="flex flex-col sm:flex-row items-center gap-3 w-full">
                            <div className="flex-1 flex items-center gap-3 rounded-2xl border border-white/20 bg-black/20 px-4 py-3 shadow-inner backdrop-blur-md transition-colors focus-within:border-[#00D4FF]/50 focus-within:bg-black/30 w-full">
                                <Search className="h-5 w-5 text-[#00D4FF]" />
                                <input
                                    value={search}
                                    onChange={(event) => setSearch(event.target.value)}
                                    placeholder="Search department or local number..."
                                    className="w-full bg-transparent text-white placeholder-white/50 outline-none text-base"
                                />
                            </div>

                            <div className="w-full sm:w-52 dark">
                                <Select
                                    value={sectionFilter}
                                    onValueChange={setSectionFilter}
                                >
                                    <SelectTrigger className="w-full cursor-pointer rounded-2xl border-white/20 bg-black/20 text-white h-[50px] shadow-inner backdrop-blur-md focus:ring-[#00D4FF]">
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all" className="cursor-pointer">All Sections</SelectItem>
                                        <SelectItem value="BataanGHMC" className="cursor-pointer">BataanGHMC</SelectItem>
                                        <SelectItem value="BUCAS" className="cursor-pointer">BUCAS</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>
                    </div>
                </section>

                <div className="mt-8 mb-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div className="text-sm font-semibold text-muted-foreground bg-muted/50 px-4 py-2 rounded-xl inline-block">
                        Showing <span className="text-foreground">{filteredDirectory.length}</span> of {entries.length} entries
                    </div>

                    {isAdmin && (
                        <div className="flex justify-end">
                            <button
                                onClick={() => setShowAddForm(true)}
                                className="w-full rounded-xl bg-[#5B0FBE] hover:bg-[#00D4FF] transition-colors px-5 py-2.5 text-sm font-semibold text-white sm:w-auto shadow-sm"
                            >
                                Add Directory Entry
                            </button>
                            <Dialog
                                open={showAddForm}
                                onOpenChange={(open) => {
                                    setShowAddForm(open);

                                    if (!open) {
                                        resetDialog();
                                    }
                                }}
                            >
                                <DialogContent>
                                    <DialogHeader>
                                        <DialogTitle>
                                            {editingEntry ? 'Edit Directory Entry' : 'Add Directory Entry'}
                                        </DialogTitle>
                                        <DialogDescription>
                                            Add a new department, ward, or office local number.
                                        </DialogDescription>
                                    </DialogHeader>

                                    <div className="grid gap-4 py-2">
                                        <div className="grid gap-2">
                                            <label className="text-sm font-medium">
                                                Department / Ward / Office
                                            </label>

                                            <Input
                                                value={form.department}
                                                onChange={(e) =>
                                                    setForm({ ...form, department: e.target.value })
                                                }
                                            />

                                            {errors.department && (
                                                <p className="text-sm text-destructive">
                                                    {errors.department}
                                                </p>
                                            )}
                                        </div>

                                        <div className="grid gap-2">
                                            <label className="text-sm font-medium">
                                                Local No.
                                            </label>

                                            <Input
                                                value={form.local_no}
                                                onChange={(e) =>
                                                    setForm({
                                                        ...form,
                                                        local_no: e.target.value
                                                    })
                                                }
                                            />

                                            {errors.local_no && (
                                                <p className="text-sm text-destructive">
                                                    {errors.local_no}
                                                </p>
                                            )}
                                        </div>

                                        <div className="grid gap-2">
                                            <label className="text-sm font-medium">
                                                Section
                                            </label>

                                            <Select
                                                value={form.section}
                                                onValueChange={(value) =>
                                                    setForm({
                                                        ...form,
                                                        section: value,
                                                    })
                                                }
                                            >
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Select section" />
                                                </SelectTrigger>

                                                <SelectContent>
                                                    <SelectItem value="BataanGHMC">
                                                        BataanGHMC
                                                    </SelectItem>

                                                    <SelectItem value="BUCAS">
                                                        BUCAS
                                                    </SelectItem>
                                                </SelectContent>
                                            </Select>

                                            {errors.section && (
                                                <p className="text-sm text-destructive">
                                                    {errors.section}
                                                </p>
                                            )}
                                        </div>

                                        <div className="grid gap-2">
                                            <label className="text-sm font-medium">
                                                Sort Order
                                            </label>

                                            <Input
                                                type="number"
                                                min="0"
                                                value={form.sort_order}
                                                onChange={(e) =>
                                                    setForm({
                                                        ...form,
                                                        sort_order: Number(e.target.value),
                                                    })
                                                }
                                                className="rounded-lg border bg-background px-3 py-2 text-sm"
                                            />

                                            {errors.sort_order && (
                                                <p className="text-sm text-destructive">
                                                    {errors.sort_order}
                                                </p>
                                            )}
                                        </div>
                                    </div>

                                    <DialogFooter>
                                        <Button
                                            variant="outline"
                                            onClick={() => {
                                                setEditingEntry(null);
                                                resetDialog();
                                                setShowAddForm(false);
                                            }}
                                        >
                                            Cancel
                                        </Button>

                                        <Button
                                            onClick={() => {
                                                setIsSaving(true);

                                                if (editingEntry) {
                                                    router.put(`/directory/${editingEntry.id}`, form, {
                                                        onSuccess: () => {
                                                            toast.success('Directory entry updated successfully.');
                                                            setErrors({});
                                                            resetDialog();
                                                            setShowAddForm(false);
                                                        },
                                                        onError: (errors) => {
                                                            setErrors(errors);
                                                            toast.error('Failed to update directory entry.');
                                                        },
                                                        onFinish: () => {
                                                            setIsSaving(false);
                                                        },
                                                    });

                                                    return;
                                                }

                                                router.post('/directory', form, {
                                                    onSuccess: () => {
                                                        toast.success('Directory entry added successfully.');
                                                        setErrors({});
                                                        resetDialog();
                                                        setShowAddForm(false);
                                                    },
                                                    onError: (errors) => {
                                                        setErrors(errors);
                                                        toast.error('Failed to add directory entry.');
                                                    },
                                                    onFinish: () => {
                                                        setIsSaving(false);
                                                    },
                                                });
                                            }}
                                        >
                                            {isSaving ? 'Saving...' : 'Save'}
                                        </Button>
                                    </DialogFooter>
                                </DialogContent>
                            </Dialog>
                        </div>
                    )}
                </div>

                <div className="overflow-hidden rounded-2xl border bg-card shadow-sm">
                    <table className="w-full text-sm">
                        <thead className="bg-muted/50 text-left text-muted-foreground uppercase tracking-wider text-[11px] font-bold">
                            <tr>
                                <th className="px-5 py-4">
                                    Department / Ward / Office
                                </th>
                                <th className="px-5 py-4 text-center">
                                    Local No.
                                </th>
                                <th className="px-5 py-4 text-center">
                                    Section
                                </th>
                                {isAdmin && (
                                    <th className="px-5 py-4 text-center">
                                        Actions
                                    </th>
                                )}
                            </tr>
                        </thead>

                        <tbody>
                            {filteredDirectory.map((item, index) => (
                                <tr
                                    key={`${item.department}-${item.local_no}-${index}`}
                                    className="border-t transition-colors hover:bg-[#5B0FBE]/5"
                                >
                                    <td className="px-5 py-4 font-medium text-foreground">
                                        {item.department}
                                    </td>
                                    <td className="px-5 py-4 text-center">
                                        <button
                                            onClick={() => {
                                                navigator.clipboard.writeText(item.local_no);
                                                toast.success('Local number copied.');
                                            }}
                                            className="group/copy inline-flex items-center justify-center gap-1.5 font-bold text-foreground hover:text-[#00D4FF] transition-colors rounded-lg px-2 py-1 hover:bg-[#00D4FF]/10"
                                        >
                                            {item.local_no}
                                            <Copy className="h-3.5 w-3.5 opacity-0 group-hover/copy:opacity-100 transition-opacity" />
                                        </button>
                                    </td>
                                    <td className="px-5 py-4 text-muted-foreground text-center font-medium">
                                        {item.section}
                                    </td>
                                    {isAdmin && (
                                        <td className="px-5 py-4 text-center">
                                            <div className="flex justify-center gap-2">
                                                <button
                                                    onClick={() => openEditDialog(item)}
                                                    className="rounded-lg border px-3 py-1.5 text-xs font-semibold hover:bg-muted transition-colors"
                                                >
                                                    Edit
                                                </button>

                                                <button
                                                    onClick={() => setEntryToDelete(item)}
                                                    className="rounded-lg border border-destructive/30 px-3 py-1.5 text-xs font-semibold text-destructive hover:bg-destructive hover:text-destructive-foreground transition-colors"
                                                >
                                                    Delete
                                                </button>
                                            </div>
                                        </td>
                                    )}
                                </tr>
                            ))}

                            {filteredDirectory.length === 0 && (
                                <tr>
                                    <td
                                        colSpan={isAdmin ? 4 : 3}
                                        className="px-4 py-8 text-center text-muted-foreground"
                                    >
                                        No directory records found.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>

                <div className="mt-6 grid gap-4 sm:grid-cols-2">
                    <div className="group relative overflow-hidden rounded-2xl border bg-card p-6 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-md hover:border-[#00D4FF]/40">
                        <div className="absolute inset-0 bg-gradient-to-br from-[#00D4FF]/5 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100 pointer-events-none" />
                        <div className="relative z-10">
                            <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-[#5B0FBE]/10 text-[#5B0FBE] transition-colors duration-300 group-hover:bg-[#00D4FF]/10 group-hover:text-[#00D4FF]">
                                <Phone className="h-6 w-6 transition-transform duration-300 group-hover:scale-110" />
                            </div>
                            <h3 className="font-bold text-lg text-foreground">BataanGHMC Trunk Lines</h3>
                            <p className="mt-2 text-muted-foreground font-medium">
                                (047) 237-9771 <br />
                                (047) 237-9772 <br />
                                (047) 237-1274
                            </p>
                        </div>
                    </div>

                    <div className="group relative overflow-hidden rounded-2xl border bg-card p-6 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-md hover:border-[#00D4FF]/40">
                        <div className="absolute inset-0 bg-gradient-to-br from-[#00D4FF]/5 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100 pointer-events-none" />
                        <div className="relative z-10">
                            <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-[#5B0FBE]/10 text-[#5B0FBE] transition-colors duration-300 group-hover:bg-[#00D4FF]/10 group-hover:text-[#00D4FF]">
                                <Phone className="h-6 w-6 transition-transform duration-300 group-hover:scale-110" />
                            </div>
                            <h3 className="font-bold text-lg text-foreground">BUCAS Trunk Lines</h3>
                            <p className="mt-2 text-muted-foreground font-medium">
                                (047) 240-9200 to 9204
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            <AlertDialog
                open={!!entryToDelete}
                onOpenChange={(open) => {
                    if (!open) setEntryToDelete(null);
                }}
            >
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Delete Directory Entry?</AlertDialogTitle>
                        <AlertDialogDescription>
                            This will permanently delete{' '}
                            <strong>{entryToDelete?.department}</strong>. This action
                            cannot be undone.
                        </AlertDialogDescription>
                    </AlertDialogHeader>

                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>

                        <AlertDialogAction
                            disabled={isDeleting}
                            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                            onClick={() => {
                                if (!entryToDelete) return;

                                setIsDeleting(true);

                                router.delete(`/directory/${entryToDelete.id}`, {
                                    onSuccess: () => {
                                        toast.success('Directory entry deleted successfully.');
                                        setEntryToDelete(null);
                                    },
                                    onError: () => {
                                        toast.error('Failed to delete directory entry.');
                                    },
                                    onFinish: () => {
                                        setIsDeleting(false);
                                    },
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