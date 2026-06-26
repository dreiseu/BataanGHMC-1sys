import ModulePageHeader from '@/components/module-page-header';
import { Head } from '@inertiajs/react';
import { FileText } from 'lucide-react';

const policies = [
    {
        title: 'Attendance and Punctuality Policy',
        type: 'Policy',
        date: '2026',
    },
    {
        title: 'Employee Code of Conduct',
        type: 'Policy',
        date: '2026',
    },
    {
        title: 'HR Office Advisory',
        type: 'Memorandum',
        date: '2026',
    },
];

export default function Policies() {
    return (
        <>
            <Head title="Policies & Memoranda" />

            <div className="p-6">
                <ModulePageHeader
                    title="Policies & Memoranda"
                    description="Official HR policies, advisories, and memoranda."
                />

                <div className="grid gap-3">
                    {policies.map((policy) => (
                        <div
                            key={policy.title}
                            className="group flex items-center gap-4 rounded-2xl border bg-card p-5 shadow-sm transition-all hover:border-[#00D4FF]/30 hover:shadow-md cursor-pointer"
                        >
                            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[#1E293B]/10 text-[#1E293B] transition-colors group-hover:bg-[#00D4FF]/10 group-hover:text-[#00D4FF]">
                                <FileText className="h-6 w-6 transition-transform group-hover:scale-110" />
                            </div>

                            <div>
                                <h2 className="font-semibold text-foreground group-hover:text-[#1E293B] transition-colors">
                                    {policy.title}
                                </h2>

                                <p className="text-sm text-muted-foreground mt-1">
                                    {policy.type} • <span className="text-[#00D4FF] font-medium">{policy.date}</span>
                                </p>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </>
    );
}