import { AppContent } from '@/components/app-content';
import { AppGlobalHeader } from '@/components/app-global-header';
import { AppShell } from '@/components/app-shell';
import { AppSidebar } from '@/components/app-sidebar';
import { AppSidebarHeader } from '@/components/app-sidebar-header';
import type { AppLayoutProps } from '@/types';

export default function AppSidebarLayout({
    children,
    breadcrumbs = [],
}: AppLayoutProps) {
    return (
        <AppShell variant="sidebar">
            <div className="flex h-svh w-full flex-col overflow-hidden">
                <div className="fixed inset-x-0 top-0 z-50 h-[90px]">
                    <AppGlobalHeader />
                </div>

                <div className="mt-[90px] flex h-[calc(100svh-90px)] overflow-hidden [--sidebar-top-offset:5.625rem]">
                    <AppSidebar />
                    <AppContent
                        variant="sidebar"
                        className="h-full min-h-0 overflow-hidden md:m-0 md:min-h-0 md:peer-data-[variant=inset]:min-h-0 md:shadow-none"
                    >
                        <div className="flex h-full min-h-0 flex-1 flex-col">
                            <AppSidebarHeader breadcrumbs={breadcrumbs} />
                            <div className="min-h-0 flex-1 overflow-y-auto overflow-x-hidden emr-scrollbar pb-8">
                                {children}
                            </div>
                        </div>
                    </AppContent>
                </div>
            </div>
        </AppShell>
    );
}
