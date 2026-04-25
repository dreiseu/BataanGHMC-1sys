import ModulePageHeader from '@/components/module-page-header';
import { Head, router, usePage } from '@inertiajs/react';
import { Search } from 'lucide-react';
import { useMemo, useState } from 'react';

type DirectoryEntry = {
    id: number;
    department: string;
    local_no: string;
    section: string;
    is_active: boolean;
    sort_order: number;
};

type Props = {
    entries: DirectoryEntry[];
};

export default function Directory({ entries }: Props) {
    const { auth } = usePage().props as {
        auth: {
            user: {
                role: string;
            };
        };
    };

    const isAdmin = auth?.user?.role === 'admin';

    const [showAddForm, setShowAddForm] = useState(false);
    const [form, setForm] = useState({
        department: '',
        local_no: '',
        section: 'BataanGHMC',
    });

    const [search, setSearch] = useState('');

    const filteredDirectory = useMemo(() => {
        const keyword = search.toLowerCase().trim();

        if (!keyword) {
            return entries;
        }

        return entries.filter((item) => {
            return (
                item.department.toLowerCase().includes(keyword) ||
                item.local_no.includes(keyword) ||
                item.section.toLowerCase().includes(keyword)
            );
        });
    }, [search, entries]);

    return (
        <>
            <Head title="Directory" />

            <div className="p-6">
                <ModulePageHeader
                    title="Directory"
                    description="Search BataanGHMC department, ward, and office local numbers."
                />

                {isAdmin && (
                    <div className="mb-4 flex justify-end">
                        <button className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground">
                            Add Directory Entry
                        </button>
                    </div>
                )}

                <div className="mb-4 flex items-center gap-2 rounded-xl border bg-card px-3 py-2 shadow-sm">
                    <Search className="h-4 w-4 text-muted-foreground" />

                    <input
                        value={search}
                        onChange={(event) => setSearch(event.target.value)}
                        placeholder="Search department, local number, or section..."
                        className="w-full bg-transparent text-sm outline-none"
                    />
                </div>

                <div className="overflow-hidden rounded-xl border bg-card shadow-sm">
                    <table className="w-full text-sm">
                        <thead className="bg-muted text-left">
                            <tr>
                                <th className="px-4 py-3 font-semibold">
                                    Department / Ward / Office
                                </th>
                                <th className="px-4 py-3 font-semibold text-center">
                                    Local No.
                                </th>
                                <th className="px-4 py-3 font-semibold text-center">
                                    Section
                                </th>
                                {isAdmin && (
                                    <th className="px-4 py-3 text-center font-semibold">
                                        Actions
                                    </th>
                                )}
                            </tr>
                        </thead>

                        <tbody>
                            {filteredDirectory.map((item, index) => (
                                <tr
                                    key={`${item.department}-${item.local_no}-${index}`}
                                    className="border-t"
                                >
                                    <td className="px-4 py-3">
                                        {item.department}
                                    </td>
                                    <td className="px-4 py-3 font-semibold text-center">
                                        {item.local_no}
                                    </td>
                                    <td className="px-4 py-3 text-muted-foreground text-center">
                                        {item.section}
                                    </td>
                                    {isAdmin && (
                                        <td className="px-4 py-3 text-center">
                                            <div className="flex justify-center gap-2">
                                                <button className="rounded-md border px-3 py-1 text-xs">
                                                    Edit
                                                </button>

                                                <button className="rounded-md border px-3 py-1 text-xs text-destructive">
                                                    Delete
                                                </button>
                                            </div>
                                        </td>
                                    )}
                                </tr>
                            ))}

                            {filteredDirectory.length === 0 && (
                                <tr>
                                    <td
                                        colSpan={isAdmin ? 4 : 3}
                                        className="px-4 py-8 text-center text-muted-foreground"
                                    >
                                        No directory records found.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>

                <div className="mt-4 rounded-xl border bg-card p-4 text-sm text-muted-foreground">
                    <p>
                        <strong>BataanGHMC Trunk Lines:</strong> (047) 237-9771,
                        237-9772, 237-1274
                    </p>

                    <p className="mt-1">
                        <strong>BUCAS Trunk Lines:</strong> (047) 240-9200 to
                        9204
                    </p>
                </div>
            </div>
        </>
    );
}