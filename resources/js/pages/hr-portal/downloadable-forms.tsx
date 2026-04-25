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

                <div className="mb-4 flex items-center gap-2 rounded-xl border bg-card px-3 py-2 shadow-sm">
                    <Search className="h-4 w-4 text-muted-foreground" />

                    <input
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        placeholder="Search forms..."
                        className="w-full bg-transparent text-sm outline-none"
                    />
                </div>

                <div className="grid gap-3">
                    {filteredForms.map((form) => (
                        <div
                            key={form.title}
                            className="flex items-center justify-between rounded-xl border bg-card p-4 shadow-sm"
                        >
                            <div>
                                <h2 className="font-semibold">
                                    {form.title}
                                </h2>

                                <p className="text-sm text-muted-foreground">
                                    {form.category} • {form.fileType}
                                </p>
                            </div>

                            <button className="inline-flex items-center gap-2 rounded-lg border px-3 py-2 text-sm">
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