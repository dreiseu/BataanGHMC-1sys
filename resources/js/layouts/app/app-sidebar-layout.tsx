import { AppContent } from '@/components/app-content';
import { AppGlobalHeader } from '@/components/app-global-header';
import { AppShell } from '@/components/app-shell';
import { AppSidebar } from '@/components/app-sidebar';
import type { AppLayoutProps } from '@/types';

export default function AppSidebarLayout({
    children,
    breadcrumbs = [],
}: AppLayoutProps) {
    return (
        <AppShell variant="sidebar">
            <div className="flex h-svh print:h-auto print:block w-full flex-col overflow-hidden print:overflow-visible">
                <div className="fixed inset-x-0 top-0 z-50 h-[90px] print:hidden">
                    <AppGlobalHeader />
                </div>

                <div className="mt-[90px] print:mt-0 flex print:block h-[calc(100svh-90px)] print:h-auto overflow-hidden print:overflow-visible [--sidebar-top-offset:5.625rem]">
                    <AppSidebar className="print:hidden" />
                    <AppContent
                        variant="sidebar"
                        className="h-full print:h-auto min-h-0 overflow-hidden print:overflow-visible"
                    >
                        <div className="flex print:block h-full print:h-auto min-h-0 flex-1 flex-col">
                            <div className="min-h-0 flex-1 overflow-y-auto print:overflow-visible overflow-x-hidden emr-scrollbar pb-8 print:pb-0">
                                {children}
                            </div>
                        </div>
                    </AppContent>
                </div>
            </div>
        </AppShell>
    );
}
