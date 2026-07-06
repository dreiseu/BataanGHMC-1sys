import LineWaves from '@/components/ui/linewaves';
import { Head, usePage } from '@inertiajs/react';
import { Download, Search, HelpCircle } from 'lucide-react';
import { useMemo, useState } from 'react';
import {
    Accordion,
    AccordionContent,
    AccordionItem,
    AccordionTrigger,
} from '@/components/ui/accordion';

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

export default function Faqs() {
    const { faqs } = usePage<{ faqs: HrDocument[] }>().props;

    const [search, setSearch] = useState('');

    const filteredFaqs = useMemo(() => {
        const keyword = search.toLowerCase().trim();

        if (!keyword) {
            return faqs;
        }

        return faqs.filter((faq) =>
            faq.title.toLowerCase().includes(keyword) ||
            (faq.category && faq.category.toLowerCase().includes(keyword)) ||
            (faq.description && faq.description.toLowerCase().includes(keyword))
        );
    }, [search, faqs]);

    return (
        <>
            <Head title="FAQs" />

            <div className="p-6 max-w-[1600px] mx-auto">
                {/* Hero Banner */}
                <section className="relative overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-br from-[#1E293B] to-[#0F172A] p-8 sm:p-10 shadow-lg min-h-[180px] flex flex-col justify-center mb-8 group">
                    <div className="absolute inset-0 z-0 opacity-40 mix-blend-screen">
                        <LineWaves color1="#0F172A" color2="#00D4FF" color3="#0F172A" brightness={0.6} />
                    </div>
                    
                    <div className="absolute top-0 right-0 -mt-16 -mr-16 h-64 w-64 rounded-full bg-[#00D4FF] opacity-10 blur-3xl mix-blend-screen pointer-events-none group-hover:opacity-20 transition-opacity duration-700"></div>

                    <div className="relative z-10 w-full max-w-3xl">
                        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#00D4FF]/10 border border-[#00D4FF]/20 text-[#00D4FF] text-xs font-bold tracking-widest uppercase mb-4 shadow-[0_0_15px_rgba(0,212,255,0.15)]">
                            <HelpCircle className="w-4 h-4" /> HR PORTAL
                        </div>
                        <h1 className="text-3xl font-extrabold tracking-tight text-white sm:text-4xl drop-shadow-md">
                            Frequently Asked Questions
                        </h1>
                        <p className="mt-3 text-base text-white/90 leading-relaxed font-medium max-w-2xl">
                            Common questions and quick reference guides.
                        </p>
                    </div>
                </section>

                <div className="mb-8 flex max-w-lg items-center gap-3 rounded-2xl border bg-card px-4 py-3.5 shadow-sm transition-colors focus-within:border-[#00D4FF]/50 focus-within:ring-4 focus-within:ring-[#00D4FF]/10 hover:border-muted-foreground/30">
                    <Search className="h-5 w-5 text-muted-foreground transition-colors group-focus-within:text-[#00D4FF]" />

                    <input
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        placeholder="Search FAQs..."
                        className="w-full bg-transparent text-[15px] font-medium outline-none placeholder:text-muted-foreground/70"
                    />
                </div>

                {filteredFaqs.length > 0 && (
                    <Accordion
                        type="single"
                        collapsible
                        className="rounded-3xl border border-muted-foreground/10 bg-card shadow-sm overflow-hidden"
                    >
                        {filteredFaqs.map((faq, index) => (
                            <AccordionItem
                                key={faq.id}
                                value={`item-${index}`}
                                className="px-6 sm:px-8 border-b border-muted-foreground/10 last:border-0 hover:bg-muted/30 transition-colors"
                            >
                                <AccordionTrigger className="py-6 text-left font-bold text-foreground hover:text-[#00D4FF] hover:no-underline transition-colors text-lg">
                                    {faq.title}
                                </AccordionTrigger>

                                <AccordionContent className="pb-6 text-base text-muted-foreground leading-relaxed">
                                    {faq.category && (
                                        <span className="inline-block mb-3 px-2.5 py-1 rounded-md bg-muted text-xs font-bold uppercase tracking-wider text-muted-foreground">
                                            {faq.category}
                                        </span>
                                    )}
                                    <div className="mb-4">
                                        {faq.description || 'No detailed answer provided.'}
                                    </div>
                                    
                                    {faq.file_path && (
                                        <a
                                            href={`/storage/${faq.file_path}`}
                                            target="_blank"
                                            rel="noreferrer"
                                            download
                                            className="inline-flex items-center gap-2 rounded-xl border border-muted-foreground/20 bg-transparent px-5 py-2.5 text-sm font-bold transition-all hover:bg-[#1E293B] hover:text-white hover:border-[#1E293B] shadow-sm"
                                        >
                                            <Download className="h-4 w-4" />
                                            Download Guide Attachment
                                        </a>
                                    )}
                                </AccordionContent>
                            </AccordionItem>
                        ))}
                    </Accordion>
                )}

                {filteredFaqs.length === 0 && (
                    <div className="flex flex-col items-center justify-center py-20 text-center rounded-3xl border-2 border-dashed border-muted-foreground/20 bg-muted/5">
                        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-muted/50 mb-4">
                            <Search className="h-8 w-8 text-muted-foreground/50" />
                        </div>
                        <h3 className="text-lg font-bold text-foreground">No FAQs found</h3>
                        <p className="text-sm text-muted-foreground max-w-sm mt-1">
                            We couldn't find any FAQs matching your search criteria.
                        </p>
                    </div>
                )}
            </div>
        </>
    );
}