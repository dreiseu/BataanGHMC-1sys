import { usePage } from '@inertiajs/react';
import { ChevronDown, ChevronsUpDown } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
    useSidebar,
} from '@/components/ui/sidebar';
import { UserInfo } from '@/components/user-info';
import { UserMenuContent } from '@/components/user-menu-content';
import { useInitials } from '@/hooks/use-initials';
import { useIsMobile } from '@/hooks/use-mobile';

export function NavUser({
    variant = 'sidebar',
}: {
    variant?: 'sidebar' | 'header' | 'global';
}) {
    if (variant === 'sidebar') {
        return <NavUserSidebar />;
    }
    return <NavUserHeader variant={variant} />;
}

function NavUserHeader({ variant }: { variant: 'header' | 'global' }) {
    const { auth } = usePage().props;
    const isMobile = useIsMobile();
    const getInitials = useInitials();

    if (!auth.user) return null;

    const side = 'bottom';

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button
                    type="button"
                    variant="ghost"
                    className={
                        variant === 'global'
                            ? 'h-14 min-w-[320px] justify-end gap-3 rounded-xl bg-transparent px-3 text-white hover:bg-white/6 data-[state=open]:bg-white/6 cursor-pointer'
                            : 'h-11 min-w-[240px] justify-start gap-2 rounded-xl border border-border/70 px-3 text-foreground hover:bg-muted data-[state=open]:bg-muted cursor-pointer'
                    }
                    data-test={
                        variant === 'global'
                            ? 'global-user-button'
                            : 'header-user-button'
                    }
                >
                    {variant === 'global' ? (
                        <>
                            <Avatar className="h-10 w-10 overflow-hidden rounded-full border border-white/15">
                                <AvatarImage
                                    src={auth.user.avatar}
                                    alt={auth.user.name}
                                />
                                <AvatarFallback className="bg-neutral-200 text-black">
                                    {getInitials(auth.user.name)}
                                </AvatarFallback>
                            </Avatar>
                            <div className="min-w-0 flex-1 text-left">
                                <div className="truncate text-sm font-semibold tracking-[0.02em] text-white uppercase">
                                    {auth.user.name}
                                </div>
                                <div className="truncate text-xs font-medium text-white/75">
                                    {resolveDivisionLabel(auth.user)}
                                </div>
                            </div>

                            <ChevronDown className="size-4 text-white/70" />
                        </>
                    ) : (
                        <>
                            <UserInfo user={auth.user} />
                            <ChevronsUpDown className="ml-auto size-4 text-muted-foreground" />
                        </>
                    )}
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent
                className="w-(--radix-dropdown-menu-trigger-width) min-w-56 rounded-lg"
                align="end"
                side={side}
            >
                <UserMenuContent user={auth.user} />
            </DropdownMenuContent>
        </DropdownMenu>
    );
}

function NavUserSidebar() {
    const { auth } = usePage().props;
    const { state } = useSidebar();
    const isMobile = useIsMobile();

    if (!auth.user) return null;

    const side = isMobile ? 'bottom' : state === 'collapsed' ? 'left' : 'bottom';

    return (
        <SidebarMenu>
            <SidebarMenuItem>
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <SidebarMenuButton
                            size="lg"
                            className="group h-12 rounded-xl border border-sidebar-border/70 bg-sidebar-accent/40 text-sidebar-foreground hover:bg-sidebar-accent data-[state=open]:bg-sidebar-accent"
                            data-test="sidebar-menu-button"
                        >
                            <UserInfo user={auth.user} />
                            <ChevronsUpDown className="ml-auto size-4" />
                        </SidebarMenuButton>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent
                        className="w-(--radix-dropdown-menu-trigger-width) min-w-56 rounded-lg"
                        align="end"
                        side={side}
                    >
                        <UserMenuContent user={auth.user} />
                    </DropdownMenuContent>
                </DropdownMenu>
            </SidebarMenuItem>
        </SidebarMenu>
    );
}

function resolveDivisionLabel(user: any) {
    return user.SectionName || 'General Section';
}
