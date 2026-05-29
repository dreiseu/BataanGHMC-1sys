import { Link, usePage } from '@inertiajs/react';
import { ChevronRight } from 'lucide-react';
import {
    Collapsible,
    CollapsibleContent,
    CollapsibleTrigger,
} from '@/components/ui/collapsible';
import {
    SidebarGroupContent,
    SidebarGroupLabel,
    SidebarGroup,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
    SidebarMenuSub,
    SidebarMenuSubButton,
    SidebarMenuSubItem,
    useSidebar,
} from '@/components/ui/sidebar';
import { useCurrentUrl } from '@/hooks/use-current-url';
import type { NavItem } from '@/types';

export function NavMain({
    title,
    items = [],
    emptyMessage = 'No matching menu items.',
}: {
    title?: string;
    items: NavItem[];
    emptyMessage?: string;
}) {
    const page = usePage();
    const { isCurrentUrl, isCurrentOrParentUrl } = useCurrentUrl();
    const { state } = useSidebar();

    const isHrefActive = (href: NavItem['href']) => {
        const hrefString = typeof href === 'string' ? href : String(href);

        if (hrefString.includes('?')) {
            return page.url === hrefString;
        }

        return isCurrentUrl(href);
    };

    return (
        <SidebarGroup className="px-2 py-0">
            {title ? (
                <SidebarGroupLabel className="px-2 text-[0.68rem] font-semibold uppercase tracking-[0.16em] text-sidebar-foreground/45">
                    {title}
                </SidebarGroupLabel>
            ) : null}
            <SidebarGroupContent>
                <SidebarMenu>
                    {items.length > 0 ? (
                        items.map((item) => (
                            item.items?.length ? (
                                state === 'collapsed' ? (
                                    <SidebarMenuItem key={item.title}>
                                        <SidebarMenuButton
                                            asChild
                                            isActive={
                                                isHrefActive(item.href)
                                                || item.items.some((child) => isHrefActive(child.href))
                                            }
                                            className="h-9 rounded-lg px-3 font-medium text-sidebar-foreground/72 hover:bg-sidebar-accent hover:text-sidebar-foreground data-[active=true]:bg-sidebar-accent data-[active=true]:text-sidebar-foreground data-[active=true]:shadow-sm"
                                            tooltip={{ children: item.title }}
                                        >
                                            <Link href={item.href} prefetch>
                                                {item.icon && <item.icon />}
                                                <span>{item.title}</span>
                                            </Link>
                                        </SidebarMenuButton>
                                    </SidebarMenuItem>
                                ) : (
                                    <Collapsible
                                        key={item.title}
                                        asChild
                                        defaultOpen={item.items.some((child) => isHrefActive(child.href))}
                                        className="group/collapsible"
                                    >
                                        <SidebarMenuItem>
                                            <CollapsibleTrigger asChild>
                                                <SidebarMenuButton
                                                    isActive={
                                                        item.items.some((child) => isHrefActive(child.href))
                                                    }
                                                    className="h-9 rounded-lg px-3 font-medium text-sidebar-foreground/72 hover:bg-sidebar-accent hover:text-sidebar-foreground data-[active=true]:bg-sidebar-accent data-[active=true]:text-sidebar-foreground data-[active=true]:shadow-sm"
                                                >
                                                    {item.icon && <item.icon />}
                                                    <span>{item.title}</span>
                                                    <ChevronRight className="ml-auto size-4 transition-transform duration-200 group-data-[state=open]/collapsible:rotate-90" />
                                                </SidebarMenuButton>
                                            </CollapsibleTrigger>

                                            <CollapsibleContent>
                                                <SidebarMenuSub>
                                                    {item.items.map((child) => (
                                                        <SidebarMenuSubItem key={child.title}>
                                                            <SidebarMenuSubButton
                                                                asChild
                                                                isActive={isHrefActive(child.href)}
                                                            >
                                                                <Link href={child.href} prefetch>
                                                                    <span>{child.title}</span>
                                                                </Link>
                                                            </SidebarMenuSubButton>
                                                        </SidebarMenuSubItem>
                                                    ))}
                                                </SidebarMenuSub>
                                            </CollapsibleContent>
                                        </SidebarMenuItem>
                                    </Collapsible>
                                )
                            ) : (
                                <SidebarMenuItem key={item.title}>
                                    <SidebarMenuButton
                                        asChild
                                        isActive={isCurrentOrParentUrl(item.href)}
                                        className="h-9 rounded-lg px-3 font-medium text-sidebar-foreground/72 hover:bg-sidebar-accent hover:text-sidebar-foreground data-[active=true]:bg-sidebar-accent data-[active=true]:text-sidebar-foreground data-[active=true]:shadow-sm"
                                        tooltip={{ children: item.title }}
                                    >
                                        <Link href={item.href} prefetch>
                                            {item.icon && <item.icon />}
                                            <span>{item.title}</span>
                                        </Link>
                                    </SidebarMenuButton>
                                </SidebarMenuItem>
                            )
                        ))
                    ) : (
                        <SidebarMenuItem>
                            <div className="px-3 py-2 text-sm text-sidebar-foreground/55">
                                {emptyMessage}
                            </div>
                        </SidebarMenuItem>
                    )}
                </SidebarMenu>
            </SidebarGroupContent>
        </SidebarGroup>
    );
}
