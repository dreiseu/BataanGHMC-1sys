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
                            className="flex items-center gap-4 rounded-xl border bg-card p-4 shadow-sm"
                        >
                            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-muted">
                                <Bell className="h-5 w-5" />
                            </div>

                            <div>
                                <h2 className="font-semibold">
                                    {item.title}
                                </h2>

                                <p className="text-sm text-muted-foreground">
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