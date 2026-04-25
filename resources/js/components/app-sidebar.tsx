import { Link } from '@inertiajs/react';
import { Activity, Award, BarChart3, BookOpen, Building2, Contact, FileText, FolderGit2, HeartPulse, IdCard, LayoutGrid, QrCode, ShieldCheck, Siren, Users } from 'lucide-react';
import AppLogo from '@/components/app-logo';
import { NavFooter } from '@/components/nav-footer';
import { NavMain } from '@/components/nav-main';
import { NavUser } from '@/components/nav-user';
import {
    Sidebar,
    SidebarContent,
    SidebarFooter,
    SidebarHeader,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
} from '@/components/ui/sidebar';
import { dashboard } from '@/routes';
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
        title: 'IHOMP',
        href: '/ihomp',
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

const footerNavItems: NavItem[] = [
    {
        title: 'Repository',
        href: 'https://github.com/laravel/react-starter-kit',
        icon: FolderGit2,
    },
    {
        title: 'Documentation',
        href: 'https://laravel.com/docs/starter-kits#react',
        icon: BookOpen,
    },
];

export function AppSidebar() {
    return (
        <Sidebar collapsible="icon" variant="inset">
            <SidebarHeader>
                <SidebarMenu>
                    <SidebarMenuItem>
                        <SidebarMenuButton size="lg" asChild>
                            <Link href={dashboard()} prefetch>
                                <AppLogo />
                            </Link>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                </SidebarMenu>
            </SidebarHeader>

            <SidebarContent>
                <NavMain items={mainNavItems} />
            </SidebarContent>

            <SidebarFooter>
                <NavFooter items={footerNavItems} className="mt-auto" />
                <NavUser />
            </SidebarFooter>
        </Sidebar>
    );
}
