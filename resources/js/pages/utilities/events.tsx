import { useState, useMemo } from 'react';
import { Head, router } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import {
    Dialog,
    DialogContent,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogDescription,
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
import { Separator } from '@/components/ui/separator';
import LineWaves from '@/components/ui/linewaves';
import { toast } from 'sonner';
import {
    CalendarDays,
    Plus,
    Search,
    Loader2,
    FileText,
    MapPin,
    Clock,
    Users,
} from 'lucide-react';

interface Event {
    id: number;
    title: string;
    description: string | null;
    event_date: string;
    time: string | null;
    location: string | null;
    department: string | null;
    type: string;
    is_active: boolean;
    created_at: string;
}

interface Props {
    events: Event[];
}

const EVENT_TYPES = ['training', 'meeting', 'event', 'holiday', 'seminar'] as const;

const EVENT_TYPE_COLORS: Record<string, string> = {
    training: 'bg-blue-500/15 text-blue-600 dark:text-blue-400',
    meeting: 'bg-violet-500/15 text-violet-600 dark:text-violet-400',
    event: 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400',
    holiday: 'bg-rose-500/15 text-rose-600 dark:text-rose-400',
    seminar: 'bg-amber-500/15 text-amber-600 dark:text-amber-400',
};

function getTypeLabel(type: string): string {
    return type.charAt(0).toUpperCase() + type.slice(1);
}

export default function ManageEvents({ events }: Props) {
    const [search, setSearch] = useState('');
    const [showAddForm, setShowAddForm] = useState(false);
    const [editingEvent, setEditingEvent] = useState<Event | null>(null);
    const [eventToDelete, setEventToDelete] = useState<Event | null>(null);
    const [form, setForm] = useState({
        title: '',
        description: '',
        event_date: '',
        time: '',
        location: '',
        department: '',
        type: 'training',
        is_active: true,
    });
    const [errors, setErrors] = useState<Record<string, string>>({});
    const [isSaving, setIsSaving] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);

    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 10;

    const filteredEvents = useMemo(() => {
        const keyword = search.toLowerCase().trim();
        if (!keyword) return events;
        return events.filter((e) => {
            return (
                e.title.toLowerCase().includes(keyword) ||
                e.location?.toLowerCase().includes(keyword) ||
                e.department?.toLowerCase().includes(keyword) ||
                e.type.toLowerCase().includes(keyword)
            );
        });
    }, [search, events]);

    const paginatedEvents = useMemo(() => {
        const start = (currentPage - 1) * itemsPerPage;
        return filteredEvents.slice(start, start + itemsPerPage);
    }, [filteredEvents, currentPage]);

    const totalPages = Math.ceil(filteredEvents.length / itemsPerPage);

    const paginationRange = useMemo(() => {
        const maxVisible = 5;
        let start = Math.max(1, currentPage - Math.floor(maxVisible / 2));
        let end = Math.min(totalPages, start + maxVisible - 1);
        if (end - start + 1 < maxVisible) {
            start = Math.max(1, end - maxVisible + 1);
        }
        const range: (number | string)[] = [];
        for (let i = start; i <= end; i++) range.push(i);
        if (start > 1) range.unshift('...');
        if (end < totalPages) range.push('...');
        return range;
    }, [currentPage, totalPages]);

    function openCreateDialog() {
        setEditingEvent(null);
        setErrors({});
        setForm({
            title: '',
            description: '',
            event_date: '',
            time: '',
            location: '',
            department: '',
            type: 'training',
            is_active: true,
        });
        setShowAddForm(true);
    }

    function openEditDialog(event: Event) {
        setEditingEvent(event);
        setErrors({});
        setForm({
            title: event.title,
            description: event.description || '',
            event_date: event.event_date,
            time: event.time || '',
            location: event.location || '',
            department: event.department || '',
            type: event.type,
            is_active: event.is_active,
        });
        setShowAddForm(true);
    }

    function resetDialog() {
        setEditingEvent(null);
        setErrors({});
        setShowAddForm(false);
    }

    function saveEvent() {
        setIsSaving(true);
        if (editingEvent) {
            router.put(`/utilities/events/${editingEvent.id}`, form, {
                onSuccess: () => {
                    toast.success('Event updated successfully.');
                    resetDialog();
                },
                onError: (err) => { setErrors(err); toast.error('Failed to update.'); },
                onFinish: () => setIsSaving(false),
            });
        } else {
            router.post('/utilities/events', form, {
                onSuccess: () => {
                    toast.success('Event created successfully.');
                    resetDialog();
                },
                onError: (err) => { setErrors(err); toast.error('Failed to create.'); },
                onFinish: () => setIsSaving(false),
            });
        }
    }

    function confirmDelete() {
        if (!eventToDelete) return;
        setIsDeleting(true);
        router.delete(`/utilities/events/${eventToDelete.id}`, {
            onSuccess: () => {
                toast.success('Event deleted.');
                setEventToDelete(null);
            },
            onError: () => toast.error('Failed to delete.'),
            onFinish: () => setIsDeleting(false),
        });
    }

    return (
        <>
            <Head title="Manage Events" />

            <div className="p-6 mt-6 mx-auto w-full max-w-7xl space-y-8">
                {/* Hero Banner */}
                <section className="relative overflow-hidden rounded-3xl border border-[#00D4FF]/20 bg-gradient-to-br from-[#0F172A] via-[#1E293B] to-[#0F172A] p-8 sm:p-10 shadow-lg min-h-[180px] flex flex-col justify-center group">
                    <div className="absolute inset-0 z-0 opacity-30 mix-blend-screen">
                        <LineWaves />
                    </div>

                    <div className="absolute top-0 right-0 -mt-20 -mr-20 h-72 w-72 rounded-full bg-[#00D4FF] opacity-10 blur-[80px] group-hover:opacity-20 transition-opacity duration-700 pointer-events-none"></div>
                    <div className="absolute bottom-0 left-0 -mb-20 -ml-20 h-72 w-72 rounded-full bg-violet-600 opacity-10 blur-[80px] group-hover:opacity-20 transition-opacity duration-700 pointer-events-none"></div>

                    <div className="relative z-10 w-full max-w-3xl">
                        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#00D4FF]/10 border border-[#00D4FF]/20 text-[#00D4FF] text-xs font-bold tracking-widest uppercase mb-4 shadow-[0_0_15px_rgba(0,212,255,0.15)]">
                            <CalendarDays className="w-4 h-4" /> Utility Module
                        </div>
                        <h1 className="text-3xl font-black tracking-tight text-white sm:text-4xl drop-shadow-md">
                            Manage Events
                        </h1>
                        <p className="mt-3 text-base sm:text-lg text-slate-300 leading-relaxed font-medium max-w-2xl">
                            Create, edit, and manage hospital events, trainings, meetings, and holidays.
                        </p>
                    </div>
                </section>

                {/* Controls */}
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
                    <div className="relative flex-1 max-w-sm group">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground transition-colors group-focus-within:text-[#00D4FF]" />
                        <Input
                            value={search}
                            onChange={(e) => { setSearch(e.target.value); setCurrentPage(1); }}
                            placeholder="Search events..."
                            className="pl-10 border-muted-foreground/20 focus-visible:ring-[#00D4FF]/30 transition-all shadow-sm rounded-xl"
                        />
                    </div>

                    <Button
                        onClick={openCreateDialog}
                        className="cursor-pointer bg-[#1E293B] hover:bg-[#00D4FF] hover:shadow-[0_0_20px_rgba(0,212,255,0.4)] hover:-translate-y-0.5 text-white font-semibold rounded-xl shadow-md shadow-[#00D4FF]/20 transition-all hover:scale-[1.02] active:scale-95"
                    >
                        <Plus className="w-4 h-4 mr-2" />
                        Add Event
                    </Button>
                </div>

                {/* Table */}
                <div className="overflow-hidden rounded-2xl border border-muted-foreground/10 bg-card shadow-sm">
                    <table className="w-full text-sm">
                        <thead className="bg-[#1E293B]/5 text-left text-muted-foreground uppercase tracking-wider text-[11px] font-bold border-b border-muted-foreground/10">
                            <tr>
                                <th className="px-5 py-4">Title</th>
                                <th className="px-5 py-4">Date</th>
                                <th className="px-5 py-4">Type</th>
                                <th className="px-5 py-4 hidden md:table-cell">Location</th>
                                <th className="px-5 py-4 hidden lg:table-cell">Department</th>
                                <th className="px-5 py-4 text-center">Status</th>
                                <th className="px-5 py-4 text-center">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {paginatedEvents.map((event) => (
                                <tr key={event.id} className="border-t border-muted-foreground/5 transition-colors hover:bg-muted/30">
                                    <td className="px-5 py-4">
                                        <div className="font-semibold text-foreground">{event.title}</div>
                                        {event.description && (
                                            <div className="text-xs text-muted-foreground mt-0.5 max-w-xs truncate">{event.description}</div>
                                        )}
                                    </td>
                                    <td className="px-5 py-4 whitespace-nowrap">
                                        <span className="font-medium text-foreground">
                                            {new Date(event.event_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                                        </span>
                                        {event.time && (
                                            <div className="text-[10px] text-muted-foreground flex items-center gap-1 mt-0.5">
                                                <Clock className="w-3 h-3" /> {event.time}
                                            </div>
                                        )}
                                    </td>
                                    <td className="px-5 py-4">
                                        <Badge className={`text-[10px] font-semibold px-2.5 py-0.5 rounded-full border-0 ${EVENT_TYPE_COLORS[event.type]}`}>
                                            {getTypeLabel(event.type)}
                                        </Badge>
                                    </td>
                                    <td className="px-5 py-4 hidden md:table-cell">
                                        {event.location ? (
                                            <span className="text-sm text-muted-foreground flex items-center gap-1">
                                                <MapPin className="w-3 h-3" /> {event.location}
                                            </span>
                                        ) : (
                                            <span className="text-sm text-muted-foreground/50">—</span>
                                        )}
                                    </td>
                                    <td className="px-5 py-4 hidden lg:table-cell">
                                        {event.department ? (
                                            <span className="text-sm text-muted-foreground flex items-center gap-1">
                                                <Users className="w-3 h-3" /> {event.department}
                                            </span>
                                        ) : (
                                            <span className="text-sm text-muted-foreground/50">—</span>
                                        )}
                                    </td>
                                    <td className="px-5 py-4 text-center">
                                        {event.is_active ? (
                                            <span className="inline-flex items-center rounded-full bg-emerald-500/10 px-2.5 py-0.5 text-xs font-semibold text-emerald-600">Active</span>
                                        ) : (
                                            <span className="inline-flex items-center rounded-full bg-slate-500/10 px-2.5 py-0.5 text-xs font-semibold text-slate-600">Inactive</span>
                                        )}
                                    </td>
                                    <td className="px-5 py-4 text-center">
                                        <div className="flex justify-center gap-2">
                                            <button
                                                onClick={() => openEditDialog(event)}
                                                className="rounded-lg border border-muted-foreground/20 px-3 py-1.5 text-xs font-semibold hover:bg-muted transition-colors"
                                            >
                                                Edit
                                            </button>
                                            <button
                                                onClick={() => setEventToDelete(event)}
                                                className="rounded-lg border border-destructive/30 px-3 py-1.5 text-xs font-semibold text-destructive hover:bg-destructive hover:text-destructive-foreground transition-colors"
                                            >
                                                Delete
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                            {filteredEvents.length === 0 && (
                                <tr>
                                    <td colSpan={7} className="px-4 py-12 text-center text-muted-foreground">
                                        {search ? 'No events match your search.' : 'No events yet. Create your first event!'}
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>

                    {totalPages > 1 && (
                        <div className="flex items-center justify-between px-5 py-4 border-t border-muted-foreground/10 gap-4">
                            <div className="text-xs text-muted-foreground font-medium">
                                Showing <span className="text-foreground">{paginatedEvents.length}</span> of <span className="text-foreground">{filteredEvents.length}</span> records
                            </div>
                            <div className="flex items-center gap-1">
                                <button
                                    onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                                    disabled={currentPage === 1}
                                    className="rounded-lg border border-muted-foreground/20 px-3 py-1.5 text-xs font-semibold hover:bg-muted transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    Previous
                                </button>
                                {paginationRange.map((item, index) => (
                                    <span key={index}>
                                        {item === '...' ? (
                                            <span className="px-2 text-xs text-muted-foreground">...</span>
                                        ) : (
                                            <button
                                                onClick={() => setCurrentPage(item as number)}
                                                className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition-colors ${currentPage === item
                                                        ? 'bg-[#1E293B] text-white'
                                                        : 'border border-muted-foreground/20 hover:bg-muted'
                                                    }`}
                                            >
                                                {item}
                                            </button>
                                        )}
                                    </span>
                                ))}
                                <button
                                    onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                                    disabled={currentPage === totalPages}
                                    className="rounded-lg border border-muted-foreground/20 px-3 py-1.5 text-xs font-semibold hover:bg-muted transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    Next
                                </button>
                            </div>
                        </div>
                    )}
                </div>

                <Separator className="my-4" />
                <p className="text-center text-xs text-muted-foreground font-medium pb-6">
                    Manage hospital events and important dates.
                </p>
            </div>

            {/* Create/Edit Dialog */}
            <Dialog open={showAddForm} onOpenChange={(open) => { if (!open) resetDialog(); }}>
                <DialogContent className="w-[95vw] max-w-[1000px] sm:max-w-[1000px] p-0 overflow-hidden bg-background rounded-3xl border-0 shadow-[0_20px_60px_-15px_rgba(0,0,0,0.3)]">
                    <DialogDescription className="hidden">Add or edit event.</DialogDescription>

                    <div className="relative flex items-center justify-center p-5 border-b border-muted/50">
                        <DialogTitle className="text-lg font-bold tracking-tight text-foreground">
                            {editingEvent ? 'Edit Event' : 'Create Event'}
                        </DialogTitle>
                    </div>

                    <div className="p-6 md:p-8">
                        <div className="grid md:grid-cols-2 gap-8 lg:gap-12">
                            {/* Left Column: Event Type & Date */}
                            <div className="flex flex-col gap-6">
                                <div>
                                    <h3 className="text-base font-semibold text-foreground">Event Details</h3>
                                    <p className="text-xs text-muted-foreground mt-1">Set the event type and schedule.</p>
                                </div>

                                <div className="flex flex-col gap-5">
                                    <div className="relative rounded-xl border border-muted-foreground/20 focus-within:border-primary focus-within:ring-1 focus-within:ring-primary transition-all p-3 bg-card">
                                        <label className="text-xs font-medium text-muted-foreground mb-1 block">
                                            Event Type <span className="text-destructive">*</span>
                                        </label>
                                        <Select value={form.type} onValueChange={(v) => setForm({ ...form, type: v })}>
                                            <SelectTrigger className="w-full border-0 p-0 h-auto focus-visible:ring-0 shadow-none bg-transparent">
                                                <SelectValue placeholder="Select type" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {EVENT_TYPES.map((type) => (
                                                    <SelectItem key={type} value={type}>{getTypeLabel(type)}</SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                        {errors.type && <p className="text-xs text-destructive mt-1">{errors.type}</p>}
                                    </div>

                                    <div className="relative rounded-xl border border-muted-foreground/20 focus-within:border-primary focus-within:ring-1 focus-within:ring-primary transition-all p-3 bg-card">
                                        <label className="text-xs font-medium text-muted-foreground mb-1 block">
                                            Date <span className="text-destructive">*</span>
                                        </label>
                                        <Input
                                            type="date"
                                            value={form.event_date}
                                            onChange={(e) => setForm({ ...form, event_date: e.target.value })}
                                            className="border-0 p-0 h-auto focus-visible:ring-0 text-foreground font-medium rounded-none bg-transparent"
                                        />
                                        {errors.event_date && <p className="text-xs text-destructive mt-1">{errors.event_date}</p>}
                                    </div>

                                    <div className="relative rounded-xl border border-muted-foreground/20 focus-within:border-primary focus-within:ring-1 focus-within:ring-primary transition-all p-3 bg-card">
                                        <label className="text-xs font-medium text-muted-foreground mb-1 block">Time</label>
                                        <Input
                                            value={form.time}
                                            onChange={(e) => setForm({ ...form, time: e.target.value })}
                                            placeholder="e.g. 8:00 AM - 5:00 PM"
                                            className="border-0 p-0 h-auto focus-visible:ring-0 text-foreground font-medium rounded-none bg-transparent"
                                        />
                                        {errors.time && <p className="text-xs text-destructive mt-1">{errors.time}</p>}
                                    </div>

                                    <div className="relative rounded-xl border border-muted-foreground/20 focus-within:border-primary focus-within:ring-1 focus-within:ring-primary transition-all p-3 bg-card">
                                        <label className="text-xs font-medium text-muted-foreground mb-1 block">Location</label>
                                        <Input
                                            value={form.location}
                                            onChange={(e) => setForm({ ...form, location: e.target.value })}
                                            placeholder="e.g. Training Room A"
                                            className="border-0 p-0 h-auto focus-visible:ring-0 text-foreground font-medium rounded-none bg-transparent"
                                        />
                                        {errors.location && <p className="text-xs text-destructive mt-1">{errors.location}</p>}
                                    </div>
                                </div>
                            </div>

                            {/* Right Column: Description & Settings */}
                            <div className="flex flex-col gap-6">
                                <div>
                                    <h3 className="text-base font-semibold text-foreground">Description & Settings</h3>
                                    <p className="text-xs text-muted-foreground mt-1">Provide additional information.</p>
                                </div>

                                <div className="flex flex-col gap-5">
                                    <div className="relative rounded-xl border border-muted-foreground/20 focus-within:border-primary focus-within:ring-1 focus-within:ring-primary transition-all p-3 bg-card">
                                        <label className="text-xs font-medium text-muted-foreground mb-1 block">
                                            Title <span className="text-destructive">*</span>
                                        </label>
                                        <Input
                                            value={form.title}
                                            onChange={(e) => setForm({ ...form, title: e.target.value })}
                                            placeholder="e.g. BLS Training"
                                            className="border-0 p-0 h-auto focus-visible:ring-0 text-foreground font-medium rounded-none bg-transparent"
                                        />
                                        {errors.title && <p className="text-xs text-destructive mt-1">{errors.title}</p>}
                                    </div>

                                    <div className="relative rounded-xl border border-muted-foreground/20 focus-within:border-primary focus-within:ring-1 focus-within:ring-primary transition-all p-3 bg-card flex-grow flex flex-col min-h-[120px]">
                                        <label className="text-xs font-medium text-muted-foreground mb-1 block">Description</label>
                                        <Textarea
                                            value={form.description}
                                            onChange={(e) => setForm({ ...form, description: e.target.value })}
                                            placeholder="Event description..."
                                            className="border-0 p-0 focus-visible:ring-0 text-foreground resize-none rounded-none bg-transparent flex-grow"
                                        />
                                        {errors.description && <p className="text-xs text-destructive mt-1">{errors.description}</p>}
                                    </div>

                                    <div className="relative rounded-xl border border-muted-foreground/20 focus-within:border-primary focus-within:ring-1 focus-within:ring-primary transition-all p-3 bg-card">
                                        <label className="text-xs font-medium text-muted-foreground mb-1 block">Department</label>
                                        <Input
                                            value={form.department}
                                            onChange={(e) => setForm({ ...form, department: e.target.value })}
                                            placeholder="e.g. Nursing"
                                            className="border-0 p-0 h-auto focus-visible:ring-0 text-foreground font-medium rounded-none bg-transparent"
                                        />
                                        {errors.department && <p className="text-xs text-destructive mt-1">{errors.department}</p>}
                                    </div>

                                    {/* Visibility */}
                                    <div className="flex items-center justify-between p-4 rounded-xl border border-muted-foreground/10 bg-card mt-auto">
                                        <div className="flex flex-col">
                                            <label className="text-sm font-semibold text-foreground">Visibility</label>
                                            <span className="text-xs text-muted-foreground mt-0.5">Show to all employees</span>
                                        </div>
                                        <Switch
                                            checked={form.is_active}
                                            onCheckedChange={(c: boolean) => setForm({ ...form, is_active: c })}
                                            className="data-[state=checked]:bg-blue-600"
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Footer */}
                    <DialogFooter className="px-6 py-5 border-t border-muted/50 bg-background flex flex-col sm:flex-row sm:items-center sm:justify-between">
                        <div className="text-xs text-muted-foreground mb-4 sm:mb-0 font-medium">
                            Changes will be saved immediately.
                        </div>
                        <div className="flex gap-3">
                            <Button variant="ghost" className="rounded-full font-semibold hover:bg-muted" onClick={resetDialog}>Cancel</Button>
                            <Button
                                className="rounded-full font-bold px-6 bg-foreground text-background hover:bg-foreground/90 shadow-none min-w-[100px]"
                                onClick={saveEvent}
                                disabled={isSaving}
                            >
                                {isSaving ? 'Saving' : editingEvent ? 'Update' : 'Save'}
                            </Button>
                        </div>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Delete Confirmation */}
            <AlertDialog open={!!eventToDelete} onOpenChange={(open) => { if (!open) setEventToDelete(null); }}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Delete Event?</AlertDialogTitle>
                        <AlertDialogDescription>
                            This will permanently delete <strong>{eventToDelete?.title}</strong>. This action cannot be undone.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                            disabled={isDeleting}
                            className="bg-destructive text-destructive-foreground"
                            onClick={confirmDelete}
                        >
                            {isDeleting ? 'Deleting...' : 'Delete'}
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </>
    );
}