import LineWaves from '@/components/ui/linewaves';
import { Head, router, usePage } from '@inertiajs/react';
import { Search, Phone, Copy, Printer } from 'lucide-react';
import { useMemo, useState } from 'react';
import { Button } from '@/components/ui/button';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';

import dohLogoUrl from '../../images/DOH.png';
import bghmcLogoUrl from '../../images/BGHMC.png';
import bagongPilipinasLogoUrl from '../../images/Bagong_Pilipinas.png';

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
    const [search, setSearch] = useState('');

    const [sectionFilter, setSectionFilter] = useState('all');

    const filteredDirectory = useMemo(() => {
        const keyword = search.toLowerCase().trim();

        if (!keyword) {
            return entries;
        }

        return entries.filter((item) => {
            const matchesSearch =
                item.department.toLowerCase().includes(keyword) ||
                item.local_no.includes(keyword) ||
                item.section.toLowerCase().includes(keyword);

            const matchesSection =
                sectionFilter === 'all' ||
                item.section === sectionFilter;

            return matchesSearch && matchesSection;
        });
    }, [search, sectionFilter, entries]);

    const bataanDirectory = useMemo(() => filteredDirectory.filter(item => item.section === 'BataanGHMC'), [filteredDirectory]);
    const bucasDirectory = useMemo(() => filteredDirectory.filter(item => item.section === 'BUCAS'), [filteredDirectory]);

    const chunkBataan = useMemo(() => {
        if (bataanDirectory.length === 0) return [];
        const size = Math.ceil(bataanDirectory.length / 3);
        return [
            bataanDirectory.slice(0, size),
            bataanDirectory.slice(size, size * 2),
            bataanDirectory.slice(size * 2)
        ];
    }, [bataanDirectory]);

    const chunkBucas = useMemo(() => {
        if (bucasDirectory.length === 0) return [];
        const size = Math.ceil(bucasDirectory.length / 3);
        return [
            bucasDirectory.slice(0, size),
            bucasDirectory.slice(size, size * 2),
            bucasDirectory.slice(size * 2)
        ];
    }, [bucasDirectory]);

    const currentDate = useMemo(() => {
        return new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
    }, []);

    const currentYear = new Date().getFullYear();

    return (
        <>
            <Head title="Directory" />

            <div className="p-6 mx-auto w-full max-w-7xl">
                {/* Search Hero Banner (Hidden on Print) */}
                <section className="print:hidden relative overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-br from-[#1E293B] to-[#0F172A] p-8 shadow-lg min-h-[220px] flex flex-col justify-center">
                    <div className="absolute inset-0 z-0">
                        <LineWaves />
                    </div>
                    <div className="absolute top-0 right-0 -mt-16 -mr-16 h-64 w-64 rounded-full bg-[#00D4FF] opacity-20 blur-3xl mix-blend-screen pointer-events-none"></div>
                    <div className="absolute bottom-0 left-0 -mb-16 -ml-16 h-64 w-64 rounded-full bg-[#1E293B] opacity-40 blur-3xl mix-blend-screen pointer-events-none"></div>

                    <div className="relative z-10 w-full max-w-3xl">
                        <p className="text-sm font-bold tracking-widest text-[#00D4FF] uppercase drop-shadow-sm">
                            BataanGHMC & BUCAS
                        </p>
                        <h1 className="mt-2 text-3xl font-bold tracking-tight text-white sm:text-4xl drop-shadow-md">
                            Hospital Directory
                        </h1>
                        <p className="mt-3 text-base text-white/90 leading-relaxed font-medium mb-6">
                            Search for department, ward, and office local numbers.
                        </p>

                        <div className="flex flex-col sm:flex-row items-center gap-3 w-full">
                            <div className="flex-1 flex items-center gap-3 rounded-2xl border border-white/20 bg-black/20 px-4 py-3 shadow-inner backdrop-blur-md transition-colors focus-within:border-[#00D4FF]/50 focus-within:bg-black/30 w-full">
                                <Search className="h-5 w-5 text-[#00D4FF]" />
                                <input
                                    value={search}
                                    onChange={(event) => setSearch(event.target.value)}
                                    placeholder="Search department or local number..."
                                    className="w-full bg-transparent text-white placeholder-white/50 outline-none text-base"
                                />
                            </div>

                            <div className="w-full sm:w-52 dark">
                                <Select
                                    value={sectionFilter}
                                    onValueChange={setSectionFilter}
                                >
                                    <SelectTrigger className="w-full cursor-pointer rounded-2xl border-white/20 bg-black/20 text-white h-[50px] shadow-inner backdrop-blur-md focus:ring-[#00D4FF]">
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all" className="cursor-pointer">All Sections</SelectItem>
                                        <SelectItem value="BataanGHMC" className="cursor-pointer">BataanGHMC</SelectItem>
                                        <SelectItem value="BUCAS" className="cursor-pointer">BUCAS</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>

                            {/* 
                            <Button
                                onClick={() => window.print()}
                                className="w-full sm:w-auto h-[50px] rounded-2xl bg-[#00D4FF] hover:bg-[#00D4FF]/80 text-[#0F172A] font-bold px-6 shadow-[0_0_15px_rgba(0,212,255,0.3)] transition-all hover:scale-105"
                            >
                                <Printer className="w-5 h-5 mr-2" />
                                Print
                            </Button>
                            */}
                        </div>
                    </div>
                </section>

                <div className="print:hidden mt-8 mb-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div className="text-sm font-semibold text-muted-foreground bg-muted/50 px-4 py-2 rounded-xl inline-block">
                        Showing <span className="text-foreground">{filteredDirectory.length}</span> of {entries.length} entries
                    </div>
                </div>

                {/* The New PDF-Like Document View (Replacing the old table) */}
                <div className="overflow-hidden rounded-2xl border bg-white shadow-xl print:shadow-none print:border-none print:p-0 print:m-0 font-sans p-6 sm:p-10">
                    {/* Header */}
                    <div className="flex flex-col items-center text-center mb-6">
                        <div className="flex items-center justify-between w-full mb-4 px-2 sm:px-8">
                            <div className="flex items-center gap-2 sm:gap-4 w-1/4">
                                <img src={dohLogoUrl} alt="DOH" className="h-16 sm:h-24 object-contain" />
                                <img src={bghmcLogoUrl} alt="BGHMC" className="h-16 sm:h-24 object-contain" />
                            </div>

                            <div className="text-center text-black flex-1">
                                <h1 className="font-bold text-sm sm:text-xl uppercase leading-tight tracking-tight whitespace-nowrap">
                                    Bataan General Hospital and Medical Center
                                </h1>
                                <p className="text-xs sm:text-sm mt-0.5">Balanga City, Bataan</p>
                                <p className="text-[10px] sm:text-xs mt-0.5 font-semibold">ISO-QMS 9001:2015 Certified</p>
                            </div>

                            <div className="flex justify-end w-1/4">
                                <img src={bagongPilipinasLogoUrl} alt="Bagong Pilipinas" className="h-16 sm:h-24 object-contain" />
                            </div>
                        </div>

                        <div className="w-full h-[3px] sm:h-1 bg-black my-2 sm:my-4"></div>

                        <h2 className="text-lg sm:text-3xl font-black uppercase tracking-tight mb-2 text-black">BGHMC Telephone Directory {currentYear}</h2>

                        <div className="flex justify-between w-full text-[10px] sm:text-[11px] font-medium italic mt-2 text-black">
                            <span>Updated as of: {currentDate}</span>
                            <span>**Created by: IMISS {currentYear}</span>
                        </div>
                    </div>

                    {/* BataanGHMC 3-Column Grid */}
                    {chunkBataan.length > 0 && (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-2 gap-y-4 items-start mb-6">
                            {chunkBataan.map((col, i) => (
                                <table key={i} className="w-full border-[2px] border-black text-[10px] sm:text-xs font-sans bg-white text-black">
                                    <thead>
                                        <tr className="border-b-[2px] border-black">
                                            <th 
                                                className="border-r-[2px] border-black p-1 sm:p-1.5 text-center font-bold bg-[#DDEBF7] text-[#002060] w-2/3"
                                                style={{ WebkitPrintColorAdjust: 'exact', printColorAdjust: 'exact' }}
                                            >
                                                Department/Ward/Office
                                            </th>
                                            <th 
                                                className="p-1 sm:p-1.5 text-center font-bold whitespace-nowrap bg-[#DDEBF7] text-[#002060] w-1/3"
                                                style={{ WebkitPrintColorAdjust: 'exact', printColorAdjust: 'exact' }}
                                            >
                                                Local No.
                                            </th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {col.map(item => (
                                            <tr 
                                                key={item.id} 
                                                className="border-b border-black last:border-0 hover:bg-black/5 transition-colors group cursor-pointer print:hover:bg-transparent" 
                                                onClick={() => {
                                                    navigator.clipboard.writeText(item.local_no);
                                                    toast.success('Local number copied.');
                                                }}
                                            >
                                                <td className="border-r-[2px] border-black p-1 sm:p-1.5 font-semibold uppercase leading-tight text-[9px] sm:text-[11px] break-words">
                                                    {item.department}
                                                </td>
                                                <td className="p-1 sm:p-1.5 text-center font-bold text-[10px] sm:text-[12px] group-hover:text-blue-600 print:group-hover:text-black transition-colors">
                                                    {item.local_no}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            ))}
                        </div>
                    )}

                    {/* BUCAS 3-Column Grid */}
                    {chunkBucas.length > 0 && (
                        <div className="mt-8 mb-6">
                            <div className="w-full border-t-[2px] border-dashed border-black mb-4"></div>
                            <div className="text-center mb-4 text-black">
                                <h3 className="text-xl sm:text-2xl font-black uppercase tracking-tight">BUCAS CENTER</h3>
                                <p className="text-[11px] sm:text-sm font-bold italic">Bagong Urgent Care and Ambulatory Services</p>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-2 gap-y-4 items-start">
                                {chunkBucas.map((col, i) => (
                                    <table key={i} className="w-full border-[2px] border-black text-[10px] sm:text-xs font-sans bg-white text-black">
                                        <thead>
                                            <tr className="border-b-[2px] border-black">
                                                <th 
                                                    className="border-r-[2px] border-black p-1 sm:p-1.5 text-center font-bold bg-[#DDEBF7] text-[#002060] w-2/3"
                                                    style={{ WebkitPrintColorAdjust: 'exact', printColorAdjust: 'exact' }}
                                                >
                                                    Department/Ward/Office
                                                </th>
                                                <th 
                                                    className="p-1 sm:p-1.5 text-center font-bold whitespace-nowrap bg-[#DDEBF7] text-[#002060] w-1/3"
                                                    style={{ WebkitPrintColorAdjust: 'exact', printColorAdjust: 'exact' }}
                                                >
                                                    Local No.
                                                </th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {col.map(item => (
                                                <tr 
                                                    key={item.id} 
                                                    className="border-b border-black last:border-0 hover:bg-black/5 transition-colors group cursor-pointer print:hover:bg-transparent" 
                                                    onClick={() => {
                                                        navigator.clipboard.writeText(item.local_no);
                                                        toast.success('Local number copied.');
                                                    }}
                                                >
                                                    <td className="border-r-[2px] border-black p-1 sm:p-1.5 font-semibold uppercase leading-tight text-[9px] sm:text-[11px] break-words">
                                                        {item.department}
                                                    </td>
                                                    <td className="p-1 sm:p-1.5 text-center font-bold text-[10px] sm:text-[12px] group-hover:text-blue-600 print:group-hover:text-black transition-colors">
                                                        {item.local_no}
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                ))}
                            </div>
                        </div>
                    )}

                    {filteredDirectory.length === 0 && (
                        <div className="text-center py-20 text-muted-foreground font-medium">
                            No directory records found matching your search.
                        </div>
                    )}
                </div>

                <div className="print:hidden mt-6 grid gap-4 sm:grid-cols-2">
                    <div className="group relative overflow-hidden rounded-2xl border bg-card p-6 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-md hover:border-[#00D4FF]/40">
                        <div className="absolute inset-0 bg-gradient-to-br from-[#00D4FF]/5 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100 pointer-events-none" />
                        <div className="relative z-10">
                            <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-[#1E293B]/10 text-[#1E293B] transition-colors duration-300 group-hover:bg-[#00D4FF]/10 group-hover:text-[#00D4FF]">
                                <Phone className="h-6 w-6 transition-transform duration-300 group-hover:scale-110" />
                            </div>
                            <h3 className="font-bold text-lg text-foreground">BataanGHMC Trunk Lines</h3>
                            <p className="mt-2 text-muted-foreground font-medium">
                                (047) 237-9771 <br />
                                (047) 237-9772 <br />
                                (047) 237-1274
                            </p>
                        </div>
                    </div>

                    <div className="group relative overflow-hidden rounded-2xl border bg-card p-6 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-md hover:border-[#00D4FF]/40">
                        <div className="absolute inset-0 bg-gradient-to-br from-[#00D4FF]/5 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100 pointer-events-none" />
                        <div className="relative z-10">
                            <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-[#1E293B]/10 text-[#1E293B] transition-colors duration-300 group-hover:bg-[#00D4FF]/10 group-hover:text-[#00D4FF]">
                                <Phone className="h-6 w-6 transition-transform duration-300 group-hover:scale-110" />
                            </div>
                            <h3 className="font-bold text-lg text-foreground">BUCAS Trunk Lines</h3>
                            <p className="mt-2 text-muted-foreground font-medium">
                                (047) 240-9200 to 9204
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}