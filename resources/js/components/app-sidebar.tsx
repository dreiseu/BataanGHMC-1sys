import { useMemo, useState, ComponentProps } from 'react';
import { usePage } from '@inertiajs/react';
import { cn } from '@/lib/utils';
import {
    Activity,
    Award,
    BarChart3,
    BookA,
    BookCopy,
    BookOpen,
    BookUser,
    Box,
    Building2,
    CalendarDays,
    Contact,
    Cpu,
    Drill,
    FileText,
    FolderGit2,
    FormInput,
    GitPullRequest,
    HeartPulse,
    IdCard,
    LayoutGrid,
    Phone,
    QrCode,
    Scroll,
    Search,
    Settings,
    ShieldCheck,
    Siren,
    Stethoscope,
    Users
} from 'lucide-react';
import { Input } from '@/components/ui/input';
import { NavFooter } from '@/components/nav-footer';
import { NavMain } from '@/components/nav-main';
import {
    Sidebar,
    SidebarContent,
    SidebarFooter,
    SidebarInput,
    SidebarRail,
    SidebarTrigger,
} from '@/components/ui/sidebar';

import type { NavItem } from '@/types';

const mainNavItems: NavItem[] = [
    {
        title: 'Home',
        href: '/dashboard',
        icon: LayoutGrid,
    },
    // {
    //     title: 'Recognition Wall',
    //     href: '/recognition',
    //     icon: Award,
    // },
    {
        title: 'Events Calendar',
        href: '/events',
        icon: CalendarDays,
    },
    {
        title: 'Systems',
        href: '#',
        icon: Box,
        items: []
    },
    // {
    //     title: 'Portals',
    //     href: '#',
    //     icon: Users,
    //     items: [
    //     ]
    // },
    {
        title: 'Services',
        href: '#',
        icon: HeartPulse,
        items: [
            { title: 'BataanGHMC-CERT', href: '/cert' },
            { title: 'HR Portal', href: '/hr-portal' },
            { title: 'IMISS', href: '/imiss' },
            { title: 'PETRO', href: 'https://sites.google.com/view/bghmc-petro/home' },
            { title: 'QR PASS', href: '/qr-pass' },
        ]
    },
    {
        title: 'Resources',
        href: '#',
        icon: BookOpen,
        items: [
            { title: 'Directory', href: '/directory' },
            // { title: 'Facility Map', href: '/facility-map' },
            { title: 'User Guide', href: '/user-guide' },
        ]
    },
    {
        title: 'Utilities',
        href: '/utilities',
        icon: Settings,
        items: [
            { title: 'Directories', href: '/utilities/directories' },
            { title: 'Events', href: '/utilities/events' },
            { title: 'HR Documents', href: '/utilities/hr-documents' },
            { title: 'IMISS Request Types', href: '/utilities/imiss-request-types' },
            { title: 'Systems & Portals', href: '/utilities/systems' },
            { title: 'User Access', href: '/utilities/user-access' },
            { title: 'Video Orientations', href: '/utilities/video-orientations' },
            { title: 'Audit Logs', href: '/utilities/audit-logs' },
        ]
    },
];

export function AppSidebar({ className, ...props }: ComponentProps<typeof Sidebar>) {
    const { hospital_systems } = usePage().props as any;
    const [searchQuery, setSearchQuery] = useState('');

    const dynamicNavItems = useMemo(() => {
        const { auth } = usePage().props as any;
        const userSection = auth?.user?.SectionName ?? '';
        const isImissUser = userSection === 'Integrated Management Information System Section';

        const dynamicSystems = (hospital_systems || []).map((system: any) => {
            return {
                title: system.name,
                href: system.is_sso ? `/sso-portal?system=${encodeURIComponent(system.name)}` : system.url
            };
        });

        return mainNavItems
            .filter(item => {
                // Hide Utilities for non-IMISS users
                if (item.title === 'Utilities' && !isImissUser) return false;
                return true;
            })
            .map(item => {
                if (item.title === 'Systems') {
                    return {
                        ...item,
                        items: dynamicSystems
                    };
                }
                return item;
            });
    }, [hospital_systems]);

    const filteredNavItems = dynamicNavItems.filter((item) =>
        item.title.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <Sidebar collapsible="icon" variant="inset" className={cn('p-0', className)} {...props}>
            <SidebarContent className="gap-4 py-3">
                <div className="px-3 pt-2 flex items-center gap-2">
                    <div className="relative flex-1 group-data-[collapsible=icon]:hidden">
                        <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-sidebar-foreground/45" />
                        <SidebarInput
                            value={searchQuery}
                            onChange={(event) => setSearchQuery(event.target.value)}
                            placeholder="Search menu..."
                            className="h-10 rounded-lg border-sidebar-border/70 bg-sidebar-accent/35 pl-9 text-sidebar-foreground placeholder:text-sidebar-foreground/45 focus-visible:ring-0 focus-visible:ring-offset-0 focus-visible:border-sidebar-ring/50"
                        />
                    </div>
                    <SidebarTrigger className="cursor-pointer -mr-1 text-slate-200 hover:bg-slate-100 hover:text-slate-900" />
                </div>

                <NavMain
                    title="Platform"
                    items={filteredNavItems}
                    emptyMessage="No matching menu items."
                />
            </SidebarContent>
            <SidebarFooter>
                <div className="p-2 text-xs text-left text-sidebar-foreground/60 group-data-[collapsible=icon]:hidden">
                    Philippine Copyright © 2018 Dr. Glory V. Baltazar
                </div>
                <div className="hidden p-2 text-[10px] text-center text-sidebar-foreground/60 group-data-[collapsible=icon]:block font-semibold">
                    BGHMC 2026
                </div>
            </SidebarFooter>
        </Sidebar>
    );
}
