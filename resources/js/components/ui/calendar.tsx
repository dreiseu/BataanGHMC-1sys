import * as React from 'react';
import { DayPicker, useDayPicker } from 'react-day-picker';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { buttonVariants } from '@/components/ui/button';

export type CalendarProps = React.ComponentProps<typeof DayPicker>;

function CalendarHeader(props: { calendarMonth: { date: Date } }) {
    const { previousMonth, nextMonth, goToMonth } = useDayPicker();

    return (
        <div className="flex items-center justify-center gap-3 pt-1 pb-2">
            <button
                type="button"
                disabled={!previousMonth}
                onClick={() => previousMonth && goToMonth(previousMonth)}
                className="h-7 w-7 rounded-full hover:bg-muted/80 flex items-center justify-center transition-colors cursor-pointer text-muted-foreground hover:text-foreground disabled:opacity-30 disabled:cursor-not-allowed border-0"
                aria-label="Previous Month"
            >
                <ChevronLeft className="h-4 w-4" />
            </button>
            <span className="text-sm font-bold text-foreground tracking-tight px-1">
                {format(props.calendarMonth.date, 'MMMM yyyy')}
            </span>
            <button
                type="button"
                disabled={!nextMonth}
                onClick={() => nextMonth && goToMonth(nextMonth)}
                className="h-7 w-7 rounded-full hover:bg-muted/80 flex items-center justify-center transition-colors cursor-pointer text-muted-foreground hover:text-foreground disabled:opacity-30 disabled:cursor-not-allowed border-0"
                aria-label="Next Month"
            >
                <ChevronRight className="h-4 w-4" />
            </button>
        </div>
    );
}

function Calendar({
    className,
    classNames,
    showOutsideDays = false,
    ...props
}: CalendarProps) {
    return (
        <DayPicker
            showOutsideDays={showOutsideDays}
            className={cn('p-0', className)}
            formatters={{
                formatWeekdayName: (date) => {
                    const days = ['SU', 'MO', 'TU', 'WE', 'TH', 'FR', 'SA'];
                    return days[date.getDay()];
                },
                ...props.formatters,
            }}
            classNames={{
                root: cn('p-4 bg-card rounded-[24px] border border-border/50 shadow-xl shadow-black/5 min-w-[280px]', classNames?.root),
                months: 'flex flex-col sm:flex-row space-y-4 sm:space-x-4 sm:space-y-0',
                month: 'space-y-3',
                month_caption: 'flex justify-center items-center',
                month_grid: 'w-full border-collapse space-y-1',
                weekdays: 'flex justify-between mb-1',
                weekday: 'text-muted-foreground/60 w-9 font-bold text-[11px] uppercase tracking-wider text-center py-1',
                weeks: '',
                week: 'flex mt-1 justify-between',
                day: cn(
                    'relative p-0 text-center text-sm focus-within:relative focus-within:z-20 [&:has([aria-selected])]:bg-transparent',
                    props.mode === 'range'
                        ? '[&:has(>.day-range-end)]:rounded-r-xl [&:has(>.day-range-start)]:rounded-l-xl first:[&:has([aria-selected])]:rounded-l-xl last:[&:has([aria-selected])]:rounded-r-xl'
                        : '[&:has([aria-selected])]:rounded-xl'
                ),
                day_button: cn(
                    buttonVariants({ variant: 'ghost' }),
                    'h-9 w-9 p-0 font-medium text-sm rounded-xl transition-all hover:bg-muted/80 hover:text-foreground focus:bg-muted focus:text-foreground cursor-pointer flex items-center justify-center aria-selected:!bg-[#00D4FF] aria-selected:!text-[#0F172A] aria-selected:!font-extrabold aria-selected:!rounded-xl aria-selected:!shadow-md aria-selected:!shadow-[#00D4FF]/30'
                ),
                range_end: 'day-range-end',
                range_start: 'day-range-start',
                selected:
                    '!bg-[#00D4FF] !text-[#0F172A] !font-extrabold !rounded-xl !shadow-md !shadow-[#00D4FF]/30 hover:!bg-[#00D4FF] hover:!text-[#0F172A] focus:!bg-[#00D4FF] focus:!text-[#0F172A]',
                today: 'font-bold text-[#00D4FF] bg-[#00D4FF]/10 rounded-xl',
                outside:
                    'day-outside text-muted-foreground/40 opacity-40 aria-selected:bg-[#00D4FF]/50 aria-selected:text-[#0F172A] aria-selected:opacity-60',
                disabled: 'text-muted-foreground/30 opacity-30',
                range_middle:
                    'aria-selected:bg-[#00D4FF]/20 aria-selected:text-foreground',
                hidden: 'invisible',
                ...classNames,
            }}
            components={{
                MonthCaption: CalendarHeader,
                Nav: () => null,
                ...props.components,
            }}
            {...props}
        />
    );
}
Calendar.displayName = 'Calendar';

export { Calendar };