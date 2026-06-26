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
                                className="group relative overflow-hidden rounded-2xl border bg-card p-5 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-md hover:border-[#00D4FF]/40 cursor-pointer"
                            >
                                <div className="absolute inset-0 bg-gradient-to-br from-[#00D4FF]/5 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100 pointer-events-none" />
                                
                                <div className="relative z-10">
                                    <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-[#1E293B]/10 text-[#1E293B] transition-colors duration-300 group-hover:bg-[#00D4FF]/10 group-hover:text-[#00D4FF]">
                                        <Icon className="h-6 w-6 transition-transform duration-300 group-hover:scale-110" />
                                    </div>

                                <h2 className="font-semibold">
                                    {resource.title}
                                </h2>

                                <p className="mt-2 text-sm text-muted-foreground">
                                    {resource.description}
                                </p>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>
        </>
    );
}