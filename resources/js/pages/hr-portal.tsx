import ModulePageHeader from '@/components/module-page-header';
import LineWaves from '@/components/ui/linewaves';
import { Head, Link } from '@inertiajs/react';
import {
    Bell,
    BriefcaseBusiness,
    Download,
    FileText,
    HelpCircle,
    PlayCircle,
    Search,
    ChevronRight,
} from 'lucide-react';
import { useState } from 'react';

const hrSections = [
    {
        title: 'Video Orientation',
        description: 'Watch onboarding and HR orientation videos.',
        icon: PlayCircle,
        href: '/hr-portal/video-orientation',
    },
    {
        title: 'Downloadable Forms',
        description: 'Access HR forms, templates, and request documents.',
        icon: Download,
        href: '/hr-portal/downloadable-forms',
    },
    {
        title: 'Policies & Memoranda',
        description: 'Read HR policies, advisories, and memoranda.',
        icon: FileText,
        href: '/hr-portal/policies',
    },
    {
        title: 'Leave & Benefits',
        description: 'Find leave, benefits, and employee welfare resources.',
        icon: BriefcaseBusiness,
        href: '/hr-portal/leave-benefits',
    },
    {
        title: 'HR Announcements',
        description: 'View official HR updates and announcements.',
        icon: Bell,
        href: '/hr-portal/announcements',
    },
    {
        title: 'FAQs',
        description: 'Common questions about HR processes and services.',
        icon: HelpCircle,
        href: '/hr-portal/faqs',
    },
];

const announcementsPreview = [
    {
        title: 'Updated leave filing schedule released',
        date: 'Apr 24, 2026',
        isNew: true,
    },
    {
        title: 'Mandatory employee orientation this month',
        date: 'Apr 20, 2026',
        isNew: true,
    },
    {
        title: 'New HR advisory on employee benefits',
        date: 'Mar 31, 2026',
        isNew: false,
    },
];

