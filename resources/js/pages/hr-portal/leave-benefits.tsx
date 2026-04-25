import ModulePageHeader from '@/components/module-page-header';
import { Head } from '@inertiajs/react';
import { BriefcaseBusiness, HeartHandshake, CalendarDays } from 'lucide-react';

const resources = [
    {
        title: 'Leave Guidelines',
        description: 'Information about leave types, filing rules, and requirements.',
        icon: CalendarDays,
    },
    {
        title: 'Employee Benefits',
        description: 'Resources about compensation, benefits, and welfare programs.',
        icon: HeartHandshake,
    },
    {
        title: 'Service Records',
        description: 'Guidance for requesting service records and employment documents.',
        icon: BriefcaseBusiness,
    },
];

export default function LeaveBenefits() {
    return (
        <>
            <Head title="Leave & Benefits" />

            <div className="p-6">
                <ModulePageHeader
                    title="Leave & Benefits"
                    description="Leave, benefits, and employee welfare resources."
                />

                <div className="grid gap-4 md:grid-cols-3">
                    {resources.map((resource) => {
                        const Icon = resource.icon;

                        return (
                            <div
                                key={resource.title}
                                className="rounded-xl border bg-card p-5 shadow-sm"
                            >
                                <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-lg bg-muted">
                                    <Icon className="h-5 w-5" />
                                </div>

                                <h2 className="font-semibold">
                                    {resource.title}
                                </h2>

                                <p className="mt-2 text-sm text-muted-foreground">
                                    {resource.description}
                                </p>
                            </div>
                        );
                    })}
                </div>
            </div>
        </>
    );
}