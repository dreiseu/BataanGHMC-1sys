import { useState, useMemo } from 'react';
import { Head } from '@inertiajs/react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Separator } from '@/components/ui/separator';
import {
    ChevronLeft,
    ChevronRight,
    CalendarDays,
    MapPin,
    Clock,
    Users,
} from 'lucide-react';

interface CalendarEvent {
    id: number;
    title: string;
    description: string | null;
    event_date: string;
    time: string | null;
    location: string | null;
    department: string | null;
    type: string;
    is_active: boolean;
}

interface Props {
    events: CalendarEvent[];
}

const EVENT_TYPES = ['all', 'training', 'meeting', 'event', 'holiday', 'seminar'] as const;
type EventTypeFilter = (typeof EVENT_TYPES)[number];

const EVENT_TYPE_COLORS: Record<string, string> = {
    training: 'bg-blue-500/15 text-blue-600 dark:text-blue-400 border-blue-500/30',
    meeting: 'bg-violet-500/15 text-violet-600 dark:text-violet-400 border-violet-500/30',
    event: 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border-emerald-500/30',
    holiday: 'bg-rose-500/15 text-rose-600 dark:text-rose-400 border-rose-500/30',
    seminar: 'bg-amber-500/15 text-amber-600 dark:text-amber-400 border-amber-500/30',
};

const MONTH_NAMES = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
const DAY_NAMES = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

function getTypeLabel(type: string): string {
    return type.charAt(0).toUpperCase() + type.slice(1);
}

function parseEventDate(event: CalendarEvent): { day: number; month: number; year: number } {
    const d = new Date(event.event_date);
    return { day: d.getDate(), month: d.getMonth(), year: d.getFullYear() };
}

