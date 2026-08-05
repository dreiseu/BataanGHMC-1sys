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
const DAY_NAMES = ['SU', 'MO', 'TU', 'WE', 'TH', 'FR', 'SA'];

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
    const [selectedDate, setSelectedDate] = useState<number>(today.getDate());

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
        calendarDays.push(<div key={`empty-${i}`} className="h-9 w-9 mx-auto" />);
    }
    for (let day = 1; day <= daysInMonth; day++) {
        const dayEvents = eventsByDate[day] || [];
        const isSelected = day === selectedDate;
        const isToday = day === today.getDate() && currentMonth === today.getMonth() && currentYear === today.getFullYear();
        const hasEvents = dayEvents.length > 0;

        calendarDays.push(
            <div
                key={day}
                onClick={() => setSelectedDate(day)}
                className={`h-9 w-9 mx-auto rounded-xl flex flex-col items-center justify-center text-sm transition-all cursor-pointer ${isSelected
                    ? 'bg-[#00D4FF] text-[#0F172A] font-extrabold shadow-md shadow-[#00D4FF]/30 scale-105'
                    : isToday
                        ? 'font-bold text-[#00D4FF] bg-[#00D4FF]/10 hover:bg-muted/80'
                        : hasEvents
                            ? 'text-foreground font-semibold hover:bg-muted/80'
                            : 'text-muted-foreground/80 hover:bg-muted/80'
                    }`}
            >
                <span className="leading-none">{day}</span>
                {hasEvents && !isSelected && (
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
        <div className="rounded-[24px] border border-border/50 bg-card p-5 shadow-xl shadow-black/5 flex flex-col min-w-[280px]">
            {/* Header */}
            <div className="flex items-center justify-between mb-4">
                <h2 className="text-base font-extrabold tracking-tight flex items-center gap-2 text-foreground">
                    <CalendarDays className="h-5 w-5 text-[#00D4FF]" />
                    Calendar
                </h2>
                <Link href="/events" className="text-xs font-semibold text-muted-foreground hover:text-[#00D4FF] transition-colors">
                    View All
                </Link>
            </div>

            {/* Month Navigation */}
            <div className="flex items-center justify-center gap-3 mb-3 px-1">
                <button onClick={prevMonth} className="h-7 w-7 rounded-full hover:bg-muted flex items-center justify-center transition-colors cursor-pointer text-muted-foreground hover:text-foreground">
                    <ChevronLeft className="w-4 h-4" />
                </button>
                <span className="text-sm font-bold text-foreground tracking-tight px-1">
                    {MONTH_NAMES[currentMonth]} {currentYear}
                </span>
                <button onClick={nextMonth} className="h-7 w-7 rounded-full hover:bg-muted flex items-center justify-center transition-colors cursor-pointer text-muted-foreground hover:text-foreground">
                    <ChevronRight className="w-4 h-4" />
                </button>
            </div>

            {/* Day Names */}
            <div className="grid grid-cols-7 gap-0 mb-1">
                {DAY_NAMES.map((name) => (
                    <div key={name} className="text-center text-[11px] font-bold text-muted-foreground/60 uppercase tracking-wider py-1">
                        {name}
                    </div>
                ))}
            </div>

            {/* Calendar Grid */}
            <div className="grid grid-cols-7 gap-y-1">
                {calendarDays}
            </div>

            {/* Upcoming Events */}
            {upcomingEvents.length > 0 && (
                <div className="mt-4 pt-3 border-t border-border/40 space-y-2">
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