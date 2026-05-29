import { Head, router, usePage, useForm } from '@inertiajs/react';
import { useState, useEffect, useRef } from 'react';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Search, Ticket, CheckCircle2, Clock, AlertCircle, ExternalLink, Send, Paperclip, File as FileIcon, X } from 'lucide-react';

interface TicketType {
    id: number;
    ticket_number: string;
    bio_id: string;
    request_type: string;
    description: string;
    location: string;
    local_number: string;
    priority: string;
    status: string;
    created_at: string;
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
}

interface ImissAdminProps {
    tickets: TicketType[];
}

const REQUEST_TYPE_LABELS: Record<string, string> = {
    hardware: 'Hardware Repair / Issue',
    network: 'Network / Internet Connectivity',
    software: 'Software Installation / Error',
    account: 'Account Access / Password Reset',
    hims: 'HIMS (Reopening / Cancellation)',
    emr: 'EMR (Records / Charges)',
    other: 'Other Inquiry'
};

export default function ImissAdmin({ tickets }: ImissAdminProps) {
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedTicket, setSelectedTicket] = useState<TicketType | null>(null);
    const [isDetailsOpen, setIsDetailsOpen] = useState(false);
    const [remarks, setRemarks] = useState('');
    const commentForm = useForm({
        message: '',
        attachments: [] as File[],
    });

    const messagesEndRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [selectedTicket?.comments]);

    const page = usePage();
    const currentUserId = (page.props.auth as any)?.user?.bio_id || (page.props.auth as any)?.user?.id;

    useEffect(() => {
        if (selectedTicket) {
            const updated = tickets.find(t => t.id === selectedTicket.id);
            if (updated) setSelectedTicket(updated);
        }
    }, [tickets]);

    // Poll for ticket and comment updates every 15 seconds
    useEffect(() => {
        const interval = setInterval(() => {
            // @ts-ignore
            router.reload({ only: ['tickets'], preserveScroll: true, preserveState: true });
        }, 15000);
        return () => clearInterval(interval);
    }, []);

    const submitComment = () => {
        if (commentForm.processing) return;
        if (!selectedTicket || (!commentForm.data.message.trim() && commentForm.data.attachments.length === 0)) return;

        const inputElement = document.getElementById('admin-chat-input');
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

    const filteredTickets = tickets.filter(t =>
        t.ticket_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
        t.request_type.toLowerCase().includes(searchTerm.toLowerCase()) ||
        t.status.toLowerCase().includes(searchTerm.toLowerCase()) ||
        t.bio_id.toString().includes(searchTerm)
    );

    const handleStatusUpdate = (status: string) => {
        if (!selectedTicket) return;
        router.put(`/imiss/admin/tickets/${selectedTicket.id}/status`, { status, remarks }, {
            preserveScroll: true,
            onSuccess: () => setIsDetailsOpen(false)
        });
    };

    return (
        <>
            <Head title="IMISS Admin" />

            <div className="p-6 mx-auto w-full max-w-7xl">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight text-foreground flex items-center gap-3">
                            <Ticket className="h-8 w-8 text-[#5B0FBE]" />
                            IMISS Helpdesk Tickets
                        </h1>
                        <p className="text-muted-foreground mt-1">Temporary dashboard for managing job order requests.</p>
                    </div>

                    <div className="relative w-full md:w-72">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                            placeholder="Search tickets..."
                            className="pl-9 rounded-xl"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                </div>

                <div className="rounded-2xl border bg-card overflow-hidden shadow-sm">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-sm whitespace-nowrap">
                            <thead className="bg-muted/50 border-b">
                                <tr>
                                    <th className="px-4 py-3 font-semibold text-muted-foreground">Ticket #</th>
                                    <th className="px-4 py-3 font-semibold text-muted-foreground">Submitter ID</th>
                                    <th className="px-4 py-3 font-semibold text-muted-foreground">Type</th>
                                    <th className="px-4 py-3 font-semibold text-muted-foreground">Priority</th>
                                    <th className="px-4 py-3 font-semibold text-muted-foreground">Status</th>
                                    <th className="px-4 py-3 font-semibold text-muted-foreground">Date</th>
                                    <th className="px-4 py-3 font-semibold text-muted-foreground text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-border">
                                {filteredTickets.length > 0 ? filteredTickets.map((ticket) => (
                                    <tr key={ticket.id} className="hover:bg-muted/30 transition-colors">
                                        <td className="px-4 py-3 font-bold text-[#5B0FBE]">{ticket.ticket_number}</td>
                                        <td className="px-4 py-3">{ticket.bio_id}</td>
                                        <td className="px-4 py-3 max-w-[200px] truncate">{REQUEST_TYPE_LABELS[ticket.request_type] || ticket.request_type}</td>
                                        <td className="px-4 py-3">
                                            <span className={`px-2 py-1 rounded-md text-xs font-bold ${ticket.priority === 'critical' ? 'bg-red-100 text-red-700' :
                                                ticket.priority === 'high' ? 'bg-orange-100 text-orange-700' :
                                                    'bg-blue-100 text-blue-700'
                                                }`}>
                                                {ticket.priority}
                                            </span>
                                        </td>
                                        <td className="px-4 py-3">
                                            <span className={`px-2.5 py-1 rounded-full text-xs font-bold flex w-max items-center gap-1.5 ${ticket.status === 'Resolved' || ticket.status === 'Accomplished' ? 'bg-emerald-100 text-emerald-700' :
                                                ticket.status === 'In Progress' ? 'bg-blue-100 text-blue-700' :
                                                    ticket.status === 'Cancelled' ? 'bg-zinc-100 text-zinc-700' :
                                                        'bg-amber-100 text-amber-700'
                                                }`}>
                                                {ticket.status}
                                            </span>
                                        </td>
                                        <td className="px-4 py-3 text-muted-foreground">
                                            {new Date(ticket.created_at).toLocaleDateString()}
                                        </td>
                                        <td className="px-4 py-3 text-right">
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                className="rounded-lg"
                                                onClick={() => {
                                                    setSelectedTicket(ticket);
                                                    setRemarks(ticket.remarks || '');
                                                    setIsDetailsOpen(true);
                                                }}
                                            >
                                                View
                                            </Button>
                                        </td>
                                    </tr>
                                )) : (
                                    <tr>
                                        <td colSpan={8} className="px-4 py-8 text-center text-muted-foreground">
                                            No tickets found.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>

            <Dialog open={isDetailsOpen} onOpenChange={setIsDetailsOpen}>
                <DialogContent
                    className="sm:max-w-[700px] rounded-3xl p-0 overflow-hidden border-0"
                    onInteractOutside={(e) => {
                        if (commentForm.processing) {
                            e.preventDefault();
                        }
                    }}
                    onFocusOutside={(e) => {
                        e.preventDefault();
                    }}
                >
                    <div className="bg-gradient-to-br from-[#5B0FBE] to-[#260554] p-6 text-white relative">
                        <div className="absolute top-0 right-0 -mt-10 -mr-10 h-32 w-32 rounded-full bg-[#00D4FF] opacity-20 blur-2xl"></div>
                        <DialogHeader>
                            <div className="mb-2 relative z-10">
                                <div className="rounded-full bg-white/20 px-2.5 py-1 text-xs font-bold w-fit flex items-center gap-1.5">
                                    <Ticket className="h-3 w-3" />
                                    {selectedTicket?.ticket_number}
                                </div>
                            </div>
                            <div className="flex items-center justify-start gap-3 relative z-10 mt-2 pr-4 sm:pr-8">
                                <DialogTitle className="text-xl font-bold">
                                    {selectedTicket ? (REQUEST_TYPE_LABELS[selectedTicket.request_type] || selectedTicket.request_type) : ''}
                                </DialogTitle>
                                <div className="rounded-full bg-white/20 px-2.5 py-1 text-xs font-bold flex items-center gap-1.5 border border-white/10 shrink-0">
                                    {selectedTicket?.status}
                                </div>
                            </div>
                            <DialogDescription className="text-white/80 relative z-10 flex flex-col gap-3 mt-4">
                                <div className="flex flex-wrap gap-x-6 gap-y-2 text-sm items-center">
                                    <div className="flex items-center gap-2">
                                        <span className="opacity-70 font-medium uppercase tracking-wider text-[10px]">Location:</span>
                                        <span className="font-bold text-white">{selectedTicket?.location || 'Not specified'}</span>
                                    </div>
                                    <div className="w-px h-4 bg-white/20 hidden sm:block"></div>
                                    <div className="flex items-center gap-2">
                                        <span className="opacity-70 font-medium uppercase tracking-wider text-[10px]">Local #:</span>
                                        <span className="font-bold text-white">{selectedTicket?.local_number || 'N/A'}</span>
                                    </div>
                                    <div className="w-px h-4 bg-white/20 hidden sm:block"></div>
                                    <div className="flex items-center gap-2">
                                        <span className="opacity-70 font-medium uppercase tracking-wider text-[10px]">Priority:</span>
                                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${selectedTicket?.priority === 'critical' ? 'bg-red-500 text-white' :
                                            selectedTicket?.priority === 'high' ? 'bg-orange-500 text-white' :
                                                'bg-blue-500 text-white'
                                            }`}>
                                            {selectedTicket?.priority}
                                        </span>
                                    </div>
                                </div>
                                <div className="text-xs mt-1">
                                    Submitted on {selectedTicket && new Date(selectedTicket.created_at).toLocaleString()} by Employee {selectedTicket?.bio_id}
                                </div>
                            </DialogDescription>
                        </DialogHeader>
                    </div>

                    <div className="p-6 grid gap-6 max-h-[60vh] overflow-y-auto emr-scrollbar">

                        <div>
                            <h4 className="text-sm font-bold text-foreground mb-2 uppercase tracking-wider">Problem Description</h4>
                            <div className="rounded-xl bg-muted/30 p-4 text-sm text-foreground/80 border whitespace-pre-wrap">
                                {selectedTicket?.description}
                            </div>
                        </div>

                        {selectedTicket?.attachments && selectedTicket.attachments.length > 0 && (
                            <div>
                                <h4 className="text-sm font-bold text-foreground mb-2 uppercase tracking-wider">Attachments</h4>
                                <div className="flex flex-col gap-2">
                                    {selectedTicket.attachments.map((path, index) => (
                                        <a
                                            key={index}
                                            href={`/storage/${path}`}
                                            target="_blank"
                                            rel="noreferrer"
                                            className="flex items-center gap-2 p-3 border rounded-xl hover:bg-muted/50 transition-colors"
                                        >
                                            <ExternalLink className="h-4 w-4 text-[#5B0FBE]" />
                                            <span className="text-sm font-semibold truncate">{path.split('/').pop()}</span>
                                        </a>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Comments / Chat Section */}
                        <div className="border-t pt-4">
                            <h4 className="text-sm font-bold text-foreground mb-4 uppercase tracking-wider flex items-center gap-2">
                                <Send className="h-4 w-4" />
                                Ticket Communication
                            </h4>

                            <div className="bg-muted/30 rounded-2xl border flex flex-col h-[350px]">
                                <div className="flex-1 p-4 overflow-y-auto emr-scrollbar flex flex-col gap-3">
                                    {selectedTicket?.comments && selectedTicket.comments.length > 0 ? (
                                        selectedTicket.comments.map((comment) => {
                                            const isSelf = comment.sender_bioid?.toString() === currentUserId?.toString();
                                            return (
                                                <div key={comment.id} className={`flex flex-col max-w-[85%] ${isSelf ? 'self-end items-end' : 'self-start items-start'}`}>
                                                    <div className={`p-3 rounded-2xl ${isSelf ? 'bg-[#5B0FBE] text-white rounded-br-sm' : 'bg-background border shadow-sm rounded-bl-sm'}`}>
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
                                                    <span className={`text-[10px] text-muted-foreground mt-1 px-1 flex gap-1 ${isSelf ? 'justify-end' : 'justify-start'}`}>
                                                        <span className="font-semibold">{comment.sender_name}</span> •
                                                        {new Date(comment.created_at).toLocaleString('en-US', { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit', hour12: true })}
                                                    </span>
                                                </div>
                                            );
                                        })
                                    ) : (
                                        <div className="text-center text-muted-foreground text-xs py-8 bg-background rounded-xl border border-dashed">
                                            No communication history yet.
                                        </div>
                                    )}
                                    <div ref={messagesEndRef} />
                                </div>
                                <div className="p-3 bg-muted/10 border-t flex flex-col gap-2">
                                    {commentForm.data.attachments.length > 0 && (
                                        <div className="flex flex-wrap gap-2">
                                            {commentForm.data.attachments.map((file, idx) => (
                                                <div key={idx} className="flex items-center gap-2 text-xs bg-muted/50 p-2 rounded-lg border w-max">
                                                    <FileIcon className="h-4 w-4 text-[#5B0FBE]" />
                                                    <span className="truncate max-w-[150px] font-medium">{file.name}</span>
                                                    <button onClick={() => {
                                                        const inputElement = document.getElementById('admin-chat-input');
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
                                            id="admin-chat-input"
                                            placeholder="Type a message..."
                                            value={commentForm.data.message}
                                            onChange={(e) => commentForm.setData('message', e.target.value)}
                                            className="rounded-full bg-background"
                                            onKeyDown={(e) => {
                                                if (e.key === 'Enter' && (!e.shiftKey) && (commentForm.data.message.trim() || commentForm.data.attachments.length > 0) && !commentForm.processing) {
                                                    e.preventDefault();
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
                                            <Button variant="outline" size="icon" className="rounded-full h-10 w-10 text-muted-foreground hover:text-[#5B0FBE]">
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
                        </div>

                        <div className="grid gap-2 border-t pt-4">
                            <label className="text-sm font-bold text-foreground uppercase tracking-wider">Admin Remarks (Optional)</label>
                            <textarea
                                className="min-h-[80px] rounded-xl resize-none border bg-muted/30 p-4 text-sm"
                                placeholder="Add any notes about the fix or the status..."
                                value={remarks}
                                onChange={e => setRemarks(e.target.value)}
                            />
                        </div>
                    </div>

                    <DialogFooter className="px-6 py-4 bg-muted/30 border-t flex-wrap sm:justify-between items-center gap-3">
                        <div className="flex flex-wrap gap-2 w-full sm:w-auto">
                            {selectedTicket?.status !== 'In Progress' && selectedTicket?.status !== 'Accomplished' && selectedTicket?.status !== 'Resolved' && selectedTicket?.status !== 'Cancelled' && (
                                <Button
                                    onClick={() => handleStatusUpdate('In Progress')}
                                    className="bg-blue-600 hover:bg-blue-700 text-white rounded-xl flex-1 sm:flex-none"
                                >
                                    Accept Ticket
                                </Button>
                            )}

                            {selectedTicket?.status !== 'Pending / For Correction' && selectedTicket?.status !== 'Accomplished' && selectedTicket?.status !== 'Resolved' && selectedTicket?.status !== 'Cancelled' && (
                                <Button
                                    onClick={() => handleStatusUpdate('Pending / For Correction')}
                                    className="bg-amber-600 hover:bg-amber-700 text-white rounded-xl flex-1 sm:flex-none"
                                >
                                    Mark Pending
                                </Button>
                            )}

                            {selectedTicket?.status !== 'Accomplished' && selectedTicket?.status !== 'Resolved' && selectedTicket?.status !== 'Cancelled' && (
                                <Button
                                    onClick={() => handleStatusUpdate('Accomplished')}
                                    className="bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl flex-1 sm:flex-none"
                                >
                                    Mark Accomplished
                                </Button>
                            )}
                        </div>

                        <Button
                            variant="ghost"
                            onClick={() => setIsDetailsOpen(false)}
                            className="rounded-xl font-semibold w-full sm:w-auto"
                        >
                            Close
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </>
    );
}
