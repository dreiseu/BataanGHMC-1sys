import { usePage } from '@inertiajs/react';
import { useEffect } from 'react';
import { Toaster } from '@/components/ui/sonner';
import { useTabSessionEnd } from '@/hooks/use-tab-session-end';
import AppLayoutTemplate from '@/layouts/app/app-sidebar-layout';
import type { BreadcrumbItem } from '@/types';

export default function AppLayout({
    breadcrumbs = [],
    children,
}: {
    breadcrumbs?: BreadcrumbItem[];
    children: React.ReactNode;
}) {
    useTabSessionEnd();
    const { url } = usePage();

    useEffect(() => {
        const modulePrefixes = ['/cert', '/hr-portal', '/imiss', '/qr-pass', '/directory', '/user-guide'];
        let matchedHref = '';
        if (url.startsWith('/sso-portal')) {
            matchedHref = url;
        } else {
            matchedHref = modulePrefixes.find(prefix => url.startsWith(prefix)) || '';
        }

        if (matchedHref) {
            try {
                const saved = JSON.parse(localStorage.getItem('recent_modules') || '[]');
                const newSaved = [matchedHref, ...saved.filter((h: string) => h !== matchedHref)].slice(0, 3);
                localStorage.setItem('recent_modules', JSON.stringify(newSaved));
            } catch (e) {
                console.error('Failed to update recent modules', e);
            }
        }
    }, [url]);

    // Auto-generate breadcrumbs based on URL if none are provided
    const activeBreadcrumbs = breadcrumbs.length > 0 ? breadcrumbs : (() => {
        const paths = url.split('?')[0].split('/').filter(Boolean);
        if (paths.length === 0) return [{ title: 'Dashboard', href: '/dashboard' }];

        return paths.map((path, index) => {
            const href = '/' + paths.slice(0, index + 1).join('/');
            const title = path.charAt(0).toUpperCase() + path.slice(1).replace(/-/g, ' ');
            return { title, href };
        });
    })();

    return (
        <>
            <AppLayoutTemplate breadcrumbs={activeBreadcrumbs}>
                {children}
            </AppLayoutTemplate>

            <Toaster />
        </>
    );
}
