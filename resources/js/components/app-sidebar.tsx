import { useMemo, useState } from 'react';
import {
    Activity,
    Award,
    BarChart3,
    BookOpen,
    Building2,
    Contact,
    FileText,
    FolderGit2,
    HeartPulse,
    IdCard,
    LayoutGrid,
    QrCode,
    Search,
    ShieldCheck,
    Siren,
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
        title: 'HR Portal',
        href: '/hr-portal',
        icon: Users,
    },
    {
        title: 'PETRO',
        href: '/petro',
        icon: FileText,
    },
    {
        title: 'PGS',
        href: '/pgs',
        icon: BarChart3,
    },
    {
        title: 'COVID-SAT',
        href: '/covid-sat',
        icon: ShieldCheck,
    },
    {
        title: 'EFMS',
        href: '/efms',
        icon: Building2,
    },
    {
        title: 'IMISS',
        href: '/imiss',
        icon: HeartPulse,
    },
    {
        title: 'PRAISE',
        href: '/praise',
        icon: Award,
    },
    {
        title: "Employee's Portal",
        href: '/employees-portal',
        icon: IdCard,
    },
    {
        title: 'User Guide',
        href: '/user-guide',
        icon: BookOpen,
    },
    {
        title: 'Directory',
        href: '/directory',
        icon: Contact,
    },
    {
        title: 'BataanGHMC-CERT',
        href: '/cert',
        icon: Siren,
    },
    {
        title: 'QR-PASS',
        href: '/qr-pass',
        icon: QrCode,
    },
    {
        title: 'Health & Wellness / PHU',
        href: '/health-wellness',
        icon: Activity,
    },
];

export function AppSidebar() {
    const [searchQuery, setSearchQuery] = useState('');

    const filteredNavItems = mainNavItems.filter((item) =>
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
