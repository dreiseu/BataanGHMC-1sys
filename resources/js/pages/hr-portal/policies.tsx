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
                            className="flex items-center gap-4 rounded-xl border bg-card p-4 shadow-sm"
                        >
                            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-muted">
                                <FileText className="h-5 w-5" />
                            </div>

                            <div>
                                <h2 className="font-semibold">
                                    {policy.title}
                                </h2>

                                <p className="text-sm text-muted-foreground">
                                    {policy.type} • {policy.date}
                                </p>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </>
    );
}