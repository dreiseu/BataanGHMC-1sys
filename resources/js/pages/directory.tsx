import ModulePageHeader from '@/components/module-page-header';
import { Head, router, usePage } from '@inertiajs/react';
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
    const { auth } = usePage().props as {
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

            <div className="p-6">
                <ModulePageHeader
                    title="Directory"
                    description="Search BataanGHMC department, ward, and office local numbers."
                />

                <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <Select
                        value={sectionFilter}
                        onValueChange={setSectionFilter}
                    >
                        <SelectTrigger className="w-full sm:w-52">
                            <SelectValue />
                        </SelectTrigger>

                        <SelectContent>
                            <SelectItem value="all">
                                All Sections
                            </SelectItem>

                            <SelectItem value="BataanGHMC">
                                BataanGHMC
                            </SelectItem>

                            <SelectItem value="BUCAS">
                                BUCAS
                            </SelectItem>
                        </SelectContent>
                    </Select>

                    {isAdmin && (
                    <div className="mb-4 flex justify-end">
                        <button
                            onClick={() => setShowAddForm(true)}
                            className="w-full rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground sm:w-auto"
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

                <div className="mb-4 flex items-center gap-2 rounded-xl border bg-card px-3 py-2 shadow-sm">
                    <Search className="h-4 w-4 text-muted-foreground" />

                    <input
                        value={search}
                        onChange={(event) => setSearch(event.target.value)}
                        placeholder="Search department, local number, or section..."
                        className="w-full bg-transparent text-sm outline-none"
                    />
                </div>

                <div className="mb-3 text-sm text-muted-foreground">
                    Showing {filteredDirectory.length} of {entries.length} entries
                </div>

                <div className="overflow-hidden rounded-xl border bg-card shadow-sm">
                    <table className="w-full text-sm">
                        <thead className="bg-muted text-left">
                            <tr>
                                <th className="px-4 py-3 font-semibold">
                                    Department / Ward / Office
                                </th>
                                <th className="px-4 py-3 font-semibold text-center">
                                    Local No.
                                </th>
                                <th className="px-4 py-3 font-semibold text-center">
                                    Section
                                </th>
                                {isAdmin && (
                                    <th className="px-4 py-3 text-center font-semibold">
                                        Actions
                                    </th>
                                )}
                            </tr>
                        </thead>

                        <tbody>
                            {filteredDirectory.map((item, index) => (
                                <tr
                                    key={`${item.department}-${item.local_no}-${index}`}
                                    className="border-t"
                                >
                                    <td className="px-4 py-3">
                                        {item.department}
                                    </td>
                                    <td className="px-4 py-3 font-semibold text-center">
                                        <button
                                            onClick={() => {
                                                navigator.clipboard.writeText(item.local_no);
                                                toast.success('Local number copied.');
                                            }}
                                            className="font-semibold hover:underline"
                                        >
                                            {item.local_no}
                                        </button>
                                    </td>
                                    <td className="px-4 py-3 text-muted-foreground text-center">
                                        {item.section}
                                    </td>
                                    {isAdmin && (
                                        <td className="px-4 py-3 text-center">
                                            <div className="flex justify-center gap-2">
                                                <button
                                                    onClick={() => openEditDialog(item)}
                                                    className="rounded-md border px-3 py-1 text-xs"
                                                >
                                                    Edit
                                                </button>

                                                <button
                                                    onClick={() => setEntryToDelete(item)}
                                                    className="rounded-md border px-3 py-1 text-xs text-destructive"
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

                <div className="mt-4 rounded-xl border bg-card p-4 text-sm text-muted-foreground">
                    <p>
                        <strong>BataanGHMC Trunk Lines:</strong> (047) 237-9771,
                        237-9772, 237-1274
                    </p>

                    <p className="mt-1">
                        <strong>BUCAS Trunk Lines:</strong> (047) 240-9200 to
                        9204
                    </p>
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