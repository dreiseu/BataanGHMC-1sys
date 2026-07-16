import { Head, Link, usePage, useForm } from '@inertiajs/react';
import LineWaves from '@/components/ui/linewaves';
import {
    BookOpen,
    Building2,
    FileText,
    HeartPulse,
    IdCard,
    LayoutGrid,
    QrCode,
    Users,
    Contact,
    Bell,
    Pin,
    Plus,
    Check,
    ShieldCheck,
    Activity,
    Stethoscope,
    FormInput,
    Box,
    BookCopy,
    Cpu,
    FolderGit2,
    ChevronRight,
    Clock,
    ShieldAlert,
    Info,
    Search
} from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
    DialogFooter,
} from '@/components/ui/dialog';
import { useState, useMemo, useEffect } from 'react';
import { CalendarWidget } from '@/components/calendar-widget';

const SERVICES = [
    {
        title: 'BataanGHMC-CERT',
        description: 'Computer Emergency Response Team',
        href: '/cert',
        icon: ShieldCheck,
    },
    {
        title: 'HR Portal',
        description: 'Human resource services and employee records.',
        href: '/hr-portal',
        icon: Users,
    },
    {
        title: 'IMISS',
        description: 'Integrated hospital operations module.',
        href: '/imiss',
        icon: HeartPulse,
    },
    {
        title: 'PETRO',
        description: 'Performance tracking and reporting tools.',
        href: 'https://sites.google.com/view/bghmc-petro/home',
        icon: FileText,
    },
    {
        title: 'QR-PASS',
        description: 'QR-based pass and verification tools.',
        href: '/qr-pass',
        icon: QrCode,
    },
    {
        title: 'Directory',
        description: 'Hospital telephone and contact directory.',
        href: '/directory',
        icon: BookOpen,
    },
    {
        title: 'User Guide',
        description: 'User documentation and support guides.',
        href: '/user-guide',
        icon: BookCopy,
    },
];

const CYBER_TIPS = [
    { title: 'Password Security', text: 'Never share your 1SYS password with anyone, not even IMISS staff.' },
    { title: 'Phishing Alert', text: 'Do not click on suspicious email links asking for your login credentials.' },
    { title: 'Lock Your Screen', text: 'Always lock your workstation (Win+L) when stepping away.' }
];

