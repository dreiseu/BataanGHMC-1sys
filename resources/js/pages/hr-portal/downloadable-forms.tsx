import ModulePageHeader from '@/components/module-page-header';
import { Head } from '@inertiajs/react';
import { Download, Search } from 'lucide-react';
import { useMemo, useState } from 'react';

const forms = [
    {
        title: 'Leave Application Form',
        category: 'Leave',
        fileType: 'PDF',
    },
    {
        title: 'Certificate of Employment Request',
        category: 'Employment',
        fileType: 'PDF',
    },
    {
        title: 'Training Request Form',
        category: 'Training',
        fileType: 'DOCX',
    },
];

export default function DownloadableForms() {

    const [search, setSearch] = useState('');

    const filteredForms = useMemo(() => {
        const keyword = search.toLowerCase().trim();

        if (!keyword) {
            return forms;
        }

        return forms.filter((form) =>
            form.title.toLowerCase().includes(keyword) ||
            form.category.toLowerCase().includes(keyword) ||
            form.fileType.toLowerCase().includes(keyword)
        );
    }, [search]);

    return (
        <>
            <Head title="Downloadable Forms" />

            <div className="p-6">
                <ModulePageHeader
                    title="Downloadable Forms"
                    description="Access HR forms, templates, and request documents."
                />

                <div className="mb-6 flex items-center gap-3 rounded-2xl border bg-card px-4 py-3 shadow-sm transition-colors focus-within:border-[#00D4FF]/50 focus-within:ring-2 focus-within:ring-[#00D4FF]/10">
                    <Search className="h-5 w-5 text-[#1E293B]" />

                    <input
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        placeholder="Search forms..."
                        className="w-full bg-transparent text-sm outline-none placeholder:text-muted-foreground"
                    />
                </div>

                <div className="grid gap-3">
                    {filteredForms.map((form) => (
                        <div
                            key={form.title}
                            className="group flex items-center justify-between rounded-2xl border bg-card p-5 shadow-sm transition-all hover:border-[#00D4FF]/30 hover:shadow-md"
                        >
                            <div>
                                <h2 className="font-semibold text-foreground group-hover:text-[#1E293B] transition-colors">
                                    {form.title}
                                </h2>

                                <p className="text-sm text-muted-foreground mt-1">
                                    {form.category} • <span className="font-medium text-[#00D4FF]">{form.fileType}</span>
                                </p>
                            </div>

                            <button className="inline-flex items-center gap-2 rounded-xl border bg-transparent px-4 py-2 text-sm font-medium transition-colors hover:bg-[#1E293B] hover:text-white hover:border-[#1E293B]">
                                <Download className="h-4 w-4" />
                                Download
                            </button>
                        </div>
                    ))}
                </div>
            </div>
        </>
    );
}