export default function HrPortal() {

    const [resourceSearch, setResourceSearch] = useState('');

    const filteredHrSections = hrSections.filter((section) =>
        section.title.toLowerCase().includes(resourceSearch.toLowerCase()) ||
        section.description.toLowerCase().includes(resourceSearch.toLowerCase())
    );

    return (
        <>
            <Head title="HR Portal" />

            {/* <ModulePageHeader
                title="HR Portal"
                description="Human Resource services, employee resources, policies, forms, and announcements."
            /> */}

            <div className="flex flex-col lg:flex-row gap-6 p-6 mx-auto w-full max-w-7xl">
                {/* Main Content Column */}
                <div className="flex-1 flex flex-col gap-6">
                    
                    {/* Search Hero Banner */}
                    <section className="relative overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-br from-[#5B0FBE] to-[#260554] p-8 shadow-lg min-h-[220px] flex flex-col justify-center">
                        <div className="absolute inset-0 z-0">
                            <LineWaves />
                        </div>
                        <div className="absolute top-0 right-0 -mt-16 -mr-16 h-64 w-64 rounded-full bg-[#00D4FF] opacity-20 blur-3xl mix-blend-screen pointer-events-none"></div>
                        <div className="absolute bottom-0 left-0 -mb-16 -ml-16 h-64 w-64 rounded-full bg-[#5B0FBE] opacity-40 blur-3xl mix-blend-screen pointer-events-none"></div>

                        <div className="relative z-10 w-full max-w-2xl">
                            <p className="text-sm font-bold tracking-widest text-[#00D4FF] uppercase drop-shadow-sm">
                                Human Resource Management Office
                            </p>
                            <h1 className="mt-2 text-3xl font-bold tracking-tight text-white sm:text-4xl drop-shadow-md">
                                How can HR help you today?
                            </h1>
                            <p className="mt-3 text-base text-white/90 leading-relaxed font-medium mb-6">
                                Access orientation materials, downloadable forms, employee benefits resources, and frequently asked questions.
                            </p>
                            
                            <div className="flex items-center gap-3 rounded-2xl border border-white/20 bg-black/20 px-4 py-3 shadow-inner backdrop-blur-md transition-colors focus-within:border-[#00D4FF]/50 focus-within:bg-black/30">
                                <Search className="h-5 w-5 text-[#00D4FF]" />
                                <input
                                    value={resourceSearch}
                                    onChange={(e) => setResourceSearch(e.target.value)}
                                    placeholder="Search HR policies, forms, or benefits..."
                                    className="w-full bg-transparent text-white placeholder-white/50 outline-none text-base"
                                />
                            </div>
                        </div>
                    </section>

                    {/* Resources Grid */}
                    <section>
                        <h2 className="mb-5 text-xl font-bold text-foreground tracking-tight">
                            HR Resources
                        </h2>

                        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
                            {filteredHrSections.map((section) => {
                                const Icon = section.icon;

                                return (
                                    <Link
                                        key={section.title}
                                        href={section.href}
                                        className="group relative overflow-hidden rounded-2xl border bg-card p-5 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-md hover:border-[#00D4FF]/40 block"
                                    >
                                        <div className="absolute inset-0 bg-gradient-to-br from-[#00D4FF]/5 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
                                        
                                        <div className="relative z-10">
                                            <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-xl bg-[#5B0FBE]/10 text-[#5B0FBE] transition-colors duration-300 group-hover:bg-[#00D4FF]/10 group-hover:text-[#00D4FF]">
                                                <Icon className="h-5 w-5 transition-transform duration-300 group-hover:scale-110" />
                                            </div>

                                            <h3 className="font-bold text-foreground">
                                                {section.title}
                                            </h3>

                                            <p className="mt-1 text-sm text-muted-foreground leading-snug">
                                                {section.description}
                                            </p>
                                        </div>
                                    </Link>
                                );
                            })}
                        </div>

                        {filteredHrSections.length === 0 && (
                            <div className="rounded-2xl border border-dashed bg-card/50 p-12 text-center flex flex-col items-center justify-center mt-4">
                                <Search className="h-8 w-8 text-muted-foreground/30 mb-3" />
                                <p className="text-sm font-medium text-muted-foreground">
                                    No HR resources found matching "{resourceSearch}"
                                </p>
                            </div>
                        )}
                    </section>
                </div>

                {/* Sidebar Column */}
                <div className="w-full lg:w-[320px] shrink-0 flex flex-col gap-6">
                    {/* Announcements Feed */}
                    <div className="rounded-3xl border bg-card p-6 shadow-sm flex flex-col">
                        <div className="flex items-center justify-between mb-6">
                            <h2 className="text-lg font-bold tracking-tight">
                                Announcements
                            </h2>
                            <div className="h-8 w-8 rounded-full bg-[#5B0FBE]/10 flex items-center justify-center text-[#5B0FBE]">
                                <Bell className="h-4 w-4" />
                            </div>
                        </div>
                        
                        <div className="flex flex-col gap-5 relative before:absolute before:inset-y-0 before:left-[11px] before:w-px before:bg-border/50">
                            {announcementsPreview.map((item) => (
                                <div key={item.title} className="relative pl-8 group">
                                    {/* Timeline dot */}
                                    <div className="absolute left-[7px] top-1.5 h-[9px] w-[9px] rounded-full bg-border transition-colors group-hover:bg-[#00D4FF] z-10 ring-4 ring-card" />
                                    
                                    <div className="flex flex-col gap-1">
                                        <div className="flex flex-wrap items-center gap-2">
                                            <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                                                {item.date}
                                            </span>
                                            {item.isNew && (
                                                <span className="rounded-full bg-[#00D4FF]/20 px-2 py-0.5 text-[10px] font-bold text-[#00D4FF]">
                                                    NEW
                                                </span>
                                            )}
                                        </div>
                                        <h3 className="font-semibold text-sm leading-snug text-foreground/90 group-hover:text-foreground transition-colors">
                                            {item.title}
                                        </h3>
                                    </div>
                                </div>
                            ))}
                        </div>

                        <Link
                            href="/hr-portal/announcements"
                            className="mt-6 flex items-center justify-center gap-1.5 w-full rounded-xl bg-muted/50 p-2.5 text-sm font-semibold text-muted-foreground hover:bg-[#5B0FBE]/10 hover:text-[#5B0FBE] transition-colors"
                        >
                            View all updates
                            <ChevronRight className="h-4 w-4" />
                        </Link>
                    </div>
                </div>
            </div>
        </>
    );
}