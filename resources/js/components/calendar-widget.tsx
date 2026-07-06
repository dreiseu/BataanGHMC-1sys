import { useState, useMemo } from 'react';
import { Link } from '@inertiajs/react';
import { CalendarDays, ChevronLeft, ChevronRight, Clock } from 'lucide-react';

interface CalendarEvent {
    id: number;
    title: string;
    event_date: string;
    time: string | null;
    type: string;
}

interface Props {
    events?: CalendarEvent[];
}

const MONTH_NAMES = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
const DAY_NAMES = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

const TYPE_DOT_COLORS: Record<string, string> = {
    training: 'bg-blue-500',
    meeting: 'bg-violet-500',
    event: 'bg-emerald-500',
    holiday: 'bg-rose-500',
    seminar: 'bg-amber-500',
};

export function CalendarWidget({ events = [] }: Props) {
    const today = new Date();
    const [currentMonth, setCurrentMonth] = useState(today.getMonth());
    const [currentYear, setCurrentYear] = useState(today.getFullYear());

    const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
    const firstDayOfWeek = new Date(currentYear, currentMonth, 1).getDay();

    const eventsByDate = useMemo(() => {
        const map: Record<number, CalendarEvent[]> = {};
        events
            .filter((e) => {
                const d = new Date(e.event_date);
                return d.getMonth() === currentMonth && d.getFullYear() === currentYear;
            })
            .forEach((e) => {
                const day = new Date(e.event_date).getDate();
                if (!map[day]) map[day] = [];
                map[day].push(e);
            });
        return map;
    }, [events, currentMonth, currentYear]);

    const upcomingEvents = useMemo(() => {
        const now = new Date();
        return events
            .filter((e) => new Date(e.event_date) >= now)
            .sort((a, b) => new Date(a.event_date).getTime() - new Date(b.event_date).getTime())
            .slice(0, 3);
    }, [events]);

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

    const calendarDays = [];
    for (let i = 0; i < firstDayOfWeek; i++) {
        calendarDays.push(<div key={`empty-${i}`} className="h-7" />);
    }
    for (let day = 1; day <= daysInMonth; day++) {
        const dayEvents = eventsByDate[day] || [];
        const isToday = day === today.getDate() && currentMonth === today.getMonth() && currentYear === today.getFullYear();
        const hasEvents = dayEvents.length > 0;

        calendarDays.push(
            <div
                key={day}
                className={`h-7 rounded-md flex flex-col items-center justify-center text-[11px] transition-all ${isToday
                    ? 'bg-[#00D4FF] text-[#0F172A] font-bold shadow-sm'
                    : hasEvents
                        ? 'text-foreground font-semibold'
                        : 'text-muted-foreground/60'
                    }`}
            >
                <span className="leading-none">{day}</span>
                {hasEvents && (
                    <div className="flex gap-[2px] mt-[2px]">
                        {dayEvents.slice(0, 2).map((e, i) => (
                            <span key={i} className={`w-1 h-1 rounded-full ${TYPE_DOT_COLORS[e.type] || 'bg-muted'}`} />
                        ))}
                    </div>
                )}
            </div>
        );
    }

    return (
        <div className="rounded-3xl border bg-card p-5 shadow-sm flex flex-col">
            {/* Header */}
            <div className="flex items-center justify-between mb-3">
                <h2 className="text-sm font-bold tracking-tight flex items-center gap-2">
                    <CalendarDays className="h-4 w-4 text-[#00D4FF]" />
                    Calendar
                </h2>
                <Link href="/events" className="text-[10px] font-semibold text-muted-foreground hover:text-[#00D4FF] transition-colors">
                    View All
                </Link>
            </div>

            {/* Month Navigation */}
            <div className="flex items-center justify-between mb-2">
                <button onClick={prevMonth} className="h-6 w-6 rounded-md hover:bg-muted flex items-center justify-center transition-colors">
                    <ChevronLeft className="w-3.5 h-3.5 text-muted-foreground" />
                </button>
                <span className="text-xs font-bold text-foreground">
                    {MONTH_NAMES[currentMonth]} {currentYear}
                </span>
                <button onClick={nextMonth} className="h-6 w-6 rounded-md hover:bg-muted flex items-center justify-center transition-colors">
                    <ChevronRight className="w-3.5 h-3.5 text-muted-foreground" />
                </button>
            </div>

            {/* Day Names */}
            <div className="grid grid-cols-7 gap-0 mb-1">
                {DAY_NAMES.map((name) => (
                    <div key={name} className="text-center text-[9px] font-bold text-muted-foreground/50 uppercase tracking-wider py-0.5">
                        {name.slice(0, 2)}
                    </div>
                ))}
            </div>

            {/* Calendar Grid */}
            <div className="grid grid-cols-7 gap-0">
                {calendarDays}
            </div>

            {/* Upcoming Events */}
            {upcomingEvents.length > 0 && (
                <div className="mt-3 pt-3 border-t border-border/40 space-y-2">
                    <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Upcoming</p>
                    {upcomingEvents.map((event) => {
                        const eventDate = new Date(event.event_date);
                        return (
                            <div key={event.id} className="flex items-start gap-2.5">
                                <span className={`w-2 h-2 rounded-full mt-1 shrink-0 ${TYPE_DOT_COLORS[event.type] || 'bg-muted'}`} />
                                <div className="min-w-0 flex-1">
                                    <p className="text-[11px] font-semibold text-foreground truncate leading-tight">{event.title}</p>
                                    <p className="text-[9px] text-muted-foreground flex items-center gap-1 mt-0.5">
                                        <CalendarDays className="w-2.5 h-2.5" />
                                        {MONTH_NAMES[eventDate.getMonth()].slice(0, 3)} {eventDate.getDate()}
                                        {event.time && (
                                            <>
                                                <span className="mx-0.5">&middot;</span>
                                                <Clock className="w-2.5 h-2.5" />
                                                {event.time}
                                            </>
                                        )}
                                    </p>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
}