export default function Events({ events }: Props) {
    const today = new Date();
    const [currentMonth, setCurrentMonth] = useState(today.getMonth());
    const [currentYear, setCurrentYear] = useState(today.getFullYear());
    const [selectedDate, setSelectedDate] = useState<{ day: number; month: number; year: number } | null>(null);
    const [typeFilter, setTypeFilter] = useState<EventTypeFilter>('all');
    const [dialogOpen, setDialogOpen] = useState(false);

    const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
    const firstDayOfWeek = new Date(currentYear, currentMonth, 1).getDay();

    const filteredEvents = useMemo(() => {
        return events.filter((e) => {
            const { day, month, year } = parseEventDate(e);
            if (month !== currentMonth || year !== currentYear) return false;
            if (typeFilter !== 'all' && e.type !== typeFilter) return false;
            return true;
        });
    }, [events, currentMonth, currentYear, typeFilter]);

    const eventsByDate = useMemo(() => {
        const map: Record<number, CalendarEvent[]> = {};
        filteredEvents.forEach((e) => {
            const { day } = parseEventDate(e);
            if (!map[day]) map[day] = [];
            map[day].push(e);
        });
        return map;
    }, [filteredEvents]);

    const selectedEvents = selectedDate
        ? events.filter((e) => {
            const { day, month, year } = parseEventDate(e);
            return day === selectedDate.day && month === selectedDate.month && year === selectedDate.year;
        })
        : [];

    const prevMonth = () => {
        if (currentMonth === 0) {
            setCurrentMonth(11);
            setCurrentYear((y) => y - 1);
        } else {
            setCurrentMonth((m) => m - 1);
        }
    };

    const nextMonth = () => {
        if (currentMonth === 11) {
            setCurrentMonth(0);
            setCurrentYear((y) => y + 1);
        } else {
            setCurrentMonth((m) => m + 1);
        }
    };

    const goToToday = () => {
        setCurrentMonth(today.getMonth());
        setCurrentYear(today.getFullYear());
    };

    const handleDayClick = (day: number) => {
        const dayEvents = events.filter((e) => {
            const { day: d, month, year } = parseEventDate(e);
            return d === day && month === currentMonth && year === currentYear;
        });
        if (dayEvents.length > 0) {
            setSelectedDate({ day, month: currentMonth, year: currentYear });
            setDialogOpen(true);
        }
    };

    const calendarDays = [];
    for (let i = 0; i < firstDayOfWeek; i++) {
        calendarDays.push(<div key={`empty-${i}`} className="h-10 md:h-14" />);
    }
    for (let day = 1; day <= daysInMonth; day++) {
        const dayEvents = eventsByDate[day] || [];
        const isToday = day === today.getDate() && currentMonth === today.getMonth() && currentYear === today.getFullYear();
        const hasEvents = dayEvents.length > 0;

        calendarDays.push(
            <button
                key={day}
                onClick={() => handleDayClick(day)}
                className={`relative h-10 md:h-14 rounded-xl flex flex-col items-center justify-start pt-1 md:pt-2 text-sm transition-all duration-150 ${isToday
                    ? 'bg-foreground text-background font-bold shadow-sm'
                    : hasEvents
                        ? 'bg-primary/5 hover:bg-primary/10 text-foreground font-medium'
                        : 'hover:bg-muted/60 text-muted-foreground'
                    } ${hasEvents ? 'cursor-pointer' : 'cursor-default'}`}
            >
                <span className="text-xs md:text-sm leading-none">{day}</span>
                {hasEvents && (
                    <div className="flex gap-0.5 mt-1 flex-wrap justify-center px-0.5">
                        {dayEvents.slice(0, 3).map((e, i) => (
                            <span
                                key={i}
                                className={`w-1.5 h-1.5 rounded-full ${e.type === 'training' ? 'bg-blue-500' :
                                    e.type === 'meeting' ? 'bg-violet-500' :
                                        e.type === 'event' ? 'bg-emerald-500' :
                                            e.type === 'holiday' ? 'bg-rose-500' :
                                                'bg-amber-500'
                                    }`}
                            />
                        ))}
                        {dayEvents.length > 3 && (
                            <span className="text-[8px] text-muted-foreground font-bold">+{dayEvents.length - 3}</span>
                        )}
                    </div>
                )}
            </button>
        );
    }

    return (
        <>
            <Head title="Events Calendar" />

            <div className="p-4 md:p-6 lg:p-8 max-w-6xl mx-auto space-y-8">
                {/* ==================== HERO HEADER ==================== */}
                <Card className="relative overflow-hidden rounded-3xl border border-border/10 bg-gradient-to-br from-[#1E293B] to-[#0F172A] shadow-lg">
                    <div className="absolute inset-0 overflow-hidden pointer-events-none">
                        <div className="absolute -top-24 -right-24 h-64 w-64 rounded-full bg-violet-500/20 blur-3xl mix-blend-screen" />
                        <div className="absolute -bottom-24 -left-24 h-64 w-64 rounded-full bg-blue-500/20 blur-3xl mix-blend-screen" />
                    </div>
                    <div className="p-6 md:p-10 relative z-10">
                        <div className="flex flex-col md:flex-row items-start md:items-center gap-6">
                            <div className="h-20 w-20 rounded-2xl bg-gradient-to-br from-violet-400 to-blue-500 shadow-lg flex items-center justify-center shrink-0">
                                <CalendarDays className="w-10 h-10 text-white" />
                            </div>
                            <div className="space-y-2">
                                <Badge className="bg-violet-500/20 text-violet-400 hover:bg-violet-500/30 border-0 text-xs font-semibold px-3 py-1">
                                    Hospital Events
                                </Badge>
                                <h1 className="text-3xl md:text-4xl font-black tracking-tight text-white">
                                    Events <span className="text-transparent bg-clip-text bg-gradient-to-r from-violet-400 to-blue-400">Calendar</span>
                                </h1>
                                <p className="text-white/70 text-base font-medium max-w-lg">
                                    Stay updated with hospital events, trainings, meetings, and important dates.
                                </p>
                            </div>
                        </div>
                    </div>
                </Card>

                {/* ==================== CALENDAR CARD ==================== */}
                <Card className="rounded-2xl border-border/60 shadow-sm overflow-hidden">
                    {/* Calendar Header */}
                    <div className="p-4 md:p-6 border-b border-border/40 bg-muted/20">
                        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                            <div className="flex items-center gap-3">
                                <Button variant="ghost" size="icon" onClick={prevMonth} className="h-9 w-9 rounded-xl">
                                    <ChevronLeft className="w-5 h-5" />
                                </Button>
                                <h2 className="text-xl md:text-2xl font-bold text-foreground min-w-[180px] text-center">
                                    {MONTH_NAMES[currentMonth]} {currentYear}
                                </h2>
                                <Button variant="ghost" size="icon" onClick={nextMonth} className="h-9 w-9 rounded-xl">
                                    <ChevronRight className="w-5 h-5" />
                                </Button>
                            </div>
                            <div className="flex items-center gap-2 w-full sm:w-auto">
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={goToToday}
                                    className="rounded-full text-xs font-semibold h-8 px-4"
                                >
                                    Today
                                </Button>
                                <div className="flex items-center gap-1 ml-2 overflow-x-auto">
                                    {EVENT_TYPES.map((type) => (
                                        <button
                                            key={type}
                                            onClick={() => setTypeFilter(type)}
                                            className={`text-[10px] md:text-xs font-semibold px-2.5 py-1 rounded-full whitespace-nowrap transition-all ${typeFilter === type
                                                ? 'bg-foreground text-background'
                                                : 'bg-muted text-muted-foreground hover:bg-muted/80'
                                                }`}
                                        >
                                            {type === 'all' ? 'All' : getTypeLabel(type)}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Calendar Grid */}
                    <div className="p-4 md:p-6">
                        <div className="grid grid-cols-7 gap-1 md:gap-2 mb-2">
                            {DAY_NAMES.map((name) => (
                                <div key={name} className="text-center text-[10px] md:text-xs font-bold text-muted-foreground uppercase tracking-wider py-1">
                                    {name}
                                </div>
                            ))}
                        </div>
                        <div className="grid grid-cols-7 gap-1 md:gap-2">
                            {calendarDays}
                        </div>
                    </div>

                    {/* Legend */}
                    <div className="px-4 md:px-6 pb-4 md:pb-6 flex flex-wrap gap-3">
                        {EVENT_TYPES.filter((t) => t !== 'all').map((type) => (
                            <div key={type} className="flex items-center gap-1.5">
                                <span className={`w-2.5 h-2.5 rounded-full ${type === 'training' ? 'bg-blue-500' :
                                    type === 'meeting' ? 'bg-violet-500' :
                                        type === 'event' ? 'bg-emerald-500' :
                                            type === 'holiday' ? 'bg-rose-500' :
                                                'bg-amber-500'
                                    }`} />
                                <span className="text-[11px] font-medium text-muted-foreground">{getTypeLabel(type)}</span>
                            </div>
                        ))}
                    </div>
                </Card>

                {/* ==================== UPCOMING EVENTS LIST ==================== */}
                <div>
                    <h2 className="text-xl font-bold text-foreground mb-4 flex items-center gap-2">
                        <CalendarDays className="w-5 h-5 text-violet-500" />
                        Upcoming Events This Month
                        <Badge variant="secondary" className="rounded-full text-xs font-semibold ml-1">
                            {filteredEvents.length}
                        </Badge>
                    </h2>

                    {filteredEvents.length === 0 ? (
                        <Card className="rounded-2xl border-dashed border-2 border-border/40 bg-muted/20 py-12">
                            <CardContent className="flex flex-col items-center justify-center text-center">
                                <CalendarDays className="w-12 h-12 text-muted-foreground/40 mb-3" />
                                <h3 className="text-lg font-bold text-foreground mb-1">No events this month</h3>
                                <p className="text-sm text-muted-foreground">No events match the selected filter.</p>
                            </CardContent>
                        </Card>
                    ) : (
                        <div className="space-y-3">
                            {filteredEvents
                                .sort((a, b) => {
                                    const aDate = new Date(a.event_date).getTime();
                                    const bDate = new Date(b.event_date).getTime();
                                    return aDate - bDate;
                                })
                                .map((event) => {
                                    const { day, month } = parseEventDate(event);
                                    return (
                                        <Card key={event.id} className="rounded-xl border-border/50 shadow-sm hover:shadow-md transition-all duration-200">
                                            <CardContent className="p-4 md:p-5 flex flex-col sm:flex-row sm:items-center gap-4">
                                                <div className="flex sm:flex-col items-center sm:items-center gap-1 sm:gap-0 sm:w-16 shrink-0">
                                                    <span className="text-2xl md:text-3xl font-black text-foreground leading-none">
                                                        {day}
                                                    </span>
                                                    <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">
                                                        {MONTH_NAMES[month].slice(0, 3)}
                                                    </span>
                                                </div>

                                                <div className="hidden sm:block w-px h-12 bg-border/60" />

                                                <div className="flex-1 min-w-0">
                                                    <div className="flex flex-wrap items-center gap-2 mb-1">
                                                        <h3 className="font-bold text-foreground text-sm md:text-base truncate">
                                                            {event.title}
                                                        </h3>
                                                        <Badge className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border ${EVENT_TYPE_COLORS[event.type]}`}>
                                                            {getTypeLabel(event.type)}
                                                        </Badge>
                                                    </div>
                                                    <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-muted-foreground">
                                                        {event.time && (
                                                            <span className="flex items-center gap-1">
                                                                <Clock className="w-3 h-3" /> {event.time}
                                                            </span>
                                                        )}
                                                        {event.location && (
                                                            <span className="flex items-center gap-1">
                                                                <MapPin className="w-3 h-3" /> {event.location}
                                                            </span>
                                                        )}
                                                        {event.department && (
                                                            <span className="flex items-center gap-1">
                                                                <Users className="w-3 h-3" /> {event.department}
                                                            </span>
                                                        )}
                                                    </div>
                                                </div>

                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    onClick={() => {
                                                        setSelectedDate({ day, month, year: new Date(event.event_date).getFullYear() });
                                                        setDialogOpen(true);
                                                    }}
                                                    className="shrink-0 rounded-full text-xs font-semibold h-8 px-4"
                                                >
                                                    View
                                                </Button>
                                            </CardContent>
                                        </Card>
                                    );
                                })}
                        </div>
                    )}
                </div>

                {/* ==================== EVENT DETAIL DIALOG ==================== */}
                <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
                    <DialogContent className="sm:max-w-lg rounded-2xl">
                        <DialogHeader>
                            <DialogTitle className="text-xl font-bold flex items-center gap-2">
                                <CalendarDays className="w-5 h-5 text-violet-500" />
                                {selectedDate && `${MONTH_NAMES[selectedDate.month]} ${selectedDate.day}, ${selectedDate.year}`}
                            </DialogTitle>
                            <DialogDescription>
                                {selectedEvents.length} event{selectedEvents.length !== 1 ? 's' : ''} on this day
                            </DialogDescription>
                        </DialogHeader>

                        <div className="space-y-4 max-h-[60vh] overflow-y-auto pr-2">
                            {selectedEvents.length === 0 ? (
                                <p className="text-sm text-muted-foreground text-center py-6">No events on this day.</p>
                            ) : (
                                selectedEvents.map((event) => (
                                    <div key={event.id} className="p-4 rounded-xl bg-muted/30 border border-border/40 space-y-3">
                                        <div className="flex items-start justify-between gap-2">
                                            <h4 className="font-bold text-foreground text-sm">{event.title}</h4>
                                            <Badge className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border shrink-0 ${EVENT_TYPE_COLORS[event.type]}`}>
                                                {getTypeLabel(event.type)}
                                            </Badge>
                                        </div>
                                        {event.description && (
                                            <p className="text-sm text-muted-foreground">{event.description}</p>
                                        )}
                                        <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted-foreground">
                                            {event.time && (
                                                <span className="flex items-center gap-1">
                                                    <Clock className="w-3 h-3" /> {event.time}
                                                </span>
                                            )}
                                            {event.location && (
                                                <span className="flex items-center gap-1">
                                                    <MapPin className="w-3 h-3" /> {event.location}
                                                </span>
                                            )}
                                            {event.department && (
                                                <span className="flex items-center gap-1">
                                                    <Users className="w-3 h-3" /> {event.department}
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </DialogContent>
                </Dialog>

                {/* ==================== FOOTER ==================== */}
                <Separator className="my-4" />
                <p className="text-center text-xs text-muted-foreground font-medium pb-6">
                    Stay informed. Stay connected. &mdash; BataanGHMC Events Calendar
                </p>
            </div>
        </>
    );
}