export default function Dashboard() {
    const { auth, pinnedModules: initialPinnedModules, hospitalSystems, globalAnnouncements, events } = usePage<any>().props;
    const userName = auth?.user?.name ? auth.user.name.split(' ')[0] : 'User';

    const ALL_MODULES = useMemo(() => {
        const iconList = [Cpu, FolderGit2, Building2, LayoutGrid, Contact];

        const dynamicSystems = (hospitalSystems || []).map((sys: any, index: number) => {
            const nameLower = sys.name.toLowerCase();
            let SysIcon = Building2;
            let SysDesc = `Access the ${sys.name} external hospital system.`;

            if (nameLower.includes("employee")) {
                SysIcon = IdCard;
                SysDesc = "Employee self-service access and personal records.";
            } else if (nameLower.includes("medical") || nameLower.includes("doc") || nameLower.includes("dice")) {
                SysIcon = Stethoscope;
                SysDesc = "Electronic medical records and clinical data management.";
            } else if (nameLower.includes("health") || nameLower.includes("clinic")) {
                SysIcon = Activity;
                SysDesc = "Employee health, consultation, and wellness tracking.";
            } else if (nameLower.includes("form") || nameLower.includes("order")) {
                SysIcon = FormInput;
                SysDesc = "Submit and track electronic forms and job orders.";
            } else if (nameLower.includes("1app")) {
                SysIcon = Box;
                SysDesc = "Centralized institutional application access portal.";
            } else if (nameLower.includes("cert")) {
                SysIcon = BookCopy;
                SysDesc = "Medical certification and verification system.";
            } else {
                SysIcon = iconList[index % iconList.length];
            }

            return {
                title: sys.name,
                description: SysDesc,
                href: sys.is_sso ? `/sso-portal?system=${encodeURIComponent(sys.name)}` : sys.url,
                icon: SysIcon,
            };
        });

        return [...SERVICES, ...dynamicSystems];
    }, [hospitalSystems]);

    const savedPins = (Array.isArray(initialPinnedModules) ? initialPinnedModules : [])
        .filter(href => ALL_MODULES.some(m => m.href === href));
    const [isPinModalOpen, setIsPinModalOpen] = useState(false);
    const [recentModulesHrefs, setRecentModulesHrefs] = useState<string[]>([]);
    const [activeTip, setActiveTip] = useState(0);

    useEffect(() => {
        const saved = JSON.parse(localStorage.getItem('recent_modules') || '[]');
        setRecentModulesHrefs(saved);

        const interval = setInterval(() => {
            setActiveTip((prev) => (prev + 1) % CYBER_TIPS.length);
        }, 8000);
        return () => clearInterval(interval);
    }, []);

    const { data, setData, post, processing } = useForm({
        pinned_modules: savedPins,
    });

    const handleTogglePin = (href: string) => {
        if (data.pinned_modules.includes(href)) {
            setData('pinned_modules', data.pinned_modules.filter((h: string) => h !== href));
        } else {
            setData('pinned_modules', [...data.pinned_modules, href]);
        }
    };

    const handleSavePins = () => {
        post('/user-preferences/pinned-modules', {
            preserveScroll: true,
            onSuccess: () => setIsPinModalOpen(false),
        });
    };

    const openPinModal = () => {
        setData('pinned_modules', savedPins);
        setIsPinModalOpen(true);
    };

    const saveRecentModule = (href: string) => {
        const saved = JSON.parse(localStorage.getItem('recent_modules') || '[]');
        const newSaved = [href, ...saved.filter((h: string) => h !== href)].slice(0, 3);
        localStorage.setItem('recent_modules', JSON.stringify(newSaved));
    };

    const displayModules = ALL_MODULES.filter(m => savedPins.includes(m.href));
    const recentModules = recentModulesHrefs.map(href => ALL_MODULES.find(m => m.href === href)).filter(Boolean);
    const employeePortalModule = ALL_MODULES.find(m => m.title === "Employee's Portal");

    return (
        <>
            <Head title="Home" />

            <div className="flex flex-col lg:flex-row gap-6 p-6 mt-6 mx-auto w-full max-w-7xl">
                {/* Main Content Column */}
                <div className="flex-1 flex flex-col gap-6">
                    {/* Hero Section */}
                    <section className="relative overflow-hidden rounded-3xl border border-white/10 bg-[#0F172A] p-8 shadow-lg min-h-[220px] flex items-center">
                        {/* LineWaves Background */}
                        <div className="absolute inset-0 z-0 opacity-40 mix-blend-screen pointer-events-none">
                            <LineWaves
                                speed={0.25}
                                innerLineCount={20}
                                outerLineCount={20}
                                warpIntensity={0.8}
                                edgeFadeWidth={0.2}
                                brightness={0.3}
                                color1="#1E293B"
                                color2="#00D4FF"
                                color3="#1E293B"
                                enableMouseInteraction={true}
                                mouseInfluence={1.5}
                            />
                        </div>
                        <div className="absolute inset-0 bg-gradient-to-r from-[#1E293B] via-[#1E293B]/80 to-transparent z-0"></div>

                        <div className="relative z-10 w-full">
                            <p className="text-sm font-bold tracking-widest text-[#00D4FF] uppercase drop-shadow-sm">
                                Unified Access Portal
                            </p>
                            <h1 className="mt-2 text-4xl font-bold tracking-tight text-white sm:text-5xl drop-shadow-md">
                                Welcome back, {userName}
                            </h1>
                            <p className="mt-4 max-w-xl text-lg text-white/90 leading-relaxed font-medium">
                                Access all institutional systems, employee services, guides, and directories from your central workspace.
                            </p>
                        </div>
                    </section>

                    {/* Global Announcements & Spotlight Grid */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        {/* Dynamic Announcements Feed */}
                        <section className="rounded-3xl border bg-card p-6 shadow-sm flex flex-col relative overflow-hidden h-full">
                            <div className="flex items-center justify-between mb-5">
                                <h2 className="text-lg font-bold tracking-tight flex items-center gap-2">
                                    <Bell className="h-5 w-5 text-[#00D4FF]" />
                                    Global Announcements
                                </h2>
                                <Link href="/hr-portal/announcements" className="text-xs font-semibold text-muted-foreground hover:text-[#00D4FF] transition-colors">
                                    View All
                                </Link>
                            </div>
                            <div className="flex flex-col gap-4 relative before:absolute before:inset-y-0 before:left-[11px] before:w-px before:bg-border/50">
                                {globalAnnouncements && globalAnnouncements.length > 0 ? globalAnnouncements.map((announcement: any) => {
                                    const dateObj = new Date(announcement.created_at);
                                    const dateStr = dateObj.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
                                    const isNew = (new Date().getTime() - dateObj.getTime()) < (7 * 24 * 60 * 60 * 1000);

                                    return (
                                        <div key={announcement.id} className="relative pl-8 group">
                                            <div className="absolute left-[7px] top-1.5 h-[9px] w-[9px] rounded-full bg-border transition-colors group-hover:bg-[#00D4FF] z-10 ring-4 ring-card" />
                                            <div className="flex flex-col gap-1">
                                                <div className="flex items-center gap-2">
                                                    <span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">{dateStr}</span>
                                                    {isNew && <span className="rounded-full bg-[#00D4FF]/20 px-2 py-0.5 text-[9px] font-bold text-[#00D4FF]">NEW</span>}
                                                </div>
                                                <h3 className="font-semibold text-sm leading-snug group-hover:text-[#00D4FF] transition-colors line-clamp-2">{announcement.title}</h3>
                                            </div>
                                        </div>
                                    )
                                }) : (
                                    <div className="pl-6 text-sm text-muted-foreground italic mt-2">No recent global announcements.</div>
                                )}
                            </div>
                        </section>

                        {/* Featured System Spotlight */}
                        <section className="rounded-3xl border border-[#00D4FF]/20 bg-gradient-to-br from-[#1E293B] to-[#0F172A] p-6 shadow-sm relative overflow-hidden group flex flex-col justify-between min-h-[200px]">
                            <div className="absolute top-0 right-0 -mt-10 -mr-10 h-40 w-40 rounded-full bg-[#00D4FF] opacity-10 blur-3xl group-hover:opacity-20 transition-opacity duration-700 pointer-events-none"></div>

                            <div className="relative z-10 mb-4">
                                <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[#00D4FF]/20 text-[#00D4FF] text-[10px] font-bold tracking-widest uppercase mb-4 shadow-[0_0_10px_rgba(0,212,255,0.1)]">
                                    <IdCard className="h-3 w-3" /> FEATURED SYSTEM
                                </div>
                                <h3 className="text-2xl font-extrabold text-white mb-2 drop-shadow-sm">Employee Portal</h3>
                                <p className="text-white/80 text-sm leading-relaxed">Access your personal records, payslips, leave applications, and HR services securely.</p>
                            </div>

                            <div className="relative z-10 mt-auto">
                                <a
                                    href={employeePortalModule?.href || "/sso-portal?system=Employee's%20Portal"}
                                    onClick={() => saveRecentModule(employeePortalModule?.href || "/sso-portal?system=Employee's%20Portal")}
                                    className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#00D4FF] hover:bg-[#00D4FF]/90 text-[#0F172A] py-3 text-sm font-bold transition-all shadow-lg hover:shadow-[#00D4FF]/30 active:scale-[0.98]"
                                >
                                    Launch System <ChevronRight className="h-4 w-4" />
                                </a>
                            </div>
                        </section>
                    </div>



                    {/* Pinned Modules Grid */}
                    <section>
                        <div className="mb-5 flex items-center justify-between">
                            <h2 className="text-xl font-bold text-foreground tracking-tight flex items-center gap-2">
                                <Pin className="h-5 w-5 text-[#1E293B]" />
                                Pinned Modules
                            </h2>
                            <Button variant="ghost" size="sm" onClick={openPinModal} className="text-muted-foreground hover:text-[#1E293B] cursor-pointer">
                                <Plus className="h-4 w-4 mr-1" /> Edit Pins
                            </Button>
                        </div>

                        {displayModules.length > 0 ? (
                            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                                {displayModules.map((module) => {
                                    const Icon = module.icon;
                                    const isExternal = module.href.startsWith('http');
                                    return (
                                        <a
                                            key={module.href}
                                            href={module.href}
                                            target={isExternal ? "_blank" : "_self"}
                                            rel={isExternal ? "noopener noreferrer" : undefined}
                                            onClick={() => saveRecentModule(module.href)}
                                            className="group relative overflow-hidden rounded-2xl border bg-card p-5 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-md hover:border-[#00D4FF]/40 block"
                                        >
                                            <div className="absolute inset-0 bg-gradient-to-br from-[#00D4FF]/5 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />

                                            <div className="relative z-10">
                                                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-[#1E293B]/10 text-[#1E293B] transition-colors duration-300 group-hover:bg-[#00D4FF]/10 group-hover:text-[#00D4FF]">
                                                    <Icon className="h-6 w-6 transition-transform duration-300 group-hover:scale-110" />
                                                </div>

                                                <h3 className="font-bold text-foreground">
                                                    {module.title}
                                                </h3>

                                                <p className="mt-1 text-sm text-muted-foreground leading-snug">
                                                    {module.description}
                                                </p>
                                            </div>
                                        </a>
                                    );
                                })}
                            </div>
                        ) : (
                            <div className="rounded-3xl border-2 border-dashed border-muted bg-muted/20 p-12 text-center flex flex-col items-center justify-center">
                                <div className="h-16 w-16 rounded-2xl bg-muted flex items-center justify-center mb-4">
                                    <LayoutGrid className="h-8 w-8 text-muted-foreground/50" />
                                </div>
                                <h3 className="text-lg font-bold text-foreground">Your dashboard is empty</h3>
                                <p className="text-muted-foreground mt-1 max-w-sm">
                                    Pin the modules you use most frequently for quick access right here.
                                </p>
                                <Button onClick={openPinModal} className="cursor-pointer mt-6 rounded-xl bg-[#1E293B] hover:bg-[#1E293B]/90">
                                    <Plus className="h-4 w-4 mr-2" /> Pin Your First Module
                                </Button>
                            </div>
                        )}
                    </section>
                </div>

                {/* Sidebar Column */}
                <div className="w-full lg:w-[320px] shrink-0 flex flex-col gap-6">

                    {/* IMISS Cybersecurity Tips Widget */}
                    <div className="rounded-3xl border border-[#00D4FF]/20 bg-gradient-to-b from-[#1E293B] to-[#0F172A] p-6 shadow-sm relative overflow-hidden group">
                        <div className="absolute top-0 right-0 p-4 opacity-10">
                            <ShieldAlert className="h-24 w-24 text-[#00D4FF]" />
                        </div>
                        <div className="relative z-10 flex flex-col h-full">
                            <div className="flex items-center gap-2 mb-2">
                                <div className="h-8 w-8 rounded-full bg-[#00D4FF]/20 flex items-center justify-center text-[#00D4FF]">
                                    <Info className="h-4 w-4" />
                                </div>
                                <h2 className="text-sm font-bold tracking-widest text-[#00D4FF] uppercase">Did you know?</h2>
                            </div>

                            <div className="min-h-[100px] flex flex-col justify-center transition-opacity duration-500" key={activeTip}>
                                <h3 className="text-lg font-bold text-white mb-2 leading-tight drop-shadow-sm">{CYBER_TIPS[activeTip].title}</h3>
                                <p className="text-sm text-white/80 leading-relaxed">{CYBER_TIPS[activeTip].text}</p>
                            </div>

                            <div className="flex items-center gap-1.5 mt-6">
                                {CYBER_TIPS.map((_, idx) => (
                                    <div
                                        key={idx}
                                        className={`h-1.5 rounded-full transition-all duration-500 ${idx === activeTip ? 'w-6 bg-[#00D4FF]' : 'w-1.5 bg-white/20'}`}
                                    />
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Calendar Widget */}
                    <CalendarWidget events={events} />

                    {/* Recently Used Row (Sidebar) */}
                    <div className="rounded-3xl border bg-card p-6 shadow-sm flex flex-col">
                        <h2 className="text-lg font-bold tracking-tight mb-4 flex items-center gap-2">
                            <Clock className="h-5 w-5 text-muted-foreground" />
                            Recently Accessed
                        </h2>

                        {recentModules.length > 0 ? (
                            <div className="flex flex-col gap-3">
                                {recentModules.map((module: any) => {
                                    const Icon = module.icon;
                                    const isExternal = module.href.startsWith('http');
                                    return (
                                        <a
                                            key={`recent-${module.href}`}
                                            href={module.href}
                                            target={isExternal ? "_blank" : "_self"}
                                            rel={isExternal ? "noopener noreferrer" : undefined}
                                            onClick={() => saveRecentModule(module.href)}
                                            className="group flex items-center gap-3 rounded-xl p-3 hover:bg-muted/50 transition-colors border border-transparent hover:border-border"
                                        >
                                            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-muted text-muted-foreground group-hover:bg-[#1E293B] group-hover:text-white transition-colors shadow-sm">
                                                <Icon className="h-4 w-4" />
                                            </div>
                                            <div className="flex-1 overflow-hidden">
                                                <h3 className="font-semibold text-sm text-foreground/90 group-hover:text-foreground transition-colors truncate">{module.title}</h3>
                                            </div>
                                        </a>
                                    )
                                })}
                            </div>
                        ) : (
                            <div className="rounded-2xl border border-dashed border-muted bg-muted/20 p-4 flex flex-col items-center gap-3 text-center">
                                <div className="h-10 w-10 rounded-full bg-muted flex items-center justify-center">
                                    <Clock className="h-5 w-5 text-muted-foreground/50" />
                                </div>
                                <div>
                                    <h3 className="font-bold text-sm text-foreground">No history</h3>
                                    <p className="text-[11px] text-muted-foreground mt-1">Recently clicked systems will appear here.</p>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Pin Modules Dialog */}
            <Dialog open={isPinModalOpen} onOpenChange={setIsPinModalOpen}>
                <DialogContent className="sm:max-w-5xl max-w-full max-h-[85vh] flex flex-col p-0 overflow-hidden">
                    <DialogHeader className="p-6 pb-4 border-b">
                        <DialogTitle className="text-xl">Customize Dashboard</DialogTitle>
                        <DialogDescription>
                            Select the modules you want to pin to your quick access grid (Maximum of 8 modules).
                            <span className={`block mt-1 font-semibold ${data.pinned_modules.length > 8 ? 'text-red-500' : 'text-[#00D4FF]'}`}>
                                {data.pinned_modules.length} / 8 selected
                                {data.pinned_modules.length > 8 && " (Please unselect some to save)"}
                            </span>
                        </DialogDescription>
                    </DialogHeader>

                    <div className="flex-1 overflow-y-auto p-6 bg-muted/10 emr-scrollbar">
                        <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                            {ALL_MODULES.map((module) => {
                                const isPinned = data.pinned_modules.includes(module.href);
                                const pinIndex = data.pinned_modules.indexOf(module.href);
                                const isOverLimit = isPinned && pinIndex >= 8;
                                const Icon = module.icon;
                                return (
                                    <div
                                        key={module.href}
                                        onClick={() => handleTogglePin(module.href)}
                                        className={`relative flex cursor-pointer items-center gap-4 rounded-2xl border p-4 transition-all hover:shadow-sm ${isOverLimit
                                            ? 'border-red-500 bg-red-500/5'
                                            : isPinned
                                                ? 'border-[#00D4FF] bg-[#00D4FF]/5'
                                                : 'bg-card hover:border-muted-foreground/30'
                                            }`}
                                    >
                                        <div className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl transition-colors ${isOverLimit ? 'bg-red-500/20 text-red-500' : isPinned ? 'bg-[#00D4FF]/20 text-[#00D4FF]' : 'bg-muted text-muted-foreground'
                                            }`}>
                                            <Icon className="h-5 w-5" />
                                        </div>
                                        <div className="flex-1 pr-6">
                                            <h4 className={`text-sm font-bold ${isPinned ? 'text-foreground' : 'text-foreground/80'}`}>
                                                {module.title}
                                            </h4>
                                            <p className="text-xs text-muted-foreground line-clamp-2 mt-0.5">
                                                {module.description}
                                            </p>
                                        </div>
                                        <div className={`absolute right-4 top-1/2 -translate-y-1/2 flex h-5 w-5 items-center justify-center rounded-full border transition-colors ${isOverLimit ? 'border-red-500 bg-red-500 text-white' : isPinned ? 'border-[#00D4FF] bg-[#00D4FF] text-white' : 'border-muted-foreground/30 text-transparent'
                                            }`}>
                                            {isOverLimit ? <ShieldAlert className="h-3 w-3" /> : <Check className="h-3 w-3" />}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>

                    <DialogFooter className="p-4 border-t bg-card">
                        <Button className="cursor-pointer" variant="outline" onClick={() => setIsPinModalOpen(false)}>
                            Cancel
                        </Button>
                        <Button
                            className={`cursor-pointer ${data.pinned_modules.length > 8 ? 'bg-muted text-muted-foreground hover:bg-muted opacity-50' : 'bg-[#1E293B] hover:bg-[#1E293B]/90'}`}
                            onClick={handleSavePins}
                            disabled={processing || data.pinned_modules.length > 8}
                        >
                            {processing ? 'Saving...' : 'Save Pins'}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </>
    );
}