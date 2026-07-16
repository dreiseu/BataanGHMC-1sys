import bghmcLogoUrl from '../../images/BGHMC logo hi-res.png';
import { NavUser } from '@/components/nav-user';
import { Bell, CheckCircle2, Mail, MailOpen, Trash2, CheckSquare } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Checkbox } from '@/components/ui/checkbox';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { router } from '@inertiajs/react';

interface UserNotification {
    id: number;
    title: string;
    message: string;
    link: string | null;
    is_read: boolean;
    created_at: string;
}

export function AppGlobalHeader() {
    const [notifications, setNotifications] = useState<UserNotification[]>([]);
    const [selectedIds, setSelectedIds] = useState<number[]>([]);
    
    const fetchNotifications = () => {
        fetch('/notifications')
            .then(res => res.json())
            .then(data => {
                if (Array.isArray(data)) {
                    setNotifications(data);
                }
            })
            .catch(err => console.error('Error fetching notifications:', err));
    };

    useEffect(() => {
        fetchNotifications();
        // Disabled polling to prevent session blocking:
        // const interval = setInterval(fetchNotifications, 60000); 
        
        const handleNewNotification = () => fetchNotifications();
        window.addEventListener('refresh-notifications', handleNewNotification);

        return () => {
            // clearInterval(interval);
            window.removeEventListener('refresh-notifications', handleNewNotification);
        };
    }, []);

    // The onMouseEnter directly calls router.post to mark as read, removing the need for a separate markAsRead function
    const markAsRead = (id: number) => {
        router.post(`/notifications/${id}/read`, {}, {
            preserveScroll: true,
            preserveState: true,
            onSuccess: () => setNotifications(prev => prev.map(n => n.id === id ? { ...n, is_read: true } : n))
        });
    };

    const markAsUnread = (id: number) => {
        router.post(`/notifications/${id}/unread`, {}, {
            preserveScroll: true,
            preserveState: true,
            onSuccess: () => setNotifications(prev => prev.map(n => n.id === id ? { ...n, is_read: false } : n))
        });
    };

    const deleteNotification = (id: number) => {
        router.delete(`/notifications/${id}`, {
            preserveScroll: true,
            preserveState: true,
            onSuccess: () => {
                setNotifications(prev => prev.filter(n => n.id !== id));
                setSelectedIds(prev => prev.filter(selectedId => selectedId !== id));
            }
        });
    };

    const bulkMarkAsRead = () => {
        if (selectedIds.length === 0) return;
        router.post('/notifications/bulk-read', { ids: selectedIds }, {
            preserveScroll: true,
            preserveState: true,
            onSuccess: () => {
                setNotifications(prev => prev.map(n => selectedIds.includes(n.id) ? { ...n, is_read: true } : n));
                setSelectedIds([]);
            }
        });
    };

    const bulkDelete = () => {
        if (selectedIds.length === 0) return;
        router.post('/notifications/bulk-delete', { ids: selectedIds }, {
            preserveScroll: true,
            preserveState: true,
            onSuccess: () => {
                setNotifications(prev => prev.filter(n => !selectedIds.includes(n.id)));
                setSelectedIds([]);
            }
        });
    };

    const toggleSelectAll = () => {
        if (selectedIds.length === notifications.length && notifications.length > 0) {
            setSelectedIds([]);
        } else {
            setSelectedIds(notifications.map(n => n.id));
        }
    };

    const toggleSelect = (id: number) => {
        setSelectedIds(prev => prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]);
    };

    const unreadCount = notifications.filter(n => !n.is_read).length;

    return (
        <header className="emr-global-header relative flex h-[90px] shrink-0 items-stretch overflow-hidden border-b border-neutral-800 text-white">
            <div className="main-system-header">
                <div className="main-system-left">
                    <div className="main-system-panel">
                        <div className="main-system-left-content">
                            <img src={bghmcLogoUrl} alt="BGHMC Logo" className="main-system-logo" />

                            <div className="main-system-title">
                                <div className="main-system-title-line">1SYS</div>
                                <div className="info-system">
                                    <span className="main-system-title-line text-[0.45em] leading-tight text-white/85">Unified Access Portal</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="main-system-stripes">
                        <div className="main-system-stripes1">
                            <span></span>
                        </div>
                        <div className="main-system-stripes2">
                            <span></span>
                        </div>
                    </div>
                </div>

                <div className="main-system-right flex items-center justify-end px-5 gap-4">
                    <DropdownMenu>
                        <DropdownMenuTrigger className="relative flex h-10 w-10 items-center justify-center rounded-full hover:bg-white/10 transition-colors focus:outline-none cursor-pointer">
                            <Bell className="h-5 w-5 text-white/90" />
                            {unreadCount > 0 && (
                                <span className="absolute top-1 right-1 flex h-4 min-w-[16px] items-center justify-center rounded-full bg-red-500 px-1 text-[10px] font-bold leading-none text-white shadow-sm border border-[#1E293B]">
                                    {unreadCount > 99 ? '99+' : unreadCount}
                                </span>
                            )}
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-[350px]">
                            <div className="flex items-center justify-between px-3 py-2 border-b">
                                <DropdownMenuLabel className="p-0 text-sm font-semibold">Notifications</DropdownMenuLabel>
                                {notifications.length > 0 && (
                                    <div className="flex items-center gap-2">
                                        <button 
                                            onClick={(e) => { e.preventDefault(); e.stopPropagation(); bulkMarkAsRead(); }}
                                            disabled={selectedIds.length === 0}
                                            className={`p-1.5 rounded transition-colors ${selectedIds.length > 0 ? 'text-emerald-500 hover:bg-emerald-500/10' : 'text-muted-foreground/50 cursor-not-allowed'}`}
                                            title="Mark selected as read"
                                        >
                                            <MailOpen className="h-4 w-4" />
                                        </button>
                                        <button 
                                            onClick={(e) => { e.preventDefault(); e.stopPropagation(); bulkDelete(); }}
                                            disabled={selectedIds.length === 0}
                                            className={`p-1.5 rounded transition-colors ${selectedIds.length > 0 ? 'text-destructive hover:bg-destructive/10' : 'text-muted-foreground/50 cursor-not-allowed'}`}
                                            title="Delete selected"
                                        >
                                            <Trash2 className="h-4 w-4" />
                                        </button>
                                    </div>
                                )}
                            </div>
                            
                            {notifications.length > 0 && (
                                <div className="flex items-center px-3 py-2 border-b bg-muted/10 gap-3">
                                    <Checkbox 
                                        checked={selectedIds.length === notifications.length && notifications.length > 0}
                                        onCheckedChange={(checked) => {
                                            toggleSelectAll();
                                        }}
                                        className="rounded-sm"
                                    />
                                    <span className="text-xs text-muted-foreground font-medium">
                                        Select All ({selectedIds.length} selected)
                                    </span>
                                </div>
                            )}

                            <div className="max-h-[350px] overflow-y-auto emr-scrollbar">
                                {notifications.length > 0 ? (
                                    notifications.map(notification => (
                                        <div 
                                            key={notification.id} 
                                            className={`group flex items-start gap-3 p-3 border-b last:border-0 transition-all ${!notification.is_read ? 'bg-[#00D4FF]/10 hover:bg-[#00D4FF]/15' : 'hover:bg-muted/10 opacity-75 hover:opacity-100'}`}
                                        >
                                            <div className="mt-1">
                                                <Checkbox 
                                                    checked={selectedIds.includes(notification.id)}
                                                    onCheckedChange={() => toggleSelect(notification.id)}
                                                    className="rounded-sm"
                                                />
                                            </div>
                                            <div 
                                                className="flex-1 min-w-0 flex items-start gap-2 cursor-pointer hover:opacity-80 transition-opacity"
                                                onClick={() => {
                                                    if (!notification.is_read) {
                                                        markAsRead(notification.id);
                                                    }
                                                    if (notification.link) {
                                                        const match = notification.message.match(/(TKT-\d{4}-\d{3})/);
                                                        if (match) {
                                                            router.visit(`${notification.link}?ticket=${match[1]}`);
                                                        } else {
                                                            router.visit(notification.link);
                                                        }
                                                    }
                                                }}
                                            >
                                                <div className="flex-1 min-w-0">
                                                    <p className={`text-sm ${!notification.is_read ? 'font-bold text-foreground' : 'font-medium text-foreground/80'}`}>{notification.title}</p>
                                                    <p className={`text-xs mt-0.5 line-clamp-2 ${!notification.is_read ? 'text-muted-foreground font-medium' : 'text-muted-foreground/70'}`}>{notification.message}</p>
                                                    <p className={`text-[10px] mt-1 ${!notification.is_read ? 'text-muted-foreground/80 font-medium' : 'text-muted-foreground/50'}`}>
                                                        {new Date(notification.created_at).toLocaleString()}
                                                    </p>
                                                </div>
                                            </div>
                                            <div className="flex flex-col gap-1 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
                                                {notification.is_read ? (
                                                    <button 
                                                        onClick={(e) => { e.preventDefault(); e.stopPropagation(); markAsUnread(notification.id); }}
                                                        className="p-1.5 rounded hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"
                                                        title="Mark as unread"
                                                    >
                                                        <MailOpen className="h-3.5 w-3.5" />
                                                    </button>
                                                ) : (
                                                    <button 
                                                        onClick={(e) => { e.preventDefault(); e.stopPropagation(); markAsRead(notification.id); }}
                                                        className="p-1.5 rounded hover:bg-muted text-emerald-500 transition-colors"
                                                        title="Mark as read"
                                                    >
                                                        <Mail className="h-3.5 w-3.5" />
                                                    </button>
                                                )}
                                                <button 
                                                    onClick={(e) => { e.preventDefault(); e.stopPropagation(); deleteNotification(notification.id); }}
                                                    className="p-1.5 rounded hover:bg-destructive/10 text-muted-foreground hover:text-destructive transition-colors"
                                                    title="Delete"
                                                >
                                                    <Trash2 className="h-3.5 w-3.5" />
                                                </button>
                                            </div>
                                        </div>
                                    ))
                                ) : (
                                    <div className="p-4 text-center text-sm text-muted-foreground">
                                        No notifications yet.
                                    </div>
                                )}
                            </div>
                        </DropdownMenuContent>
                    </DropdownMenu>

                    <NavUser variant="global" />
                </div>
            </div>
        </header>
    );
}
