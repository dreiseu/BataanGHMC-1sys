import { useMemo, useState } from 'react';
import { usePage } from '@inertiajs/react';
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
} from '@/components/ui/sidebar';

import type { NavItem } from '@/types';

const mainNavItems: NavItem[] = [
    {
        title: 'Home',
        href: '/dashboard',
        icon: LayoutGrid,
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
            { title: 'PETRO', href: '/petro' },
            { title: 'QR-PASS', href: '/qr-pass' },
        ]
    },
    {
        title: 'Resources',
        href: '#',
        icon: BookOpen,
        items: [
            { title: 'Directory', href: '/directory' },
            { title: 'User Guide', href: '/user-guide' },
        ]
    },
    {
        title: 'Utilities',
        href: '/utilities',
        icon: Settings,
        items: [
            { title: 'Directories', href: '/utilities/directories' },
            { title: 'IMISS Request Types', href: '/utilities/imiss-request-types' },
            { title: 'Systems & Portals', href: '/utilities/systems' },
        ]
    },
];

export function AppSidebar() {
    const { hospital_systems } = usePage().props as any;
    const [searchQuery, setSearchQuery] = useState('');

    const dynamicNavItems = useMemo(() => {
        const dynamicSystems = (hospital_systems || []).map((system: any) => {
            const nameLower = system.name.toLowerCase();
            const isEmployeePortal = nameLower.includes('employee') && nameLower.includes('portal');
            const is1App = nameLower === '1app' || nameLower.includes('1app');
            const isIhomp = nameLower === 'ihomp cms' || nameLower.includes('ihomp');
            const isEfms = nameLower.includes('efms');
            
            const isSsoSystem = isEmployeePortal || is1App || isIhomp || isEfms;

            return {
                title: system.name,
                href: isSsoSystem ? `/sso-portal?system=${encodeURIComponent(system.name)}` : system.url
            };
        });

        return mainNavItems.map(item => {
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
        <Sidebar collapsible="icon" variant="inset" className="p-0">
            <SidebarContent className="gap-4 py-3">
                <div className="px-3 pt-2 group-data-[collapsible=icon]:hidden">
                    <div className="relative">
                        <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-sidebar-foreground/45" />
                        <SidebarInput
                            value={searchQuery}
                            onChange={(event) => setSearchQuery(event.target.value)}
                            placeholder="Search menu..."
                            className="h-10 rounded-lg border-sidebar-border/70 bg-sidebar-accent/35 pl-9 text-sidebar-foreground placeholder:text-sidebar-foreground/45 focus-visible:ring-0 focus-visible:ring-offset-0 focus-visible:border-sidebar-ring/50"
                        />
                    </div>
                </div>

                <NavMain
                    title="Platform"
                    items={filteredNavItems}
                    emptyMessage="No matching menu items."
                />
            </SidebarContent>
            <SidebarFooter>
                <div className="p-2 text-xs text-left text-sidebar-foreground/60 group-data-[collapsible=icon]:hidden">
                    Copyright &copy; Bataan General Hospital<br />and Medical Center 2025
                </div>
                <div className="hidden p-2 text-[10px] text-center text-sidebar-foreground/60 group-data-[collapsible=icon]:block font-semibold">
                    BGHMC 2025
                </div>
            </SidebarFooter>
            <SidebarRail />
        </Sidebar>
    );
}
