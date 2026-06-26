import ModulePageHeader from '@/components/module-page-header';
import { Head } from '@inertiajs/react';
import { Bell } from 'lucide-react';

const announcements = [
    {
        title: 'Updated Leave Filing Schedule',
        date: 'April 2026',
    },
    {
        title: 'Mandatory Employee Orientation',
        date: 'April 2026',
    },
    {
        title: 'HR Office Advisory on Benefits',
        date: 'March 2026',
    },
];

export default function Announcements() {
    return (
        <>
            <Head title="HR Announcements" />

            <div className="p-6">
                <ModulePageHeader
                    title="HR Announcements"
                    description="Official Human Resource announcements and advisories."
                />

                <div className="grid gap-3">
                    {announcements.map((item) => (
                        <div
                            key={item.title}
                            className="group flex items-center gap-4 rounded-2xl border bg-card p-5 shadow-sm transition-all hover:border-[#00D4FF]/30 hover:shadow-md cursor-pointer"
                        >
                            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[#1E293B]/10 text-[#1E293B] transition-colors group-hover:bg-[#00D4FF]/10 group-hover:text-[#00D4FF]">
                                <Bell className="h-6 w-6 transition-transform group-hover:scale-110" />
                            </div>

                            <div>
                                <h2 className="font-semibold text-foreground group-hover:text-[#1E293B] transition-colors">
                                    {item.title}
                                </h2>

                                <p className="text-sm text-muted-foreground mt-1 font-medium">
                                    {item.date}
                                </p>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </>
    );
}