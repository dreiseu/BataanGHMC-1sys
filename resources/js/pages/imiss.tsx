import { Head, Link, router, useForm, usePage } from '@inertiajs/react';
import LineWaves from '@/components/ui/linewaves';
import {
    Monitor,
    Cpu,
    Server,
    Wifi,
    PlusCircle,
    CheckCircle2,
    Clock,
    Ticket,
    AlertCircle,
    ChevronLeft,
    ChevronRight,
    UploadCloud,
    Users,
    LayoutGrid,
    FileText,
    Activity,
    ExternalLink,
    Search,
    Phone,
    X,
    Star,
    MessageSquare,
    Send,
    Paperclip,
    ArrowDown,
    Minus,
    ArrowUp,
    AlertTriangle,
    MapPin,
    File as FileIcon,
    Loader2
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useState, useEffect, useRef } from 'react';
import { toast } from 'sonner';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import {
    Sheet,
    SheetContent,
    SheetDescription,
    SheetHeader,
    SheetTitle,
} from "@/components/ui/sheet";
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog";

const imissServices = [
    {
        title: 'Network & Connectivity',
        description: 'Wi-Fi access, LAN issues, and VPN setups.',
        icon: Wifi,
    },
    {
        title: 'Hardware Support',
        description: 'Computer repairs, printer issues, and peripherals.',
        icon: Cpu,
    },
    {
        title: 'Software & Systems',
        description: '1SYS access, HRIS, EMR, and standard applications.',
        icon: Monitor,
    },
    {
        title: 'Server & Infrastructure',
        description: 'Server access, database queries, and data backup.',
        icon: Server,
    },
];

interface HospitalSystemType {
    id: number;
    name: string;
    url: string;
}

interface TicketType {
    id: number;
    ticket_number: string;
    request_type: string;
    description: string;
    status: string;
    priority: string;
    location?: string;
    local_number?: string;
    pc_number?: string;
    accepted_at?: string;
    created_at: string;
    updated_at?: string;
    attachments?: string[];
    remarks?: string;
    accepted_by_name?: string;
    comments?: {
        id: number;
        message: string;
        sender_bioid: string;
        sender_name: string;
        created_at: string;
        attachments?: string[];
    }[];
    rating?: number;
    feedback_text?: string;
}
type ImissRequestType = {
    id?: number;
    value: string;
    label: string;
    description?: string | null;
    is_active?: boolean;
};

interface IMISSProps {
    systems: HospitalSystemType[];
    tickets: TicketType[];
    requestTypes?: ImissRequestType[];
}

