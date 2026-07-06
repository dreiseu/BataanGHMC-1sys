import { useState } from 'react';
import { Head, useForm, usePage, router } from '@inertiajs/react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Separator } from '@/components/ui/separator';
import { toast } from 'sonner';
import {
    CalendarDays,
    Plus,
    Pencil,
    Trash2,
    MapPin,
    Clock,
    Users,
    Search,
    Loader2,
    CheckCircle2,
    XCircle,
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
    const { errors } = usePage().props as any;
    const [searchQuery, setSearchQuery] = useState('');
    const [dialogOpen, setDialogOpen] = useState(false);
    const [editingEvent, setEditingEvent] = useState<Event | null>(null);
    const [deletingId, setDeletingId] = useState<number | null>(null);

    const { data, setData, post, put, processing, reset, wasSuccessful } = useForm({
        title: '',
        description: '',
        event_date: '',
        time: '',
        location: '',
        department: '',
        type: 'training',
        is_active: true,
    });

    const openCreateDialog = () => {
        setEditingEvent(null);
        setData({
            title: '',
            description: '',
            event_date: '',
            time: '',
            location: '',
            department: '',
            type: 'training',
            is_active: true,
        });
        setDialogOpen(true);
    };

    const openEditDialog = (event: Event) => {
        setEditingEvent(event);
        setData({
            title: event.title,
            description: event.description || '',
            event_date: event.event_date,
            time: event.time || '',
            location: event.location || '',
            department: event.department || '',
            type: event.type,
            is_active: event.is_active,
        });
        setDialogOpen(true);
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (editingEvent) {
            put(`/utilities/events/${editingEvent.id}`, {
                preserveScroll: true,
                onSuccess: () => {
                    setDialogOpen(false);
                    toast.success('Event updated successfully.');
                },
            });
        } else {
            post('/utilities/events', {
                preserveScroll: true,
                onSuccess: () => {
                    setDialogOpen(false);
                    toast.success('Event created successfully.');
                },
            });
        }
    };

    const handleDelete = (event: Event) => {
        if (!confirm(`Delete "${event.title}"? This cannot be undone.`)) return;
        setDeletingId(event.id);
        router.delete(`/utilities/events/${event.id}`, {
            preserveScroll: true,
            onSuccess: () => {
                toast.success('Event deleted.');
                setDeletingId(null);
            },
            onError: () => {
                toast.error('Failed to delete event.');
                setDeletingId(null);
            },
        });
    };

    const filteredEvents = events.filter((e) => {
        if (!searchQuery.trim()) return true;
        const q = searchQuery.toLowerCase();
        return (
            e.title.toLowerCase().includes(q) ||
            e.location?.toLowerCase().includes(q) ||
            e.department?.toLowerCase().includes(q) ||
            e.type.toLowerCase().includes(q)
        );
    });

    return (
        <>
            <Head title="Manage Events" />

            <div className="p-4 md:p-6 lg:p-8 max-w-6xl mx-auto space-y-8">
                {/* Header */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                        <h1 className="text-2xl md:text-3xl font-black tracking-tight text-foreground flex items-center gap-3">
                            <CalendarDays className="w-7 h-7 text-violet-500" />
                            Manage Events
                        </h1>
                        <p className="text-sm text-muted-foreground mt-1">
                            Create, edit, and manage hospital events, trainings, and holidays.
                        </p>
                    </div>
                    <Button onClick={openCreateDialog} className="rounded-xl h-10 px-5 font-bold">
                        <Plus className="w-4 h-4 mr-2" />
                        New Event
                    </Button>
                </div>

                {/* Search & Stats */}
                <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
                    <div className="relative w-full sm:w-72">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                        <Input
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            placeholder="Search events..."
                            className="pl-9 h-10 rounded-xl"
                        />
                    </div>
                    <Badge variant="secondary" className="rounded-full text-xs font-semibold px-4 py-1.5">
                        {filteredEvents.length} {filteredEvents.length === 1 ? 'event' : 'events'}
                    </Badge>
                </div>

                {/* Events Table */}
                <Card className="rounded-2xl border-border/60 shadow-sm overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead>
                                <tr className="border-b border-border/40 bg-muted/20">
                                    <th className="text-left font-bold text-foreground p-4 text-xs uppercase tracking-wider">Title</th>
                                    <th className="text-left font-bold text-foreground p-4 text-xs uppercase tracking-wider">Date</th>
                                    <th className="text-left font-bold text-foreground p-4 text-xs uppercase tracking-wider">Type</th>
                                    <th className="text-left font-bold text-foreground p-4 text-xs uppercase tracking-wider hidden md:table-cell">Location</th>
                                    <th className="text-left font-bold text-foreground p-4 text-xs uppercase tracking-wider hidden lg:table-cell">Department</th>
                                    <th className="text-center font-bold text-foreground p-4 text-xs uppercase tracking-wider">Status</th>
                                    <th className="text-right font-bold text-foreground p-4 text-xs uppercase tracking-wider">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-border/30">
                                {filteredEvents.length === 0 ? (
                                    <tr>
                                        <td colSpan={7} className="p-8 text-center text-sm text-muted-foreground">
                                            {searchQuery ? 'No events match your search.' : 'No events yet. Create your first event!'}
                                        </td>
                                    </tr>
                                ) : (
                                    filteredEvents.map((event) => (
                                        <tr key={event.id} className="hover:bg-muted/30 transition-colors">
                                            <td className="p-4">
                                                <p className="font-bold text-foreground text-sm">{event.title}</p>
                                                {event.description && (
                                                    <p className="text-[11px] text-muted-foreground line-clamp-1 mt-0.5">{event.description}</p>
                                                )}
                                            </td>
                                            <td className="p-4 whitespace-nowrap">
                                                <span className="text-sm font-semibold text-foreground">
                                                    {new Date(event.event_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                                                </span>
                                                {event.time && (
                                                    <p className="text-[10px] text-muted-foreground mt-0.5 flex items-center gap-1">
                                                        <Clock className="w-2.5 h-2.5" /> {event.time}
                                                    </p>
                                                )}
                                            </td>
                                            <td className="p-4">
                                                <Badge className={`text-[10px] font-semibold px-2.5 py-0.5 rounded-full border-0 ${EVENT_TYPE_COLORS[event.type]}`}>
                                                    {getTypeLabel(event.type)}
                                                </Badge>
                                            </td>
                                            <td className="p-4 hidden md:table-cell">
                                                {event.location ? (
                                                    <span className="text-sm text-muted-foreground flex items-center gap-1">
                                                        <MapPin className="w-3 h-3" /> {event.location}
                                                    </span>
                                                ) : (
                                                    <span className="text-sm text-muted-foreground/50">—</span>
                                                )}
                                            </td>
                                            <td className="p-4 hidden lg:table-cell">
                                                {event.department ? (
                                                    <span className="text-sm text-muted-foreground flex items-center gap-1">
                                                        <Users className="w-3 h-3" /> {event.department}
                                                    </span>
                                                ) : (
                                                    <span className="text-sm text-muted-foreground/50">—</span>
                                                )}
                                            </td>
                                            <td className="p-4 text-center">
                                                {event.is_active ? (
                                                    <CheckCircle2 className="w-4 h-4 text-emerald-500 mx-auto" />
                                                ) : (
                                                    <XCircle className="w-4 h-4 text-muted-foreground/40 mx-auto" />
                                                )}
                                            </td>
                                            <td className="p-4 text-right">
                                                <div className="flex items-center justify-end gap-1">
                                                    <Button
                                                        variant="ghost"
                                                        size="icon"
                                                        onClick={() => openEditDialog(event)}
                                                        className="h-8 w-8 rounded-lg"
                                                    >
                                                        <Pencil className="w-3.5 h-3.5" />
                                                    </Button>
                                                    <Button
                                                        variant="ghost"
                                                        size="icon"
                                                        onClick={() => handleDelete(event)}
                                                        disabled={deletingId === event.id}
                                                        className="h-8 w-8 rounded-lg text-destructive hover:text-destructive"
                                                    >
                                                        {deletingId === event.id ? (
                                                            <Loader2 className="w-3.5 h-3.5 animate-spin" />
                                                        ) : (
                                                            <Trash2 className="w-3.5 h-3.5" />
                                                        )}
                                                    </Button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </Card>

                {/* Create/Edit Dialog */}
                <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
                    <DialogContent className="sm:max-w-lg rounded-2xl">
                        <DialogHeader>
                            <DialogTitle className="text-xl font-bold flex items-center gap-2">
                                <CalendarDays className="w-5 h-5 text-violet-500" />
                                {editingEvent ? 'Edit Event' : 'Create Event'}
                            </DialogTitle>
                            <DialogDescription>
                                {editingEvent ? 'Update the event details below.' : 'Fill in the details to create a new event.'}
                            </DialogDescription>
                        </DialogHeader>

                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div className="space-y-2">
                                <label className="text-sm font-semibold text-foreground">Title <span className="text-destructive">*</span></label>
                                <Input
                                    value={data.title}
                                    onChange={(e) => setData('title', e.target.value)}
                                    placeholder="e.g., BLS Training"
                                    required
                                />
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-semibold text-foreground">Description</label>
                                <Textarea
                                    value={data.description}
                                    onChange={(e) => setData('description', e.target.value)}
                                    placeholder="Event description..."
                                    className="min-h-[80px]"
                                />
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <label className="text-sm font-semibold text-foreground">Date <span className="text-destructive">*</span></label>
                                    <Input
                                        type="date"
                                        value={data.event_date}
                                        onChange={(e) => setData('event_date', e.target.value)}
                                        required
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-semibold text-foreground">Time</label>
                                    <Input
                                        value={data.time}
                                        onChange={(e) => setData('time', e.target.value)}
                                        placeholder="e.g., 8:00 AM - 5:00 PM"
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <label className="text-sm font-semibold text-foreground">Location</label>
                                    <Input
                                        value={data.location}
                                        onChange={(e) => setData('location', e.target.value)}
                                        placeholder="e.g., Training Room A"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-semibold text-foreground">Department</label>
                                    <Input
                                        value={data.department}
                                        onChange={(e) => setData('department', e.target.value)}
                                        placeholder="e.g., Nursing"
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <label className="text-sm font-semibold text-foreground">Type <span className="text-destructive">*</span></label>
                                    <Select value={data.type} onValueChange={(val) => setData('type', val)}>
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select type" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {EVENT_TYPES.map((type) => (
                                                <SelectItem key={type} value={type}>
                                                    {getTypeLabel(type)}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="space-y-2 flex items-end pb-1">
                                    <label className="flex items-center gap-2 cursor-pointer">
                                        <input
                                            type="checkbox"
                                            checked={data.is_active}
                                            onChange={(e) => setData('is_active', e.target.checked)}
                                            className="rounded border-border"
                                        />
                                        <span className="text-sm font-semibold text-foreground">Active</span>
                                    </label>
                                </div>
                            </div>

                            <DialogFooter className="pt-2">
                                <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>
                                    Cancel
                                </Button>
                                <Button type="submit" disabled={processing} className="font-bold">
                                    {processing ? (
                                        <>
                                            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                            {editingEvent ? 'Updating...' : 'Creating...'}
                                        </>
                                    ) : (
                                        editingEvent ? 'Update Event' : 'Create Event'
                                    )}
                                </Button>
                            </DialogFooter>
                        </form>
                    </DialogContent>
                </Dialog>

                <Separator className="my-4" />
                <p className="text-center text-xs text-muted-foreground font-medium pb-6">
                    Manage hospital events and important dates.
                </p>
            </div>
        </>
    );
}