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
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
    DialogFooter,
} from '@/components/ui/dialog';
import { useState } from 'react';

const ALL_MODULES = [
    {
        title: 'HR Portal',
        description: 'Human resource services and employee records.',
        href: '/hr-portal',
        icon: Users,
    },
    {
        title: 'PETRO',
        description: 'Performance tracking and reporting tools.',
        href: '/petro',
        icon: FileText,
    },
    {
        title: 'PGS',
        description: 'Governance scorecards and monitoring.',
        href: '/pgs',
        icon: LayoutGrid,
    },
    {
        title: 'EFMS',
        description: 'Electronic forms and document management.',
        href: '/efms',
        icon: Building2,
    },
    {
        title: 'IMISS',
        description: 'Integrated hospital operations module.',
        href: '/imiss',
        icon: HeartPulse,
    },
    {
        title: "Employee's Portal",
        description: 'Employee self-service access.',
        href: '/employees-portal',
        icon: IdCard,
    },
    {
        title: 'User Guide',
        description: 'Guides, manuals, and system instructions.',
        href: '/user-guide',
        icon: BookOpen,
    },
    {
        title: 'QR-PASS',
        description: 'QR-based pass and verification tools.',
        href: '/qr-pass',
        icon: QrCode,
    },
];

export default function Dashboard() {
    const { auth, pinnedModules: initialPinnedModules } = usePage<any>().props;
    const userName = auth?.user?.name ? auth.user.name.split(' ')[0] : 'User';

    const savedPins = Array.isArray(initialPinnedModules) ? initialPinnedModules : [];
    const [isPinModalOpen, setIsPinModalOpen] = useState(false);

    const { data, setData, post, processing } = useForm({
        pinned_modules: savedPins,
    });

    const handleTogglePin = (href: string) => {
        setData('pinned_modules',
            data.pinned_modules.includes(href)
                ? data.pinned_modules.filter((h: string) => h !== href)
                : [...data.pinned_modules, href]
        );
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

    const displayModules = ALL_MODULES.filter(m => savedPins.includes(m.href));

    return (
        <>
            <Head title="Home" />

            <div className="flex flex-col lg:flex-row gap-6 p-6 mx-auto w-full max-w-7xl">
                {/* Main Content Column */}
                <div className="flex-1 flex flex-col gap-6">
                    {/* Hero Section */}
                    <section className="relative overflow-hidden rounded-3xl border border-white/10 bg-[#260554] p-8 shadow-lg min-h-[220px] flex items-center">
                        {/* LineWaves Background */}
                        <div className="absolute inset-0 z-0 opacity-40 mix-blend-screen pointer-events-none">
                            <LineWaves
                                speed={0.25}
                                innerLineCount={20}
                                outerLineCount={20}
                                warpIntensity={0.8}
                                edgeFadeWidth={0.2}
                                brightness={0.3}
                                color1="#5B0FBE"
                                color2="#00D4FF"
                                color3="#5B0FBE"
                                enableMouseInteraction={true}
                                mouseInfluence={1.5}
                            />
                        </div>
                        <div className="absolute inset-0 bg-gradient-to-r from-[#5B0FBE] via-[#5B0FBE]/80 to-transparent z-0"></div>

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

                    {/* Announcements Highlight Banner */}
                    <section className="rounded-3xl border border-[#00D4FF]/20 bg-gradient-to-r from-[#00D4FF]/10 to-transparent p-6 shadow-sm flex flex-col sm:flex-row items-center gap-6 relative overflow-hidden">
                        <div className="absolute top-0 right-0 h-full w-1/3 bg-gradient-to-l from-[#00D4FF]/5 to-transparent pointer-events-none" />
                        <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-[#00D4FF]/20 text-[#00D4FF]">
                            <Bell className="h-7 w-7" />
                        </div>
                        <div className="flex-1 text-center sm:text-left">
                            <h2 className="text-xl font-bold tracking-tight text-foreground">
                                System Announcements
                            </h2>
                            <p className="text-sm font-medium text-muted-foreground mt-1">
                                No new announcements. Check back later for important hospital-wide updates.
                            </p>
                        </div>
                        <div className="shrink-0 relative z-10">
                            <Button variant="outline" className="rounded-xl border-[#00D4FF]/20 hover:bg-[#00D4FF]/10 hover:text-[#00D4FF] cursor-pointer">
                                View History
                            </Button>
                        </div>
                    </section>

                    {/* Pinned Modules Grid */}
                    <section>
                        <div className="mb-5 flex items-center justify-between">
                            <h2 className="text-xl font-bold text-foreground tracking-tight flex items-center gap-2">
                                <Pin className="h-5 w-5 text-[#5B0FBE]" />
                                Pinned Modules
                            </h2>
                            <Button variant="ghost" size="sm" onClick={openPinModal} className="text-muted-foreground hover:text-[#5B0FBE] cursor-pointer">
                                <Plus className="h-4 w-4 mr-1" /> Edit Pins
                            </Button>
                        </div>

                        {displayModules.length > 0 ? (
                            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                                {displayModules.map((module) => {
                                    const Icon = module.icon;
                                    return (
                                        <Link
                                            key={module.href}
                                            href={module.href}
                                            className="group relative overflow-hidden rounded-2xl border bg-card p-5 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-md hover:border-[#00D4FF]/40 block"
                                        >
                                            <div className="absolute inset-0 bg-gradient-to-br from-[#00D4FF]/5 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />

                                            <div className="relative z-10">
                                                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-[#5B0FBE]/10 text-[#5B0FBE] transition-colors duration-300 group-hover:bg-[#00D4FF]/10 group-hover:text-[#00D4FF]">
                                                    <Icon className="h-6 w-6 transition-transform duration-300 group-hover:scale-110" />
                                                </div>

                                                <h3 className="font-bold text-foreground">
                                                    {module.title}
                                                </h3>

                                                <p className="mt-1 text-sm text-muted-foreground leading-snug">
                                                    {module.description}
                                                </p>
                                            </div>
                                        </Link>
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
                                <Button onClick={openPinModal} className="mt-6 rounded-xl bg-[#5B0FBE] hover:bg-[#5B0FBE]/90">
                                    <Plus className="h-4 w-4 mr-2" /> Pin Your First Module
                                </Button>
                            </div>
                        )}
                    </section>
                </div>

                {/* Sidebar Column */}
                <div className="w-full lg:w-[320px] shrink-0 flex flex-col gap-6">
                    {/* Useful Links */}
                    <div className="rounded-3xl border bg-card p-6 shadow-sm flex flex-col">
                        <h2 className="text-lg font-bold tracking-tight">
                            Useful Links
                        </h2>

                        <div className="mt-4 flex flex-col gap-3">
                            {[
                                { title: 'Employee Handbook', icon: BookOpen },
                                { title: 'IT Support Portal', icon: FileText },
                                { title: 'Hospital Directory', icon: Contact },
                            ].map((link, i) => {
                                const LinkIcon = link.icon;
                                return (
                                    <a key={i} href="#" className="group flex items-center gap-3 rounded-xl p-3 hover:bg-[#5B0FBE]/5 transition-colors">
                                        <div className="h-9 w-9 rounded-lg bg-muted flex items-center justify-center text-muted-foreground group-hover:bg-[#5B0FBE]/10 group-hover:text-[#5B0FBE] transition-colors">
                                            <LinkIcon className="h-4 w-4" />
                                        </div>
                                        <span className="text-sm font-semibold text-foreground/80 group-hover:text-foreground transition-colors">{link.title}</span>
                                    </a>
                                )
                            })}
                        </div>
                    </div>
                </div>
            </div>

            {/* Pin Modules Dialog */}
            <Dialog open={isPinModalOpen} onOpenChange={setIsPinModalOpen}>
                <DialogContent className="max-w-2xl max-h-[85vh] flex flex-col p-0 overflow-hidden">
                    <DialogHeader className="p-6 pb-4 border-b">
                        <DialogTitle className="text-xl">Customize Dashboard</DialogTitle>
                        <DialogDescription>
                            Select the modules you want to pin to your quick access grid.
                        </DialogDescription>
                    </DialogHeader>

                    <div className="flex-1 overflow-y-auto p-6 bg-muted/10 emr-scrollbar">
                        <div className="grid gap-3 sm:grid-cols-2">
                            {ALL_MODULES.map((module) => {
                                const isPinned = data.pinned_modules.includes(module.href);
                                const Icon = module.icon;
                                return (
                                    <div
                                        key={module.href}
                                        onClick={() => handleTogglePin(module.href)}
                                        className={`relative flex cursor-pointer items-start gap-4 rounded-2xl border p-4 transition-all hover:shadow-sm ${isPinned
                                            ? 'border-[#00D4FF] bg-[#00D4FF]/5'
                                            : 'bg-card hover:border-muted-foreground/30'
                                            }`}
                                    >
                                        <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl transition-colors ${isPinned ? 'bg-[#00D4FF]/20 text-[#00D4FF]' : 'bg-muted text-muted-foreground'
                                            }`}>
                                            <Icon className="h-5 w-5" />
                                        </div>
                                        <div className="flex-1 pr-6">
                                            <h4 className={`text-sm font-semibold ${isPinned ? 'text-foreground' : 'text-foreground/80'}`}>
                                                {module.title}
                                            </h4>
                                            <p className="text-xs text-muted-foreground line-clamp-2 mt-0.5">
                                                {module.description}
                                            </p>
                                        </div>
                                        <div className={`absolute right-4 top-4 flex h-5 w-5 items-center justify-center rounded-full border transition-colors ${isPinned ? 'border-[#00D4FF] bg-[#00D4FF] text-white' : 'border-muted-foreground/30 text-transparent'
                                            }`}>
                                            <Check className="h-3 w-3" />
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
                            className="bg-[#5B0FBE] hover:bg-[#5B0FBE]/90 cursor-pointer"
                            onClick={handleSavePins}
                            disabled={processing}
                        >
                            {processing ? 'Saving...' : 'Save Pins'}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </>
    );
}