export default function IMISS({ systems, tickets, requestTypes = [] }: IMISSProps) {
    const requestTypeLabels: Record<string, string> = {};
    requestTypes.forEach(rt => requestTypeLabels[rt.value] = rt.label);

    const { auth } = usePage<any>().props;
    const user = auth?.user;

    const [ssoStatus, setSsoStatus] = useState<'idle' | 'loading' | 'success'>('idle');
    const [currentSSOUrl, setCurrentSSOUrl] = useState('');
    const [isSubmitDialogOpen, setIsSubmitDialogOpen] = useState(false);
    const [isConfirmSubmitOpen, setIsConfirmSubmitOpen] = useState(false);
    const [isDetailsOpen, setIsDetailsOpen] = useState(false);
    const [selectedTicket, setSelectedTicket] = useState<TicketType | null>(null);

    const prevTicketsRef = useRef<TicketType[]>(tickets);

    useEffect(() => {
        if (isDetailsOpen && selectedTicket) {
            router.post('/notifications/read-by-ticket', {
                ticket_number: selectedTicket.ticket_number
            }, {
                preserveScroll: true,
                preserveState: true,
                onSuccess: () => {
                    window.dispatchEvent(new CustomEvent('refresh-notifications'));
                    toast.dismiss(`msg-${selectedTicket.ticket_number}`);
                    toast.dismiss(`status-${selectedTicket.ticket_number}`);
                }
            });
        }
    }, [isDetailsOpen, selectedTicket]);

    useEffect(() => {
        // Restore unread toasts on page load
        fetch('/notifications')
            .then(res => res.json())
            .then(data => {
                const unread = data.filter((n: any) => !n.is_read);
                unread.forEach((n: any) => {
                    const match = n.message.match(/(TKT-\d{4}-\d{3})/);
                    if (match) {
                        const ticketNumber = match[1];
                        
                        if (n.title === 'Ticket Update') {
                            toast(`Ticket ${ticketNumber} Updated`, {
                                id: `status-${ticketNumber}`,
                                description: (
                                    <div
                                        className="cursor-pointer group flex flex-col gap-1"
                                        onClick={() => {
                                            const currentTicket = prevTicketsRef.current.find(t => t.ticket_number === ticketNumber);
                                            if (currentTicket) {
                                                setSelectedTicket(currentTicket);
                                                setIsDetailsOpen(true);
                                            }
                                        }}
                                    >
                                        <span>{n.message.replace(`Your ticket ${ticketNumber} is now: `, 'Status changed to ')}.</span>
                                        <span className="text-blue-500 font-semibold group-hover:underline">Click to view &rarr;</span>
                                    </div>
                                ),
                                icon: <AlertCircle className="h-6 w-6 text-blue-500 mr-5" />,
                                duration: 99999999,
                                closeButton: true,
                            });
                        } else if (n.title === 'New Message') {
                            toast(`New Message on ${ticketNumber}`, {
                                id: `msg-${ticketNumber}`,
                                description: (
                                    <div
                                        className="cursor-pointer group flex flex-col gap-1 mt-0.5"
                                        onClick={() => {
                                            const currentTicket = prevTicketsRef.current.find(t => t.ticket_number === ticketNumber);
                                            if (currentTicket) {
                                                setSelectedTicket(currentTicket);
                                                setIsDetailsOpen(true);
                                            }
                                        }}
                                    >
                                        <span>You have new message(s).</span>
                                        <span className="text-blue-500 font-semibold group-hover:underline">Click to open chat &rarr;</span>
                                    </div>
                                ),
                                icon: <MessageSquare className="h-6 w-6 text-blue-500 mr-5" />,
                                duration: 99999999,
                                closeButton: true,
                            });
                        }
                    }
                });
            })
            .catch(err => console.error('Failed to restore notifications:', err));

        // Check for deep link
        const params = new URLSearchParams(window.location.search);
        const ticketParam = params.get('ticket');
        if (ticketParam) {
            const ticketToOpen = tickets.find(t => t.ticket_number === ticketParam);
            if (ticketToOpen) {
                setSelectedTicket(ticketToOpen);
                setIsDetailsOpen(true);
            }
        }
    }, []);

    useEffect(() => {
        if (prevTicketsRef.current && prevTicketsRef.current !== tickets) {
            tickets.forEach(newTicket => {
                const oldTicket = prevTicketsRef.current.find(t => t.id === newTicket.id);
                if (oldTicket) {
                    if (oldTicket.status !== newTicket.status) {
                        toast(`Ticket ${newTicket.ticket_number} Updated`, {
                            id: `status-${newTicket.ticket_number}`,
                            description: (
                                <div
                                    className="cursor-pointer group flex flex-col gap-1"
                                    onClick={() => {
                                        setSelectedTicket(newTicket);
                                        setIsDetailsOpen(true);
                                    }}
                                >
                                    <span>Status changed to {newTicket.status}.</span>
                                    <span className="text-blue-500 font-semibold group-hover:underline">Click to view &rarr;</span>
                                </div>
                            ),
                            icon: <AlertCircle className="h-6 w-6 text-blue-500 mr-5" />,
                            duration: 99999999,
                            closeButton: true,
                        });
                        router.post('/notifications', {
                            title: 'Ticket Update',
                            message: `Your ticket ${newTicket.ticket_number} is now: ${newTicket.status}`,
                            link: '/imiss'
                        }, {
                            preserveScroll: true,
                            preserveState: true,
                            onSuccess: () => window.dispatchEvent(new CustomEvent('refresh-notifications'))
                        });
                    }
                    const oldCommentsLength = oldTicket.comments?.length || 0;
                    const newCommentsLength = newTicket.comments?.length || 0;
                    if (newCommentsLength > oldCommentsLength) {
                        const newComments = newTicket.comments?.slice(oldCommentsLength) || [];
                        const fromOthers = newComments.filter(c => c.sender_bioid !== user?.bioid);
                        if (fromOthers.length > 0) {
                            toast(`New Message on ${newTicket.ticket_number}`, {
                                id: `msg-${newTicket.ticket_number}`,
                                description: (
                                    <div
                                        className="cursor-pointer group flex flex-col gap-1 mt-0.5"
                                        onClick={() => {
                                            setSelectedTicket(newTicket);
                                            setIsDetailsOpen(true);
                                        }}
                                    >
                                        <span>You have new message(s).</span>
                                        <span className="text-blue-500 font-semibold group-hover:underline">Click to open chat &rarr;</span>
                                    </div>
                                ),
                                icon: <MessageSquare className="h-6 w-6 text-blue-500 mr-5" />,
                                duration: 99999999,
                                closeButton: true,
                            });
                            router.post('/notifications', {
                                title: 'New Message',
                                message: `You have a new message on ticket ${newTicket.ticket_number}`,
                                link: '/imiss'
                            }, {
                                preserveScroll: true,
                                preserveState: true,
                                onSuccess: () => window.dispatchEvent(new CustomEvent('refresh-notifications'))
                            });
                        }
                    }
                }
            });
        }
        prevTicketsRef.current = tickets;

        if (selectedTicket) {
            const updated = tickets.find(t => t.id === selectedTicket.id);
            if (updated) setSelectedTicket(updated);
        }
    }, [tickets]);

    // Poll for ticket updates so the UI reflects admin changes (like marking as Accomplished)
    useEffect(() => {
        const interval = setInterval(() => {
            // @ts-ignore
            router.reload({ only: ['tickets'], preserveScroll: true, preserveState: true });
        }, 15000); // Poll every 15 seconds
        return () => clearInterval(interval);
    }, []);

    const handleVisit = (e: React.MouseEvent, system: HospitalSystemType) => {
        e.preventDefault();
        const url = system.url.startsWith('http') ? system.url : `https://${system.url}`;

        if ((system.name === "Employee's Portal" || system.name === "EFMS Job Order Request System") && user?.password) {
            // Display our beautiful loading overlay so the user knows we are working
            setSsoStatus('loading');
            setCurrentSSOUrl(url);

            // 1. Open a microscopic popup window to hide the 100:Success text
            const windowName = 'sso_popup_' + Date.now();

            const form = document.createElement('form');
            form.method = 'POST';
            form.target = windowName;

            let targetUrl = url;
            if (!targetUrl.endsWith('/login') && !targetUrl.includes('login.php')) {
                targetUrl = targetUrl.endsWith('/') ? `${targetUrl}login` : `${targetUrl}/login`;
            }
            form.action = targetUrl;

            const fields = [
                { name: 'bioid', value: user.bioid },
                { name: 'username', value: user.bioid },
                { name: 'bioUserName', value: user.bioid },
                { name: 'password', value: user.password },
                { name: 'pass', value: user.password },
                { name: 'login', value: 'login' },
                { name: 'loginForm', value: '' }
            ];

            fields.forEach(f => {
                const input = document.createElement('input');
                input.type = 'hidden';
                input.name = f.name;
                input.value = f.value;
                form.appendChild(input);
            });

            document.body.appendChild(form);

            // 2. Open the popup as small and far away as the OS will allow
            const popup = window.open('', windowName, 'width=1,height=1,left=20000,top=20000,menubar=no,toolbar=no,location=no,status=no,titlebar=no,scrollbars=no');
            form.submit();

            // Instantly try to force the popup into the background
            try {
                if (popup) popup.blur();
                window.focus();
            } catch (e) { }

            // 3. Wait for the server to process the login and save the cookie
            setTimeout(() => {
                // Safely close the tiny popup (ignoring cross-origin exceptions)
                try {
                    if (popup && !popup.closed) {
                        popup.close();
                    }
                } catch (e) {
                    try { popup?.close(); } catch (e2) { }
                }

                try {
                    document.body.removeChild(form);
                } catch (e) { }


                // Transition to the success dialog
                setSsoStatus('success');

                // Give the user 1 second to read the "Proceeding..." text before navigating
                setTimeout(() => {
                    window.location.href = url;
                }, 1000);
            }, 1500);
        } else {
            window.open(url, '_blank', 'noopener,noreferrer');
        }
    };

    const [isHistoryOpen, setIsHistoryOpen] = useState(false);
    const [isConfirmResolutionOpen, setIsConfirmResolutionOpen] = useState(false);
    const [isCancelTicketOpen, setIsCancelTicketOpen] = useState(false);

    const [rating, setRating] = useState(0);
    const [feedback, setFeedback] = useState('');
    const commentForm = useForm({
        message: '',
        attachments: [] as File[],
    });

    const messagesEndRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (isDetailsOpen) {
            setTimeout(() => {
                messagesEndRef.current?.scrollIntoView({ behavior: 'auto' });
            }, 50);
        }
    }, [selectedTicket?.comments, isDetailsOpen]);

    const { data, setData, post, processing, reset, errors } = useForm({
        request_type: '',
        description: '',
        local_number: '',
        pc_number: '',
        location: '',
        priority: 'normal',
        attachments: [] as File[],
    });

    const handleSubmitTicket = () => {
        post('/imiss/tickets', {
            preserveScroll: true,
            forceFormData: true,
            onSuccess: () => {
                setIsSubmitDialogOpen(false);
                setActiveTicketIndex(0);
                reset();
            }
        });
    };

    const submitComment = () => {
        if (commentForm.processing) return;
        if (!selectedTicket || (!commentForm.data.message.trim() && commentForm.data.attachments.length === 0)) return;

        const inputElement = document.getElementById('chat-input');
        if (inputElement) inputElement.focus();

        commentForm.post(`/imiss/tickets/${selectedTicket.id}/comments`, {
            preserveScroll: true,
            preserveState: true,
            forceFormData: true,
            onSuccess: () => {
                commentForm.reset();
            }
        });
    };

    const activeTickets = tickets.filter(t => t.status !== 'Resolved' && t.status !== 'Closed' && t.status !== 'Cancelled');
    const [activeTicketIndex, setActiveTicketIndex] = useState(0);

    const [searchSystem, setSearchSystem] = useState('');
    const [systemPage, setSystemPage] = useState(1);
    const [ticketToResolve, setTicketToResolve] = useState<TicketType | null>(null);
    const itemsPerPage = 5;

    const [historySearch, setHistorySearch] = useState('');
    const [historyStatusFilter, setHistoryStatusFilter] = useState('All');

    const filteredHistoryTickets = tickets.filter(t => {
        const typeLabel = requestTypeLabels[t.request_type] || t.request_type;
        const matchesSearch = t.ticket_number.toLowerCase().includes(historySearch.toLowerCase()) ||
            typeLabel.toLowerCase().includes(historySearch.toLowerCase());
        const matchesStatus = historyStatusFilter === 'All' || t.status === historyStatusFilter;
        return matchesSearch && matchesStatus;
    });

    const filteredSystems = systems.filter(s =>
        s.name.toLowerCase().includes(searchSystem.toLowerCase()) ||
        s.url.toLowerCase().includes(searchSystem.toLowerCase())
    );
    const totalSystemPages = Math.ceil(filteredSystems.length / itemsPerPage);
    const paginatedSystems = filteredSystems.slice((systemPage - 1) * itemsPerPage, systemPage * itemsPerPage);

    return (
        <>
            <Head title="IMISS" />

            <div className="flex flex-col lg:flex-row gap-6 p-6 mx-auto w-full max-w-7xl">
                {/* Main Content Column */}
                <div className="flex-1 flex flex-col gap-6">

                    {/* Hero Banner */}
                    <section className="relative overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-br from-[#1E293B] to-[#0F172A] p-8 shadow-lg min-h-[220px] flex flex-col justify-center">
                        <div className="absolute inset-0 z-0">
                            <LineWaves />
                        </div>
                        <div className="absolute top-0 right-0 -mt-16 -mr-16 h-64 w-64 rounded-full bg-[#00D4FF] opacity-20 blur-3xl mix-blend-screen pointer-events-none"></div>
                        <div className="absolute bottom-0 left-0 -mb-16 -ml-16 h-64 w-64 rounded-full bg-[#1E293B] opacity-40 blur-3xl mix-blend-screen pointer-events-none"></div>

                        <div className="relative z-10 w-full max-w-3xl">
                            <p className="text-sm font-bold tracking-widest text-[#00D4FF] uppercase drop-shadow-sm flex items-center gap-2">
                                <Server className="h-4 w-4" />
                                IT Support & Helpdesk
                            </p>
                            <h1 className="mt-2 text-3xl font-bold tracking-tight text-white sm:text-4xl drop-shadow-md">
                                Integrated Management Information System Section
                            </h1>
                            <p className="mt-3 text-base text-white/90 leading-relaxed font-medium mb-6">
                                IMISS is responsible for the hospital's digital infrastructure, software systems, network security, and technical support. We ensure seamless operations for all departments.
                            </p>

                            <button
                                onClick={() => setIsSubmitDialogOpen(true)}
                                className="inline-flex cursor-pointer items-center gap-2 rounded-xl bg-[#00D4FF] px-5 py-3 text-sm font-bold text-[#0F172A] transition-all hover:bg-white hover:shadow-[0_0_20px_rgba(0,212,255,0.4)] hover:-translate-y-0.5"
                            >
                                <PlusCircle className="h-5 w-5" />
                                Submit a New Ticket
                            </button>
                        </div>
                    </section>

                    {/* Hospital Systems Directory */}
                    <section>
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-5">
                            <h2 className="text-xl font-bold text-foreground tracking-tight flex items-center gap-2">
                                <LayoutGrid className="h-5 w-5 text-[#00D4FF]" />
                                Hospital Systems & Portals
                            </h2>
                            <div className="relative w-full sm:w-64">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                <Input
                                    placeholder="Search systems..."
                                    className="pl-9 rounded-xl bg-card border-muted-foreground/20"
                                    value={searchSystem}
                                    onChange={(e) => {
                                        setSearchSystem(e.target.value);
                                        setSystemPage(1); // Reset to first page on search
                                    }}
                                />
                            </div>
                        </div>

                        <div className="rounded-2xl border bg-card overflow-hidden shadow-sm">
                            <table className="w-full text-left text-sm">
                                <thead className="bg-muted/50 border-b">
                                    <tr>
                                        <th className="px-4 py-3 font-semibold text-muted-foreground">System Name</th>
                                        <th className="px-4 py-3 font-semibold text-muted-foreground">URL</th>
                                        <th className="px-4 py-3 font-semibold text-muted-foreground text-right">Action</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-border">
                                    {paginatedSystems.length > 0 ? (
                                        <>
                                            {paginatedSystems.map((system) => {
                                                return (
                                                    <tr key={system.id} className="group hover:bg-[#1E293B]/5 transition-colors h-[57px]">
                                                        <td className="px-4 py-2 font-semibold text-foreground group-hover:text-[#1E293B] transition-colors">
                                                            {system.name}
                                                        </td>
                                                        <td className="px-4 py-2 text-muted-foreground">
                                                            {system.url}
                                                        </td>
                                                        <td className="px-4 py-2 text-right">
                                                            <button
                                                                onClick={(e) => handleVisit(e, system)}
                                                                className="inline-flex items-center gap-1.5 rounded-lg bg-muted/50 px-3 py-1.5 text-xs font-semibold text-foreground hover:bg-[#00D4FF] hover:text-[#0F172A] transition-all cursor-pointer"
                                                            >
                                                                Visit <ExternalLink className="h-3 w-3" />
                                                            </button>
                                                        </td>
                                                    </tr>
                                                );
                                            })}
                                            {/* Padding for empty rows to maintain fixed table height */}
                                            {Array.from({ length: itemsPerPage - paginatedSystems.length }).map((_, index) => (
                                                <tr key={`empty-${index}`} className="h-[57px]">
                                                    <td colSpan={3} className="border-0"></td>
                                                </tr>
                                            ))}
                                        </>
                                    ) : (
                                        <tr className="h-[285px]">
                                            <td colSpan={3} className="px-4 text-center text-muted-foreground">
                                                No systems found matching "{searchSystem}"
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>

                            {/* Pagination Controls */}
                            {totalSystemPages > 1 && (
                                <div className="flex items-center justify-between border-t bg-muted/20 px-4 py-3">
                                    <div className="text-xs text-muted-foreground">
                                        Showing <span className="font-medium text-foreground">{(systemPage - 1) * itemsPerPage + 1}</span> to <span className="font-medium text-foreground">{Math.min(systemPage * itemsPerPage, filteredSystems.length)}</span> of <span className="font-medium text-foreground">{filteredSystems.length}</span> entries
                                    </div>
                                    <div className="flex gap-1">
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={() => setSystemPage(p => Math.max(1, p - 1))}
                                            disabled={systemPage === 1}
                                            className="h-8 rounded-lg"
                                        >
                                            Previous
                                        </Button>
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={() => setSystemPage(p => Math.min(totalSystemPages, p + 1))}
                                            disabled={systemPage === totalSystemPages}
                                            className="h-8 rounded-lg"
                                        >
                                            Next
                                        </Button>
                                    </div>
                                </div>
                            )}
                        </div>
                    </section>

                    {/* IMISS Services Grid */}
                    <section className="mt-2">
                        <h2 className="mb-5 text-xl font-bold text-foreground tracking-tight">
                            IMISS Services
                        </h2>

                        <div className="grid gap-4 sm:grid-cols-2">
                            {imissServices.map((service) => {
                                const Icon = service.icon;

                                return (
                                    <div
                                        key={service.title}
                                        className="group relative overflow-hidden rounded-2xl border bg-card p-5 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-md hover:border-[#00D4FF]/40 cursor-default"
                                    >
                                        <div className="absolute inset-0 bg-gradient-to-br from-[#00D4FF]/5 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100 pointer-events-none" />

                                        <div className="relative z-10">
                                            <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-[#1E293B]/10 text-[#1E293B] transition-colors duration-300 group-hover:bg-[#00D4FF]/10 group-hover:text-[#00D4FF]">
                                                <Icon className="h-6 w-6 transition-transform duration-300 group-hover:scale-110" />
                                            </div>

                                            <h3 className="font-bold text-foreground group-hover:text-[#1E293B] transition-colors">
                                                {service.title}
                                            </h3>

                                            <p className="mt-1 text-sm text-muted-foreground leading-snug">
                                                {service.description}
                                            </p>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </section>
                </div>

                {/* Sidebar Column */}
                <div className="w-full lg:w-[360px] shrink-0 flex flex-col gap-6">

                    {/* Active Ticket Card */}
                    <div className="rounded-3xl border bg-card p-6 shadow-sm relative overflow-hidden group">
                        <div className="absolute inset-0 bg-gradient-to-br from-[#1E293B]/5 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100 pointer-events-none" />

                        <div className="flex items-center justify-between mb-4 relative z-10">
                            <h2 className="text-base font-bold tracking-tight">
                                Active Tickets
                            </h2>
                            {activeTickets.length > 0 && (
                                <div className="flex items-center gap-2">
                                    <div className="rounded-full bg-[#00D4FF]/10 px-2.5 py-1 text-xs font-bold text-[#00D4FF] flex items-center gap-1.5 border border-[#00D4FF]/20">
                                        <Clock className="h-3 w-3" />
                                        {activeTicketIndex + 1} of {activeTickets.length} Ongoing
                                    </div>
                                    {activeTickets.length > 1 && (
                                        <div className="flex gap-1">
                                            <button
                                                onClick={() => setActiveTicketIndex(prev => Math.max(0, prev - 1))}
                                                disabled={activeTicketIndex === 0}
                                                className="h-6 w-6 rounded-full bg-muted flex items-center justify-center hover:bg-[#00D4FF]/20 disabled:opacity-30 disabled:cursor-not-allowed transition-colors cursor-pointer"
                                            >
                                                <ChevronLeft className="h-4 w-4" />
                                            </button>
                                            <button
                                                onClick={() => setActiveTicketIndex(prev => Math.min(activeTickets.length - 1, prev + 1))}
                                                disabled={activeTicketIndex === activeTickets.length - 1}
                                                className="h-6 w-6 rounded-full bg-muted flex items-center justify-center hover:bg-[#00D4FF]/20 disabled:opacity-30 disabled:cursor-not-allowed transition-colors cursor-pointer"
                                            >
                                                <ChevronRight className="h-4 w-4" />
                                            </button>
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>

                        {activeTickets.length > 0 ? (
                            <div className="space-y-4 relative">
                                {(() => {
                                    const activeTicket = activeTickets[activeTicketIndex];
                                    if (!activeTicket) return null;
                                    return (
                                        <div key={activeTicket.id} className="relative z-10 rounded-2xl border bg-[#00D4FF]/5 p-4 transition-all duration-300">
                                            <div className="mb-3">
                                                <div className="text-[10px] font-bold text-[#1E293B] uppercase tracking-wider mb-1">
                                                    {activeTicket.ticket_number}
                                                </div>
                                                <h3 className="font-semibold text-foreground text-sm leading-snug">
                                                    {requestTypeLabels[activeTicket.request_type] || activeTicket.request_type}
                                                </h3>
                                                {activeTicket.accepted_by_name && (
                                                    <div className="mt-2 text-[11px] font-medium text-muted-foreground flex items-center gap-1.5">
                                                        <div className="h-4 w-4 rounded-full bg-[#00D4FF]/20 flex items-center justify-center shrink-0">
                                                            <div className="h-1.5 w-1.5 rounded-full bg-[#00D4FF]"></div>
                                                        </div>
                                                        <span>Assigned to: <span className="font-semibold text-foreground">{activeTicket.accepted_by_name}</span></span>
                                                    </div>
                                                )}
                                            </div>

                                            <div className="flex flex-col gap-3 relative before:absolute before:inset-y-1 before:left-[9px] before:w-px before:bg-border">
                                                {activeTicket.status === 'Accomplished' && (
                                                    <div className="flex gap-3 relative z-10">
                                                        <div className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-emerald-500 text-white ring-4 ring-card">
                                                            <CheckCircle2 className="h-3 w-3" />
                                                        </div>
                                                        <div>
                                                            <p className="text-xs font-medium text-foreground">Accomplished</p>
                                                            <p className="text-[10px] text-muted-foreground">
                                                                {activeTicket.updated_at ? new Date(activeTicket.updated_at).toLocaleString('en-US', { month: 'short', day: 'numeric', year: 'numeric', hour: 'numeric', minute: '2-digit', hour12: true }) : ''}
                                                            </p>
                                                        </div>
                                                    </div>
                                                )}

                                                {(activeTicket.status === 'In Progress' || activeTicket.status === 'Pending / For Correction' || activeTicket.status === 'Accomplished') && (
                                                    <div className="flex gap-3 relative z-10">
                                                        <div className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-[#00D4FF] text-white ring-4 ring-card">
                                                            <Clock className="h-3 w-3" />
                                                        </div>
                                                        <div>
                                                            <p className="text-xs font-medium text-foreground">
                                                                {activeTicket.status === 'Accomplished' ? 'In Progress' : activeTicket.status}
                                                            </p>
                                                            <p className="text-[10px] text-muted-foreground">
                                                                {activeTicket.accepted_at ? new Date(activeTicket.accepted_at).toLocaleString('en-US', { month: 'short', day: 'numeric', year: 'numeric', hour: 'numeric', minute: '2-digit', hour12: true }) : ''}
                                                            </p>
                                                        </div>
                                                    </div>
                                                )}

                                                <div className="flex gap-3 relative z-10">
                                                    <div className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-muted text-muted-foreground ring-4 ring-card">
                                                        <CheckCircle2 className="h-3 w-3" />
                                                    </div>
                                                    <div>
                                                        <p className="text-xs font-medium text-foreground">Ticket Submitted</p>
                                                        <p className="text-[10px] text-muted-foreground">
                                                            {new Date(activeTicket.created_at).toLocaleString('en-US', { month: 'short', day: 'numeric', year: 'numeric', hour: 'numeric', minute: '2-digit', hour12: true })}
                                                        </p>
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="mt-4">
                                                {activeTicket.status === 'Accomplished' ? (
                                                    <Button
                                                        onClick={() => {
                                                            setTicketToResolve(activeTicket);
                                                            setIsConfirmResolutionOpen(true);
                                                        }}
                                                        className="w-full relative z-10 font-semibold bg-[#1E293B] hover:bg-[#1E293B]/90 text-white cursor-pointer border-none"
                                                    >
                                                        Confirm Resolution
                                                    </Button>
                                                ) : (
                                                    <Button
                                                        variant="outline"
                                                        onClick={() => {
                                                            setSelectedTicket(activeTicket);
                                                            setIsDetailsOpen(true);
                                                        }}
                                                        className="w-full relative z-10 font-semibold border-[#1E293B]/30 text-[#1E293B] hover:bg-[#1E293B]/10 hover:text-[#1E293B] cursor-pointer"
                                                    >
                                                        View Details
                                                    </Button>
                                                )}
                                            </div>
                                        </div>
                                    );
                                })()}
                            </div>
                        ) : (
                            <div className="flex flex-col items-center justify-center text-center p-6 relative z-10 opacity-70">
                                <div className="h-12 w-12 rounded-full bg-muted flex items-center justify-center mb-3 text-muted-foreground">
                                    <CheckCircle2 className="h-6 w-6" />
                                </div>
                                <h3 className="font-semibold text-sm mb-1">No Active Tickets</h3>
                                <p className="text-xs text-muted-foreground">You don't have any ongoing requests at the moment.</p>
                            </div>
                        )}
                    </div>

                    {/* Ticket History */}
                    <div className="rounded-3xl border bg-card p-6 shadow-sm flex flex-col flex-1 overflow-hidden min-h-[300px]">
                        <div className="flex items-center justify-between mb-6 shrink-0">
                            <h2 className="text-lg font-bold tracking-tight">
                                Ticket History
                            </h2>
                            <div className="h-8 w-8 rounded-full bg-[#1E293B]/10 flex items-center justify-center text-[#1E293B]">
                                <Ticket className="h-4 w-4" />
                            </div>
                        </div>

                        <div className="flex flex-col gap-4 flex-1 overflow-y-auto emr-scrollbar pr-2 pb-4">
                            {tickets.length > 0 ? (
                                tickets.slice(0, 6).map((item) => (
                                    <div
                                        key={item.id}
                                        onClick={() => {
                                            setSelectedTicket(item);
                                            setIsDetailsOpen(true);
                                        }}
                                        className="flex gap-3 p-3 rounded-xl hover:bg-muted/50 transition-colors cursor-pointer group shrink-0"
                                    >
                                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-muted group-hover:bg-[#00D4FF]/10 group-hover:text-[#00D4FF] transition-colors">
                                            <Ticket className="h-5 w-5 text-muted-foreground group-hover:text-[#00D4FF]" />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <div className="flex justify-between items-center mb-0.5">
                                                <span className="text-[10px] font-bold text-[#1E293B] uppercase tracking-wider">{item.ticket_number}</span>
                                                <span className="text-[10px] font-medium text-muted-foreground">
                                                    {new Date(item.created_at).toLocaleString('en-US', { month: 'short', day: 'numeric', year: 'numeric', hour: 'numeric', minute: '2-digit', hour12: true })}
                                                </span>
                                            </div>
                                            <p className="text-sm font-semibold text-foreground truncate group-hover:text-[#1E293B] transition-colors">
                                                {requestTypeLabels[item.request_type] || item.request_type}
                                            </p>
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <div className="text-center text-sm text-muted-foreground py-8">
                                    No tickets found.
                                </div>
                            )}
                        </div>

                        <div className="pt-4 border-t shrink-0">
                            <button
                                onClick={() => setIsHistoryOpen(true)}
                                className="flex items-center justify-center gap-1.5 w-full rounded-xl bg-muted/50 p-2.5 text-sm font-semibold text-muted-foreground hover:bg-[#1E293B]/10 hover:text-[#1E293B] transition-colors cursor-pointer"
                            >
                                View all history
                                <ChevronRight className="h-4 w-4" />
                            </button>
                        </div>
                    </div>

                    {/* Emergency Hotlines */}
                    <div className="rounded-3xl border bg-card p-6 shadow-sm flex flex-col mt-auto relative overflow-hidden group">
                        <div className="absolute inset-0 bg-gradient-to-br from-[#00D4FF]/5 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100 pointer-events-none" />

                        <div className="flex items-center gap-3 mb-5 relative z-10">
                            <div className="h-10 w-10 shrink-0 rounded-full bg-[#00D4FF]/10 flex items-center justify-center text-[#00D4FF]">
                                <Phone className="h-5 w-5" />
                            </div>
                            <div>
                                <h2 className="text-lg font-bold tracking-tight leading-none mb-1">
                                    Direct Hotlines
                                </h2>
                                <p className="text-xs text-muted-foreground">For urgent matters only</p>
                            </div>
                        </div>

                        <div className="flex flex-col gap-3 relative z-10">
                            <div className="flex items-center justify-between rounded-xl border bg-muted/30 p-3 hover:bg-[#1E293B]/5 transition-colors">
                                <div className="flex items-center gap-2">
                                    <Cpu className="h-4 w-4 text-[#1E293B]" />
                                    <span className="font-semibold text-sm">Programmers</span>
                                </div>
                                <span className="font-bold text-[#1E293B] bg-[#1E293B]/10 px-2.5 py-0.5 rounded-full text-sm">1114</span>
                            </div>
                            <div className="flex items-center justify-between rounded-xl border bg-muted/30 p-3 hover:bg-[#1E293B]/5 transition-colors">
                                <div className="flex items-center gap-2">
                                    <Monitor className="h-4 w-4 text-[#1E293B]" />
                                    <span className="font-semibold text-sm">Technical Support</span>
                                </div>
                                <span className="font-bold text-[#1E293B] bg-[#1E293B]/10 px-2.5 py-0.5 rounded-full text-sm">1115</span>
                            </div>
                        </div>
                    </div>

                </div>
            </div>

            <Dialog open={isSubmitDialogOpen} onOpenChange={setIsSubmitDialogOpen}>
                <DialogContent className="sm:max-w-[600px] rounded-3xl p-0 overflow-hidden border-0 [&>button]:text-white [&>button]:cursor-pointer data-[state=open]:slide-in-from-bottom-10 data-[state=open]:duration-500 ease-out">
                    <div className="bg-gradient-to-br from-[#1E293B] to-[#0F172A] p-6 text-white relative overflow-hidden">
                        <div className="absolute top-0 right-0 -mt-10 -mr-10 h-32 w-32 rounded-full bg-[#00D4FF] opacity-20 blur-2xl mix-blend-screen pointer-events-none"></div>
                        <div className="absolute bottom-0 left-0 -mb-10 -ml-10 h-32 w-32 rounded-full bg-[#1E293B] opacity-40 blur-2xl mix-blend-screen pointer-events-none"></div>
                        <DialogHeader className="relative z-10">
                            <DialogTitle className="text-xl font-bold flex items-center gap-2 text-white">
                                <Activity className="h-5 w-5 text-[#00D4FF]" />
                                New Job Order Request
                            </DialogTitle>
                            <DialogDescription className="text-white/70 mt-1">
                                Provide the details below to submit a new support ticket to IMISS.
                            </DialogDescription>
                        </DialogHeader>
                    </div>

                    <div className="p-6 grid gap-5">
                        <div className="grid gap-2">
                            <label className="text-sm font-semibold text-foreground">
                                Request Type <span className="text-destructive">*</span>
                            </label>
                            <Select value={data.request_type} onValueChange={(val) => setData('request_type', val)}>
                                <SelectTrigger className="w-full rounded-xl !bg-white focus:ring-[#1E293B]/30 overflow-hidden cursor-pointer">
                                    <SelectValue placeholder="Select type of issue..." />
                                </SelectTrigger>
                                <SelectContent>
                                    {requestTypes.map(rt => (
                                        <SelectItem key={rt.value} value={rt.value}>{rt.label}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                            {errors.request_type && <span className="text-xs text-destructive">{errors.request_type}</span>}
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="grid gap-2">
                                <label className="text-sm font-semibold text-foreground">
                                    Local Number <span className="text-muted-foreground font-normal">(Optional)</span>
                                </label>
                                <div className="relative w-full">
                                    <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#1E293B]/60" />
                                    <Input
                                        placeholder="e.g., 123"
                                        className="w-full rounded-xl pl-9 bg-white focus-visible:ring-[#1E293B]/30"
                                        value={data.local_number}
                                        onChange={e => setData('local_number', e.target.value)}
                                    />
                                </div>
                                {errors.local_number && <span className="text-xs text-destructive">{errors.local_number}</span>}
                            </div>
                            <div className="grid gap-2">
                                <label className="text-sm font-semibold text-foreground">
                                    PC Number <span className="text-muted-foreground font-normal">(Optional)</span>
                                </label>
                                <div className="relative w-full">
                                    <Monitor className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#1E293B]/60" />
                                    <Input
                                        placeholder="e.g., PC-01"
                                        className="w-full rounded-xl pl-9 bg-white focus-visible:ring-[#1E293B]/30"
                                        value={data.pc_number}
                                        onChange={e => setData('pc_number', e.target.value)}
                                    />
                                </div>
                                {errors.pc_number && <span className="text-xs text-destructive">{errors.pc_number}</span>}
                            </div>
                        </div>

                        <div className="grid gap-2">
                            <label className="text-sm font-semibold text-foreground">
                                Location / Ward <span className="text-destructive">*</span>
                            </label>
                            <div className="relative">
                                <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#1E293B]/60" />
                                <Input
                                    placeholder="e.g., Pharmacy Dept, Ward 3"
                                    className="rounded-xl pl-9 bg-white focus-visible:ring-[#1E293B]/30"
                                    value={data.location}
                                    onChange={e => setData('location', e.target.value)}
                                />
                            </div>
                            {errors.location && <span className="text-xs text-destructive">{errors.location}</span>}
                        </div>



                        {/* <div className="grid gap-3 mt-2">
                            <label className="text-sm font-semibold text-foreground">
                                Priority Level <span className="text-destructive">*</span>
                            </label>
                            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                                {[
                                    { id: 'low', label: 'Low', desc: 'Cosmetic', icon: ArrowDown, color: 'text-zinc-500', bg: 'bg-zinc-500/10', border: 'border-zinc-500/30' },
                                    { id: 'normal', label: 'Normal', desc: 'Standard', icon: Minus, color: 'text-blue-500', bg: 'bg-blue-500/10', border: 'border-blue-500/30' },
                                    { id: 'high', label: 'High', desc: 'Blocking', icon: ArrowUp, color: 'text-orange-500', bg: 'bg-orange-500/10', border: 'border-orange-500/30' },
                                    { id: 'critical', label: 'Critical', desc: 'System Down', icon: AlertTriangle, color: 'text-red-500', bg: 'bg-red-500/10', border: 'border-red-500/30' }
                                ].map(p => (
                                    <div
                                        key={p.id}
                                        onClick={() => setData('priority', p.id)}
                                        className={`relative cursor-pointer rounded-2xl border p-3 flex flex-col gap-1 transition-all duration-200 ${data.priority === p.id ? `${p.border} ${p.bg} shadow-sm ring-1 ring-inset ring-${p.color.split('-')[1]}-500/20 translate-y-[1px]` : 'border-border bg-card hover:bg-muted/50 hover:border-muted-foreground/30 hover:-translate-y-0.5'}`}
                                    >
                                        <div className="flex items-center justify-between">
                                            <span className={`text-sm font-bold ${data.priority === p.id ? p.color : 'text-foreground'}`}>{p.label}</span>
                                            <p.icon className={`h-4 w-4 ${data.priority === p.id ? p.color : 'text-muted-foreground'}`} />
                                        </div>
                                        <span className="text-[10px] font-semibold text-muted-foreground/80 uppercase tracking-wider">{p.desc}</span>
                                    </div>
                                ))}
                            </div>
                        </div> */}

                        <div className="grid gap-2">
                            <label className="text-sm font-semibold text-foreground">
                                Problem Encountered <span className="text-destructive">*</span>
                            </label>
                            <Textarea
                                placeholder="Please describe the issue in detail..."
                                className="min-h-[100px] rounded-xl resize-none bg-white focus-visible:ring-[#1E293B]/30"
                                value={data.description}
                                onChange={e => setData('description', e.target.value)}
                            />
                            {errors.description && <span className="text-xs text-destructive">{errors.description}</span>}
                        </div>

                        <div className="grid gap-2">
                            <label className="text-sm font-semibold text-foreground">
                                Attachments (Optional)
                            </label>
                            <label htmlFor="ticket-attachments" className="border-2 border-dashed border-muted rounded-xl p-4 flex flex-col items-center justify-center text-center hover:border-[#00D4FF]/50 transition-colors cursor-pointer bg-card/50 group">
                                <input
                                    id="ticket-attachments"
                                    type="file"
                                    multiple
                                    className="hidden"
                                    onChange={(e) => {
                                        if (e.target.files) {
                                            const newFiles = Array.from(e.target.files);
                                            setData('attachments', [...data.attachments, ...newFiles]);
                                        }
                                    }}
                                />
                                <UploadCloud className="h-6 w-6 text-muted-foreground mb-2 group-hover:text-[#00D4FF] transition-colors" />
                                <p className="text-sm font-medium text-foreground">Click to upload or drag and drop</p>
                                <p className="text-xs text-muted-foreground mt-1">PNG, JPG, or PDF (max. 10MB)</p>
                            </label>

                            {data.attachments.length > 0 && (
                                <div className="mt-2 flex flex-col gap-2">
                                    {data.attachments.map((file, index) => (
                                        <div key={index} className="flex items-center justify-between bg-muted/30 p-2 rounded-lg border text-sm">
                                            <span className="truncate max-w-[200px] sm:max-w-[300px] text-foreground/80">{file.name}</span>
                                            <button
                                                type="button"
                                                onClick={() => {
                                                    const updatedFiles = [...data.attachments];
                                                    updatedFiles.splice(index, 1);
                                                    setData('attachments', updatedFiles);
                                                }}
                                                className="text-muted-foreground hover:text-destructive transition-colors p-1"
                                            >
                                                <X className="h-4 w-4" />
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            )}
                            {errors.attachments && <span className="text-xs text-destructive">{errors.attachments}</span>}
                        </div>
                    </div>

                    <DialogFooter className="px-6 py-4 bg-muted/30 border-t sm:justify-end">
                        <Button
                            variant="ghost"
                            onClick={() => { setIsSubmitDialogOpen(false); reset(); }}
                            className="rounded-xl font-semibold cursor-pointer"
                        >
                            Cancel
                        </Button>
                        <Button
                            onClick={() => setIsConfirmSubmitOpen(true)}
                            disabled={processing}
                            className="rounded-xl bg-[#1E293B] hover:bg-[#00D4FF] text-white font-semibold shadow-sm transition-all cursor-pointer flex items-center gap-2 group"
                        >
                            <span>Submit Request</span>
                            {processing ? (
                                <div className="h-4 w-4 rounded-full border-2 border-white/80 border-t-transparent animate-spin" />
                            ) : (
                                <Send className="h-4 w-4 opacity-70 group-hover:translate-x-0.5 transition-transform" />
                            )}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
            <Dialog open={isDetailsOpen} onOpenChange={setIsDetailsOpen}>
                <DialogContent
                    className="sm:max-w-[600px] rounded-3xl p-0 overflow-hidden border-0 [&>button]:text-white data-[state=open]:slide-in-from-bottom-10 data-[state=open]:duration-500 ease-out"
                    onInteractOutside={(e) => {
                        if (commentForm.processing) {
                            e.preventDefault();
                        }
                    }}
                    onFocusOutside={(e) => {
                        e.preventDefault();
                    }}
                >
                    <div className="bg-gradient-to-br from-[#1E293B] to-[#0F172A] p-6 text-white relative overflow-hidden">
                        <div className="absolute top-0 right-0 -mt-10 -mr-10 h-32 w-32 rounded-full bg-[#00D4FF] opacity-20 blur-2xl mix-blend-screen pointer-events-none"></div>
                        <DialogHeader>
                            <div className="mb-2 relative z-10">
                                <div className="rounded-full bg-white/20 px-2.5 py-1 text-xs font-bold w-fit text-white flex items-center gap-1.5">
                                    <Ticket className="h-3 w-3" />
                                    {selectedTicket?.ticket_number}
                                </div>
                            </div>
                            <div className="flex items-center justify-start gap-3 relative z-10 mt-2 pr-4 sm:pr-8">
                                <DialogTitle className="text-xl font-bold">
                                    {selectedTicket ? (requestTypeLabels[selectedTicket.request_type] || selectedTicket.request_type) : ''}
                                </DialogTitle>
                                <div className="rounded-full bg-white/20 px-2.5 py-1 text-xs font-bold text-white flex items-center gap-1.5 border border-white/10 shrink-0">
                                    {selectedTicket?.status === 'Accomplished' ? <CheckCircle2 className="h-3 w-3" /> : <Clock className="h-3 w-3" />}
                                    {selectedTicket?.status}
                                </div>
                            </div>
                            <DialogDescription asChild>
                                <div className="text-white/80 relative z-10 flex flex-col gap-3 mt-4">
                                    <div className="flex flex-wrap gap-x-6 gap-y-2 text-sm items-center">
                                        <div className="flex items-center gap-2">
                                            <span className="opacity-70 font-medium uppercase tracking-wider text-[10px]">Local #:</span>
                                            <span className="font-bold text-white">{selectedTicket?.local_number || 'N/A'}</span>
                                        </div>
                                        <div className="w-px h-4 bg-white/20 hidden sm:block"></div>
                                        <div className="flex items-center gap-2">
                                            <span className="opacity-70 font-medium uppercase tracking-wider text-[10px]">PC #:</span>
                                            <span className="font-bold text-white">{selectedTicket?.pc_number || 'N/A'}</span>
                                        </div>
                                        <div className="w-px h-4 bg-white/20 hidden sm:block"></div>
                                        <div className="flex items-center gap-2">
                                            <span className="opacity-70 font-medium uppercase tracking-wider text-[10px]">Location:</span>
                                            <span className="font-bold text-white">{selectedTicket?.location || 'Not specified'}</span>
                                        </div>
                                    </div>
                                    <div className="flex flex-col gap-1 mt-1 text-xs">
                                        <span>Submitted on {selectedTicket && new Date(selectedTicket.created_at).toLocaleString('en-US', { month: 'long', day: 'numeric', year: 'numeric', hour: 'numeric', minute: '2-digit', hour12: true })}</span>
                                        {selectedTicket?.accepted_by_name && (
                                            <span className="inline-flex items-center gap-1.5 bg-black/20 w-fit px-2 py-0.5 rounded-full font-medium mt-1 border border-white/5">
                                                Assigned to: {selectedTicket.accepted_by_name}
                                            </span>
                                        )}
                                    </div>
                                </div>
                            </DialogDescription>
                        </DialogHeader>
                    </div>

                    <div className="p-6">

                        <div className="mb-6">
                            <h4 className="text-xs font-bold text-muted-foreground mb-1 uppercase tracking-wider">Problem Description</h4>
                            <div className="text-sm text-foreground/90 whitespace-pre-wrap">
                                {selectedTicket?.description || "No description provided."}
                            </div>
                        </div>

                        {selectedTicket?.remarks && (
                            <div className="mb-6">
                                <h4 className="text-sm font-bold text-[#1E293B] mb-2 uppercase tracking-wider">Admin Remarks</h4>
                                <div className="rounded-xl bg-[#1E293B]/5 p-4 text-sm text-foreground/80 border border-[#1E293B]/20 whitespace-pre-wrap">
                                    {selectedTicket.remarks}
                                </div>
                            </div>
                        )}

                        <div>
                            <h4 className="text-sm font-bold text-foreground mb-4 uppercase tracking-wider">Activity Feed</h4>
                            <div className="flex flex-col gap-4 relative before:absolute before:inset-y-2 before:left-[11px] before:w-px before:bg-border pl-1">
                                {selectedTicket?.status === 'Accomplished' && (
                                    <div className="flex gap-4 relative z-10">
                                        <div className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-emerald-500 text-white ring-4 ring-card">
                                            <CheckCircle2 className="h-3 w-3" />
                                        </div>
                                        <div className="flex-1">
                                            <p className="text-sm font-semibold text-emerald-600">Accomplished</p>
                                            <p className="text-xs text-muted-foreground mb-1">
                                                {selectedTicket.updated_at ? new Date(selectedTicket.updated_at).toLocaleString('en-US', { month: 'short', day: 'numeric', year: 'numeric', hour: 'numeric', minute: '2-digit', hour12: true }) : ''}
                                            </p>
                                            <p className="text-sm text-foreground/90">The requested fix has been implemented.</p>
                                        </div>
                                    </div>
                                )}

                                {(selectedTicket?.status === 'In Progress' || selectedTicket?.status === 'Pending / For Correction' || selectedTicket?.status === 'Accomplished') && (
                                    <div className="flex gap-4 relative z-10">
                                        <div className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[#00D4FF] text-white ring-4 ring-card">
                                            <Clock className="h-3 w-3" />
                                        </div>
                                        <div className="flex-1">
                                            <p className="text-sm font-semibold text-foreground">
                                                {selectedTicket.status === 'Accomplished' ? 'In Progress' : selectedTicket.status}
                                            </p>
                                            <p className="text-xs text-muted-foreground">
                                                {selectedTicket.accepted_at ? new Date(selectedTicket.accepted_at).toLocaleString('en-US', { month: 'short', day: 'numeric', year: 'numeric', hour: 'numeric', minute: '2-digit', hour12: true }) : ''}
                                            </p>
                                        </div>
                                    </div>
                                )}

                                <div className="flex gap-4 relative z-10">
                                    <div className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[#00D4FF] text-white ring-4 ring-card">
                                        <CheckCircle2 className="h-3 w-3" />
                                    </div>
                                    <div className="flex-1">
                                        <p className="text-sm font-semibold text-foreground">Ticket Submitted</p>
                                        <p className="text-xs text-muted-foreground">{selectedTicket && new Date(selectedTicket.created_at).toLocaleString('en-US', { month: 'short', day: 'numeric', year: 'numeric', hour: 'numeric', minute: '2-digit', hour12: true })}</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="border-t border-muted bg-card shrink-0">
                        <div className="p-3 bg-muted/20 font-semibold text-xs flex items-center gap-2 border-b text-foreground">
                            <MessageSquare className="h-3.5 w-3.5 text-[#1E293B]" />
                            Comments & Updates
                        </div>
                        <div className="max-h-48 overflow-y-auto p-4 flex flex-col gap-3 emr-scrollbar bg-card">
                            {selectedTicket?.comments && selectedTicket.comments.length > 0 ? (
                                selectedTicket.comments.map(comment => (
                                    <div key={comment.id} className={`flex flex-col ${comment.sender_bioid === (usePage<any>().props.auth?.user?.bio_id || usePage<any>().props.auth?.user?.id) ? 'items-end' : 'items-start'}`}>
                                        <div className={`text-[10px] text-muted-foreground mb-1 px-1`}>
                                            {comment.sender_name} • {new Date(comment.created_at).toLocaleString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true, month: 'short', day: 'numeric' })}
                                        </div>
                                        <div className={`px-3 py-2 rounded-2xl max-w-[85%] text-sm ${comment.sender_bioid === (usePage<any>().props.auth?.user?.bio_id || usePage<any>().props.auth?.user?.id) ? 'bg-[#1E293B] text-white rounded-br-none' : 'bg-muted rounded-bl-none text-foreground'}`}>
                                            {comment.message && <div>{comment.message}</div>}
                                            {comment.attachments && comment.attachments.length > 0 && (
                                                <div className={`mt-1 flex flex-wrap gap-2 ${comment.message ? 'pt-2 border-t border-white/20' : ''}`}>
                                                    {comment.attachments.map((path, idx) => (
                                                        <div key={idx}>
                                                            {path.match(/\.(jpeg|jpg|png)$/i) ? (
                                                                <a href={`/storage/${path}`} target="_blank" rel="noreferrer">
                                                                    <img src={`/storage/${path}`} alt="attachment" className="max-h-[150px] rounded-lg border border-white/10 hover:opacity-90 transition-opacity" />
                                                                </a>
                                                            ) : (
                                                                <a href={`/storage/${path}`} target="_blank" rel="noreferrer" className="flex items-center gap-2 p-2 bg-black/10 rounded-lg hover:bg-black/20 transition-colors">
                                                                    <FileIcon className="h-4 w-4" />
                                                                    <span className="text-xs font-medium truncate max-w-[150px]">Attachment {idx + 1}</span>
                                                                </a>
                                                            )}
                                                        </div>
                                                    ))}
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <div className="text-center text-muted-foreground text-xs py-4">No comments yet.</div>
                            )}
                            <div ref={messagesEndRef} />
                        </div>
                        <div className="p-3 bg-muted/10 border-t flex flex-col gap-2">
                            {commentForm.data.attachments.length > 0 && (
                                <div className="flex flex-wrap gap-2">
                                    {commentForm.data.attachments.map((file, idx) => (
                                        <div key={idx} className="flex items-center gap-2 text-xs bg-muted/50 p-2 rounded-lg border w-max">
                                            <FileIcon className="h-4 w-4 text-[#1E293B]" />
                                            <span className="truncate max-w-[150px] font-medium">{file.name}</span>
                                            <button onClick={() => {
                                                const inputElement = document.getElementById('chat-input');
                                                if (inputElement) inputElement.focus();

                                                const newAttachments = [...commentForm.data.attachments];
                                                newAttachments.splice(idx, 1);
                                                commentForm.setData('attachments', newAttachments);
                                            }} className="text-muted-foreground hover:text-red-500 transition-colors ml-1">
                                                <X className="h-3 w-3" />
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            )}
                            <div className="flex gap-2 items-center">
                                <Input
                                    id="chat-input"
                                    placeholder="Type a message..."
                                    value={commentForm.data.message}
                                    onChange={(e) => commentForm.setData('message', e.target.value)}
                                    className="rounded-full bg-background"
                                    onKeyDown={(e) => {
                                        if (e.key === 'Enter' && (commentForm.data.message.trim() || commentForm.data.attachments.length > 0) && !commentForm.processing) {
                                            submitComment();
                                        }
                                    }}
                                />
                                <div className="relative shrink-0">
                                    <input
                                        type="file"
                                        multiple
                                        className="absolute inset-0 opacity-0 cursor-pointer w-full"
                                        onChange={(e) => {
                                            if (e.target.files) {
                                                const newFiles = Array.from(e.target.files);
                                                commentForm.setData('attachments', [...commentForm.data.attachments, ...newFiles]);
                                            }
                                            e.target.value = '';
                                        }}
                                        accept=".jpg,.jpeg,.png,.pdf"
                                    />
                                    <Button variant="outline" size="icon" className="rounded-full h-10 w-10 text-muted-foreground hover:text-[#1E293B] cursor-pointer">
                                        <Paperclip className="h-4 w-4" />
                                    </Button>
                                </div>
                                <Button
                                    size="icon"
                                    className="rounded-full shrink-0 bg-[#00D4FF] hover:bg-[#00D4FF]/90 text-white cursor-pointer h-10 w-10"
                                    disabled={(!commentForm.data.message.trim() && commentForm.data.attachments.length === 0)}
                                    onClick={(e) => {
                                        e.preventDefault();
                                        submitComment();
                                    }}
                                >
                                    {commentForm.processing ? (
                                        <div className="h-4 w-4 rounded-full border-2 border-white/80 border-t-transparent animate-spin" />
                                    ) : (
                                        <Send className="h-4 w-4" />
                                    )}
                                </Button>
                            </div>
                        </div>
                    </div>

                    <DialogFooter className="px-6 py-4 bg-muted/30 border-t sm:justify-between items-center gap-3 shrink-0">
                        <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
                            {selectedTicket?.status === 'Ticket Submitted' && (
                                <Button
                                    variant="ghost"
                                    onClick={() => setIsCancelTicketOpen(true)}
                                    className="rounded-xl font-semibold text-destructive hover:bg-destructive/10 hover:text-destructive cursor-pointer"
                                >
                                    Cancel Ticket
                                </Button>
                            )}
                        </div>
                        <Button
                            variant="ghost"
                            onClick={() => setIsDetailsOpen(false)}
                            className="rounded-xl font-semibold cursor-pointer w-full sm:w-auto"
                        >
                            Close Details
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            <Sheet open={isHistoryOpen} onOpenChange={setIsHistoryOpen}>
                <SheetContent side="right" className="w-full sm:max-w-xl p-0 border-l overflow-hidden flex flex-col bg-card">
                    <div className="bg-gradient-to-br from-[#1E293B] to-[#0F172A] p-6 text-white relative shrink-0">
                        <div className="absolute top-0 left-0 -mt-20 -ml-20 h-48 w-48 rounded-full bg-[#00D4FF] opacity-20 blur-3xl mix-blend-screen pointer-events-none"></div>
                        <SheetHeader className="text-left p-0">
                            <SheetTitle className="text-2xl font-bold text-white flex items-center gap-2">
                                <Ticket className="h-6 w-6 text-[#00D4FF]" />
                                All Ticket History
                            </SheetTitle>
                            <SheetDescription className="text-white/80">
                                Browse all your past and active job order requests.
                            </SheetDescription>
                        </SheetHeader>
                    </div>

                    <div className="p-4 border-b bg-muted/20 shrink-0 flex flex-col sm:flex-row gap-3">
                        <div className="relative flex-1">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                            <Input
                                placeholder="Search ticket # or type..."
                                value={historySearch}
                                onChange={(e) => setHistorySearch(e.target.value)}
                                className="pl-9 !bg-white"
                            />
                        </div>
                        <Select value={historyStatusFilter} onValueChange={setHistoryStatusFilter}>
                            <SelectTrigger className="w-full sm:w-[150px] bg-white cursor-pointer">
                                <SelectValue placeholder="Status" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="All" className="cursor-pointer">All Status</SelectItem>
                                <SelectItem value="Pending" className="cursor-pointer">Pending</SelectItem>
                                <SelectItem value="In Progress" className="cursor-pointer">In Progress</SelectItem>
                                <SelectItem value="Accomplished" className="cursor-pointer">Accomplished</SelectItem>
                                <SelectItem value="Resolved" className="cursor-pointer">Resolved</SelectItem>
                                <SelectItem value="Cancelled" className="cursor-pointer">Cancelled</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="flex-1 overflow-y-auto p-6 flex flex-col gap-3 emr-scrollbar">
                        {filteredHistoryTickets.length > 0 ? (
                            filteredHistoryTickets.map((item) => (
                                <div
                                    key={item.id}
                                    onClick={() => { setIsHistoryOpen(false); setIsDetailsOpen(true); }}
                                    className="flex items-center gap-4 p-4 rounded-2xl border bg-card hover:bg-muted/40 hover:border-[#00D4FF]/30 transition-all cursor-pointer group shadow-sm hover:shadow-md"
                                >
                                    <div className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl border-2 bg-transparent group-hover:bg-[#00D4FF]/10 group-hover:border-[#00D4FF] transition-colors ${item.status === 'Accomplished' || item.status === 'Resolved' ? 'border-emerald-500' : 'border-amber-500'}`}>
                                        {item.status === 'Accomplished' || item.status === 'Resolved' ? (
                                            <CheckCircle2 className="h-6 w-6 text-emerald-500 group-hover:text-[#00D4FF]" />
                                        ) : (
                                            <AlertCircle className="h-6 w-6 text-amber-500 group-hover:text-[#00D4FF]" />
                                        )}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <div className="flex justify-between items-center mb-1">
                                            <span className="text-[11px] font-bold text-[#1E293B] uppercase tracking-wider bg-[#1E293B]/10 px-2 py-0.5 rounded-full">{item.ticket_number}</span>
                                            <span className="text-[11px] font-medium text-muted-foreground">
                                                {new Date(item.created_at).toLocaleString('en-US', { month: 'short', day: 'numeric', year: 'numeric', hour: 'numeric', minute: '2-digit', hour12: true })}
                                            </span>
                                        </div>
                                        <p className="text-sm font-bold text-foreground truncate group-hover:text-[#1E293B] transition-colors">
                                            {requestTypeLabels[item.request_type] || item.request_type}
                                        </p>
                                        <p className="text-xs text-muted-foreground mt-1 truncate">
                                            Status: {item.status}
                                        </p>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <div className="text-center text-sm text-muted-foreground py-10">
                                No ticket history found.
                            </div>
                        )}
                    </div>
                </SheetContent>
            </Sheet>

            <AlertDialog open={isConfirmResolutionOpen} onOpenChange={setIsConfirmResolutionOpen}>
                <AlertDialogContent className="rounded-3xl p-6 sm:max-w-[425px]">
                    <AlertDialogHeader className="text-left">
                        <AlertDialogTitle className="text-xl flex items-center gap-3">
                            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-emerald-500/10">
                                <CheckCircle2 className="h-5 w-5 text-emerald-600" />
                            </div>
                            Confirm Ticket Resolution?
                        </AlertDialogTitle>
                        <AlertDialogDescription className="text-sm mt-3">
                            Are you sure you want to mark this ticket as resolved? This confirms that IMISS has successfully fixed your issue. This action cannot be undone.
                        </AlertDialogDescription>
                    </AlertDialogHeader>

                    <div className="py-4 flex flex-col gap-4">
                        <div>
                            <label className="text-sm font-semibold mb-2 block">How would you rate the service?</label>
                            <div className="flex gap-2">
                                {[1, 2, 3, 4, 5].map((star) => (
                                    <Star
                                        key={star}
                                        onClick={() => setRating(star)}
                                        className={`h-8 w-8 cursor-pointer transition-colors ${rating >= star ? 'text-amber-400 fill-amber-400' : 'text-muted-foreground/30 hover:text-amber-400/50'}`}
                                    />
                                ))}
                            </div>
                        </div>
                        <div>
                            <label className="text-sm font-semibold mb-2 block">Feedback (Optional)</label>
                            <Textarea
                                placeholder="Tell us about your experience..."
                                value={feedback}
                                onChange={(e) => setFeedback(e.target.value)}
                                className="resize-none"
                            />
                        </div>
                    </div>

                    <AlertDialogFooter className="mt-2 sm:justify-center flex-col sm:flex-row gap-3">
                        <AlertDialogCancel className="mt-0 rounded-xl font-semibold sm:w-full">
                            Wait, not yet
                        </AlertDialogCancel>
                        <AlertDialogAction
                            onClick={() => {
                                if (ticketToResolve) {
                                    router.put('/imiss/tickets/' + ticketToResolve.id + '/resolve', {
                                        rating,
                                        feedback_text: feedback
                                    }, {
                                        preserveScroll: true,
                                        onSuccess: () => {
                                            setIsConfirmResolutionOpen(false);
                                            setRating(0);
                                            setFeedback('');
                                        }
                                    });
                                } else {
                                    setIsConfirmResolutionOpen(false);
                                }
                            }}
                            className="rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-semibold sm:w-full"
                        >
                            Yes, it's fixed!
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>

            <AlertDialog open={isCancelTicketOpen} onOpenChange={setIsCancelTicketOpen}>
                <AlertDialogContent className="rounded-3xl p-6 sm:max-w-[425px]">
                    <AlertDialogHeader className="text-left">
                        <AlertDialogTitle className="text-xl flex items-center gap-3">
                            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-destructive/10">
                                <AlertCircle className="h-5 w-5 text-destructive" />
                            </div>
                            Cancel this Ticket?
                        </AlertDialogTitle>
                        <AlertDialogDescription className="text-sm mt-3">
                            Are you sure you want to cancel this ticket request? This will notify IMISS that support is no longer needed. This action cannot be undone.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter className="mt-6 sm:justify-end flex-col sm:flex-row gap-3">
                        <AlertDialogCancel className="mt-0 rounded-xl font-semibold cursor-pointer">
                            Nevermind
                        </AlertDialogCancel>
                        <AlertDialogAction
                            onClick={() => {
                                if (selectedTicket) {
                                    router.put('/imiss/tickets/' + selectedTicket.id + '/cancel', {}, {
                                        preserveScroll: true,
                                        onSuccess: () => {
                                            setIsCancelTicketOpen(false);
                                            setIsDetailsOpen(false);
                                        }
                                    });
                                } else {
                                    setIsCancelTicketOpen(false);
                                    setIsDetailsOpen(false);
                                }
                            }}
                            className="rounded-xl bg-destructive hover:bg-destructive/90 text-white font-semibold cursor-pointer"
                        >
                            Yes, Cancel Ticket
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>

            <AlertDialog open={isConfirmSubmitOpen} onOpenChange={setIsConfirmSubmitOpen}>
                <AlertDialogContent className="sm:max-w-[425px] rounded-2xl border-0 bg-card p-6 shadow-2xl">
                    <AlertDialogHeader className="text-left">
                        <AlertDialogTitle className="text-xl flex items-center gap-3">
                            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#00D4FF]/10">
                                <AlertCircle className="h-5 w-5 text-[#00D4FF]" />
                            </div>
                            Confirm Submission
                        </AlertDialogTitle>
                        <AlertDialogDescription className="text-sm mt-3 text-foreground/80">
                            The turnaround time for this request is <strong>2 hours</strong>. Do you want to continue submitting this job order?
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter className="mt-6 sm:justify-end flex-col sm:flex-row gap-3">
                        <AlertDialogCancel className="mt-0 rounded-xl font-semibold cursor-pointer">
                            No, Cancel
                        </AlertDialogCancel>
                        <AlertDialogAction
                            onClick={(e) => {
                                e.preventDefault();
                                setIsConfirmSubmitOpen(false);
                                handleSubmitTicket();
                            }}
                            disabled={processing}
                            className="rounded-xl bg-[#00D4FF] hover:bg-[#00D4FF]/90 text-neutral-900 font-bold cursor-pointer"
                        >
                            Yes, Continue
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>

            {/* SSO Loading & Success Overlay */}
            {ssoStatus !== 'idle' && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center bg-background/80 backdrop-blur-sm">
                    <div className="flex flex-col items-center p-8 bg-card rounded-2xl shadow-2xl border border-border w-[350px]">
                        {ssoStatus === 'loading' ? (
                            <>
                                <Loader2 className="h-12 w-12 text-[#00D4FF] animate-spin mb-4" />
                                <h3 className="text-xl font-semibold text-foreground">Unified Access Portal</h3>
                                <p className="text-sm text-muted-foreground mt-1 text-center">Authenticating securely to<br />Employee's Portal...</p>
                            </>
                        ) : (
                            <>
                                <CheckCircle2 className="h-12 w-12 text-green-500 mb-4" />
                                <h3 className="text-xl font-semibold text-foreground">Authentication Complete</h3>
                                <p className="text-sm text-muted-foreground mt-1 text-center mb-4">You have been successfully signed in.</p>
                                <div className="flex items-center text-sm font-medium text-[#00D4FF]">
                                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                                    Proceeding to dashboard...
                                </div>
                            </>
                        )}
                    </div>
                </div>
            )}
        </>
    );
}
