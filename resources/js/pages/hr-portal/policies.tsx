import LineWaves from '@/components/ui/linewaves';
import { Head, usePage } from '@inertiajs/react';
import { Download, Search, FileText } from 'lucide-react';
import { useMemo, useState } from 'react';

interface HrDocument {
    id: number;
    title: string;
    description: string | null;
    type: string;
    category: string | null;
    file_path: string | null;
    file_type: string | null;
    is_active: boolean;
    sort_order: number;
}

export default function Policies() {
    const { policies } = usePage<{ policies: HrDocument[] }>().props;

    const [search, setSearch] = useState('');

    const filteredPolicies = useMemo(() => {
        const keyword = search.toLowerCase().trim();

        if (!keyword) {
            return policies;
        }

        return policies.filter((policy) =>
            policy.title.toLowerCase().includes(keyword) ||
            (policy.category && policy.category.toLowerCase().includes(keyword)) ||
            (policy.file_type && policy.file_type.toLowerCase().includes(keyword))
        );
    }, [search, policies]);

    return (
        <>
            <Head title="Policies & Memoranda" />

            <div className="p-6 max-w-[1600px] mx-auto">
                {/* Hero Banner */}
                <section className="relative overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-br from-[#1E293B] to-[#0F172A] p-8 sm:p-10 shadow-lg min-h-[180px] flex flex-col justify-center mb-8 group">
                    <div className="absolute inset-0 z-0 opacity-40 mix-blend-screen">
                        <LineWaves color1="#0F172A" color2="#00D4FF" color3="#0F172A" brightness={0.6} />
                    </div>
                    
                    <div className="absolute top-0 right-0 -mt-16 -mr-16 h-64 w-64 rounded-full bg-[#00D4FF] opacity-10 blur-3xl mix-blend-screen pointer-events-none group-hover:opacity-20 transition-opacity duration-700"></div>

                    <div className="relative z-10 w-full max-w-3xl">
                        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#00D4FF]/10 border border-[#00D4FF]/20 text-[#00D4FF] text-xs font-bold tracking-widest uppercase mb-4 shadow-[0_0_15px_rgba(0,212,255,0.15)]">
                            <FileText className="w-4 h-4" /> HR PORTAL
                        </div>
                        <h1 className="text-3xl font-extrabold tracking-tight text-white sm:text-4xl drop-shadow-md">
                            Policies & Memoranda
                        </h1>
                        <p className="mt-3 text-base text-white/90 leading-relaxed font-medium max-w-2xl">
                            Official HR policies, advisories, and memoranda.
                        </p>
                    </div>
                </section>

                <div className="mb-8 flex max-w-lg items-center gap-3 rounded-2xl border bg-card px-4 py-3.5 shadow-sm transition-colors focus-within:border-[#00D4FF]/50 focus-within:ring-4 focus-within:ring-[#00D4FF]/10 hover:border-muted-foreground/30">
                    <Search className="h-5 w-5 text-muted-foreground transition-colors group-focus-within:text-[#00D4FF]" />

                    <input
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        placeholder="Search policies by title or category..."
                        className="w-full bg-transparent text-[15px] font-medium outline-none placeholder:text-muted-foreground/70"
                    />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {filteredPolicies.map((policy) => (
                        <div
                            key={policy.id}
                            className="group relative flex flex-col justify-between rounded-3xl border border-muted-foreground/10 bg-card p-6 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-[#00D4FF]/40 hover:shadow-xl hover:shadow-[#00D4FF]/10 overflow-hidden"
                        >
                            {/* Decorative gradient blob */}
                            <div className="absolute -right-16 -top-16 h-40 w-40 rounded-full bg-gradient-to-br from-[#00D4FF]/15 to-[#00D4FF]/0 blur-2xl transition-opacity duration-500 opacity-0 group-hover:opacity-100 pointer-events-none"></div>

                            <div className="relative z-10 flex-1 flex flex-col">
                                <div className="flex items-start justify-between gap-4 mb-5">
                                    <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-[#1E293B]/5 text-[#1E293B] shadow-inner transition-colors duration-300 group-hover:bg-[#00D4FF]/10 group-hover:text-[#00D4FF]">
                                        <FileText className="h-7 w-7 transition-transform duration-300 group-hover:scale-110" />
                                    </div>
                                    {policy.file_type && (
                                        <span className="inline-flex items-center rounded-full bg-[#1E293B]/5 px-3 py-1.5 text-[11px] font-bold uppercase tracking-widest text-[#1E293B] shadow-sm ring-1 ring-inset ring-muted-foreground/10">
                                            {policy.file_type}
                                        </span>
                                    )}
                                </div>

                                <div className="mb-2">
                                    <p className="mb-1 text-[11px] font-bold uppercase tracking-widest text-[#00D4FF]">
                                        {policy.category || 'Uncategorized'}
                                    </p>
                                    <h2 className="text-lg font-extrabold tracking-tight text-foreground transition-colors group-hover:text-[#1E293B] line-clamp-2">
                                        {policy.title}
                                    </h2>
                                </div>

                                {policy.description && (
                                    <p className="text-sm text-muted-foreground/90 leading-relaxed line-clamp-3 mt-1 mb-6 flex-1">
                                        {policy.description}
                                    </p>
                                )}
                            </div>

                            <div className="relative z-10 mt-auto pt-5 border-t border-muted-foreground/10">
                                <a
                                    href={policy.file_path ? `/storage/${policy.file_path}` : '#'}
                                    target="_blank"
                                    rel="noreferrer"
                                    download
                                    className="flex w-full items-center justify-center gap-2.5 rounded-xl bg-[#1E293B] py-3.5 text-sm font-bold text-white shadow-md transition-all duration-300 hover:bg-[#00D4FF] hover:shadow-lg hover:shadow-[#00D4FF]/30 active:scale-[0.98]"
                                >
                                    <Download className="h-4 w-4" />
                                    Download Policy
                                </a>
                            </div>
                        </div>
                    ))}
                </div>

                {filteredPolicies.length === 0 && (
                    <div className="flex flex-col items-center justify-center py-20 text-center rounded-3xl border-2 border-dashed border-muted-foreground/20 bg-muted/5">
                        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-muted/50 mb-4">
                            <Search className="h-8 w-8 text-muted-foreground/50" />
                        </div>
                        <h3 className="text-lg font-bold text-foreground">No policies found</h3>
                        <p className="text-sm text-muted-foreground max-w-sm mt-1">
                            We couldn't find any policies matching your search criteria.
                        </p>
                    </div>
                )}
            </div>
        </>
    );
}