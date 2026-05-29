import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useInitials } from '@/hooks/use-initials';
import type { User } from '@/types';

export function UserInfo({
    user,
    showDetails = false,
}: {
    user: User;
    showDetails?: boolean;
}) {
    const getInitials = useInitials();

    return (
        <>
            <Avatar className="h-12 w-12 overflow-hidden rounded-full">
                <AvatarImage src={user.avatar as string} alt={user.name} />
                <AvatarFallback className="rounded-lg bg-neutral-200 text-black dark:bg-neutral-700 dark:text-white">
                    {getInitials(user.name)}
                </AvatarFallback>
            </Avatar>
            <div className="grid flex-1 text-left text-sm leading-tight">
                <span className="truncate font-medium">{user.name}</span>
                {showDetails && (
                    <span className="truncate text-xs text-muted-foreground">
                        {String(user.PositionName || user.bioid || '')}
                    </span>
                )}
            </div>
        </>
    );
}
