import { useState, useRef, useEffect } from 'react';
import { Head, useForm, usePage, router } from '@inertiajs/react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';
import { toast } from 'sonner';
import {
    Heart,
    HeartHandshake,
    Award,
    Sparkles,
    Trash2,
    Send,
    ArrowRight,
    Clock,
    Trophy,
    TrendingUp,
    Loader2,
    PartyPopper,
    User,
    Building2,
    Star,
} from 'lucide-react';

interface Recognition {
    id: number;
    sender_name: string;
    sender_department: string | null;
    recipient_name: string;
    recipient_department: string | null;
    message: string;
    likes_count: number;
    is_pinned: boolean;
    created_at: string;
    liked_by_current_user: boolean;
}

interface Props {
    recognitions: Recognition[];
    currentUser: string;
    currentDepartment: string;
}

type SortMode = 'recent' | 'most-liked';

const DEPARTMENTS = [
    'Administration',
    'Human Resources',
    'Finance',
    'Nursing Department',
    'Medical Staff',
    'Laboratory',
    'Radiology',
    'Pharmacy',
    'Engineering',
    'IMISS',
    'Dietary',
    'Housekeeping',
    'Security',
    'Outpatient Department',
    'Emergency Room',
    'Intensive Care Unit',
    'Operating Room',
    'Maternity Ward',
    'Pediatrics',
    'Other',
];

function getInitials(name: string): string {
    return name
        .split(' ')
        .map((n) => n[0])
        .join('')
        .toUpperCase()
        .slice(0, 2);
}

function timeAgo(dateString: string): string {
    const now = new Date();
    const date = new Date(dateString);
    const diffMs = now.getTime() - date.getTime();
    const diffSecs = Math.floor(diffMs / 1000);

    if (diffSecs < 60) return 'just now';
    const diffMins = Math.floor(diffSecs / 60);
    if (diffMins < 60) return `${diffMins}m ago`;
    const diffHours = Math.floor(diffMins / 60);
    if (diffHours < 24) return `${diffHours}h ago`;
    const diffDays = Math.floor(diffHours / 24);
    if (diffDays < 7) return `${diffDays}d ago`;
    const diffWeeks = Math.floor(diffDays / 7);
    if (diffWeeks < 4) return `${diffWeeks}w ago`;
    return date.toLocaleDateString();
}

function getRandomColor(name: string): string {
    const colors = [
        'bg-rose-500', 'bg-violet-500', 'bg-emerald-500', 'bg-amber-500',
        'bg-cyan-500', 'bg-indigo-500', 'bg-pink-500', 'bg-teal-500',
        'bg-orange-500', 'bg-blue-500', 'bg-purple-500', 'bg-lime-500',
    ];
    let hash = 0;
    for (let i = 0; i < name.length; i++) {
        hash = name.charCodeAt(i) + ((hash << 5) - hash);
    }
    return colors[Math.abs(hash) % colors.length];
}

export default function RecognitionPage({ recognitions, currentUser, currentDepartment }: Props) {
    const { errors } = usePage().props as any;
    const [sortMode, setSortMode] = useState<SortMode>('recent');
    const [likingIds, setLikingIds] = useState<Set<number>>(new Set());
    const [deletingIds, setDeletingIds] = useState<Set<number>>(new Set());
    const formRef = useRef<HTMLDivElement>(null);

    const { data, setData, post, processing, reset, wasSuccessful } = useForm({
        recipient_name: '',
        recipient_department: '',
        message: '',
    });

    // Handle success flash
    useEffect(() => {
        if (wasSuccessful) {
            toast.success('🎉 Recognition posted!', {
                description: 'Your kudos has been shared with everyone.',
                duration: 4000,
            });
            reset();
        }
    }, [wasSuccessful]);

    // Show validation errors as toast
    useEffect(() => {
        if (Object.keys(errors).length > 0) {
            Object.values(errors).forEach((error: any) => {
                toast.error(error);
            });
        }
    }, [errors]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        post('/recognition', {
            preserveScroll: true,
            onSuccess: () => {
                if (formRef.current) {
                    formRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' });
                }
            },
        });
    };

    const handleLike = (recognition: Recognition) => {
        if (likingIds.has(recognition.id)) return;
        setLikingIds((prev) => new Set(prev).add(recognition.id));

        router.post(`/recognition/${recognition.id}/like`, {}, {
            preserveScroll: true,
            preserveState: true,
            onSuccess: () => {
                setLikingIds((prev) => {
                    const next = new Set(prev);
                    next.delete(recognition.id);
                    return next;
                });
            },
            onError: () => {
                setLikingIds((prev) => {
                    const next = new Set(prev);
                    next.delete(recognition.id);
                    return next;
                });
                toast.error('Failed to send like. Please try again.');
            },
        });
    };

    const handleDelete = (recognition: Recognition) => {
        if (!confirm('Are you sure you want to delete this recognition?')) return;
        if (deletingIds.has(recognition.id)) return;
        setDeletingIds((prev) => new Set(prev).add(recognition.id));

        router.delete(`/recognition/${recognition.id}`, {
            preserveScroll: true,
            onSuccess: () => {
                toast.success('Recognition deleted.');
                setDeletingIds((prev) => {
                    const next = new Set(prev);
                    next.delete(recognition.id);
                    return next;
                });
            },
            onError: () => {
                toast.error('Failed to delete.');
                setDeletingIds((prev) => {
                    const next = new Set(prev);
                    next.delete(recognition.id);
                    return next;
                });
            },
        });
    };

    const sortedRecognitions = [...recognitions].sort((a, b) => {
        // Pinned always on top
        if (a.is_pinned && !b.is_pinned) return -1;
        if (!a.is_pinned && b.is_pinned) return 1;

        if (sortMode === 'most-liked') {
            return b.likes_count - a.likes_count;
        }
        return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
    });

    return (
        <>
            <Head title="Employee Recognition Wall" />

            <div className="p-4 md:p-6 lg:p-8 max-w-5xl mx-auto space-y-8">
                {/* ==================== HERO HEADER ==================== */}
                <Card className="relative overflow-hidden rounded-3xl border border-border/10 bg-gradient-to-br from-[#1E293B] to-[#0F172A] shadow-lg">
                    <div className="absolute inset-0 overflow-hidden pointer-events-none">
                        <div className="absolute -top-24 -right-24 h-64 w-64 rounded-full bg-amber-500/20 blur-3xl mix-blend-screen" />
                        <div className="absolute -bottom-24 -left-24 h-64 w-64 rounded-full bg-rose-500/20 blur-3xl mix-blend-screen" />
                        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-2xl">
                            <div className="grid grid-cols-5 gap-4 opacity-[0.03]">
                                {Array.from({ length: 25 }).map((_, i) => (
                                    <Star key={i} className="w-8 h-8 text-white" />
                                ))}
                            </div>
                        </div>
                    </div>

                    <div className="p-6 md:p-10 relative z-10">
                        <div className="flex flex-col md:flex-row items-start md:items-center gap-6">
                            <div className="h-20 w-20 rounded-2xl bg-gradient-to-br from-amber-400 to-rose-500 shadow-lg flex items-center justify-center shrink-0">
                                <HeartHandshake className="w-10 h-10 text-white" />
                            </div>
                            <div className="space-y-2">
                                <div className="flex items-center gap-2">
                                    <Badge className="bg-amber-500/20 text-amber-400 hover:bg-amber-500/30 border-0 text-xs font-semibold px-3 py-1">
                                        <Sparkles className="w-3 h-3 mr-1" /> Employee Recognition
                                    </Badge>
                                </div>
                                <h1 className="text-3xl md:text-4xl font-black tracking-tight text-white">
                                    Recognition <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-400 to-rose-400">Wall</span>
                                </h1>
                                <p className="text-white/70 text-base font-medium max-w-lg">
                                    Celebrate your colleagues! Give a shoutout to someone who made a difference today.
                                </p>
                            </div>
                        </div>
                    </div>
                </Card>

                {/* ==================== GIVE KUDOS FORM ==================== */}
                <div ref={formRef} id="give-kudos-form">
                    <Card className="rounded-2xl border-border/60 shadow-sm overflow-hidden">
                        <CardHeader className="bg-gradient-to-r from-amber-500/10 to-rose-500/10 border-b border-border/40 pb-4">
                            <CardTitle className="flex items-center gap-2 text-lg font-bold">
                                <PartyPopper className="w-5 h-5 text-amber-500" />
                                Give Kudos
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="pt-6">
                            <form onSubmit={handleSubmit} className="space-y-5">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <label className="text-sm font-semibold text-foreground flex items-center gap-1.5">
                                            <User className="w-3.5 h-3.5 text-muted-foreground" />
                                            Your Name
                                        </label>
                                        <Input
                                            value={currentUser}
                                            disabled
                                            className="bg-muted/50 text-muted-foreground cursor-not-allowed"
                                        />
                                        <p className="text-[11px] text-muted-foreground">Auto-filled from your account</p>
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-sm font-semibold text-foreground flex items-center gap-1.5">
                                            <Building2 className="w-3.5 h-3.5 text-muted-foreground" />
                                            Your Department
                                        </label>
                                        <Input
                                            value={currentDepartment || 'Not set'}
                                            disabled
                                            className="bg-muted/50 text-muted-foreground cursor-not-allowed"
                                        />
                                        <p className="text-[11px] text-muted-foreground">Auto-filled from your account</p>
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-sm font-semibold text-foreground flex items-center gap-1.5">
                                            <Award className="w-3.5 h-3.5 text-amber-500" />
                                            Recipient Name <span className="text-destructive">*</span>
                                        </label>
                                        <Input
                                            placeholder="e.g., Juan Dela Cruz"
                                            value={data.recipient_name}
                                            onChange={(e) => setData('recipient_name', e.target.value)}
                                            className="h-10"
                                            required
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-sm font-semibold text-foreground flex items-center gap-1.5">
                                            <Building2 className="w-3.5 h-3.5 text-amber-500" />
                                            Recipient Department
                                        </label>
                                        <Select
                                            value={data.recipient_department}
                                            onValueChange={(val) => setData('recipient_department', val)}
                                        >
                                            <SelectTrigger className="h-10">
                                                <SelectValue placeholder="Select department (optional)" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {DEPARTMENTS.map((dept) => (
                                                    <SelectItem key={dept} value={dept}>
                                                        {dept}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <label className="text-sm font-semibold text-foreground flex items-center gap-1.5">
                                        <Heart className="w-3.5 h-3.5 text-rose-500" />
                                        Recognition Message <span className="text-destructive">*</span>
                                    </label>
                                    <Textarea
                                        placeholder="Write something meaningful... e.g., 'Thank you for going above and beyond today!'"
                                        value={data.message}
                                        onChange={(e) => setData('message', e.target.value)}
                                        className="min-h-[100px] resize-y"
                                        required
                                    />
                                    <p className="text-[11px] text-muted-foreground text-right">
                                        {data.message.length} / 500 characters
                                    </p>
                                </div>

                                <Button
                                    type="submit"
                                    disabled={processing}
                                    className="w-full md:w-auto h-11 px-8 rounded-xl font-bold bg-gradient-to-r from-amber-500 to-rose-500 hover:from-amber-600 hover:to-rose-600 text-white shadow-md transition-all duration-200"
                                >
                                    {processing ? (
                                        <>
                                            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                            Posting...
                                        </>
                                    ) : (
                                        <>
                                            <Send className="w-4 h-4 mr-2" />
                                            Post Recognition
                                        </>
                                    )}
                                </Button>
                            </form>
                        </CardContent>
                    </Card>
                </div>

                {/* ==================== SORT / FILTER BAR ==================== */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                        <h2 className="text-xl font-bold text-foreground flex items-center gap-2">
                            <HeartHandshake className="w-5 h-5 text-amber-500" />
                            Recognitions
                        </h2>
                        <Badge variant="secondary" className="rounded-full font-semibold text-xs">
                            {recognitions.length} {recognitions.length === 1 ? 'post' : 'posts'}
                        </Badge>
                    </div>
                    <div className="flex items-center gap-2">
                        <Button
                            variant={sortMode === 'recent' ? 'default' : 'outline'}
                            size="sm"
                            onClick={() => setSortMode('recent')}
                            className={`rounded-full text-xs font-semibold h-8 px-4 ${sortMode === 'recent'
                                ? 'bg-foreground text-background hover:bg-foreground/90'
                                : ''
                                }`}
                        >
                            <Clock className="w-3.5 h-3.5 mr-1.5" />
                            Most Recent
                        </Button>
                        <Button
                            variant={sortMode === 'most-liked' ? 'default' : 'outline'}
                            size="sm"
                            onClick={() => setSortMode('most-liked')}
                            className={`rounded-full text-xs font-semibold h-8 px-4 ${sortMode === 'most-liked'
                                ? 'bg-foreground text-background hover:bg-foreground/90'
                                : ''
                                }`}
                        >
                            <TrendingUp className="w-3.5 h-3.5 mr-1.5" />
                            Most Liked
                        </Button>
                    </div>
                </div>

                {/* ==================== RECOGNITIONS FEED ==================== */}
                {sortedRecognitions.length === 0 ? (
                    <Card className="rounded-2xl border-dashed border-2 border-border/40 bg-muted/20 py-16">
                        <CardContent className="flex flex-col items-center justify-center text-center">
                            <div className="h-20 w-20 rounded-full bg-gradient-to-br from-amber-400/20 to-rose-500/20 flex items-center justify-center mb-5">
                                <HeartHandshake className="w-10 h-10 text-amber-500/60" />
                            </div>
                            <h3 className="text-xl font-bold text-foreground mb-2">No recognitions yet</h3>
                            <p className="text-muted-foreground max-w-md text-sm">
                                Be the first to recognize a colleague! Use the form above to give a shoutout.
                            </p>
                        </CardContent>
                    </Card>
                ) : (
                    <div className="space-y-4">
                        {sortedRecognitions.map((recognition) => {
                            const isOwn = recognition.sender_name === currentUser;
                            const senderInitials = getInitials(recognition.sender_name);
                            const recipientInitials = getInitials(recognition.recipient_name);
                            const senderColor = getRandomColor(recognition.sender_name);
                            const recipientColor = getRandomColor(recognition.recipient_name);
                            const isLiking = likingIds.has(recognition.id);
                            const isDeleting = deletingIds.has(recognition.id);

                            return (
                                <Card
                                    key={recognition.id}
                                    className={`rounded-2xl border-border/50 shadow-sm transition-all duration-200 hover:shadow-md ${recognition.is_pinned ? 'ring-2 ring-amber-400/30 ring-offset-2 ring-offset-background' : ''
                                        }`}
                                >
                                    <CardContent className="p-5 md:p-6">
                                        {/* Top row: Pinned badge */}
                                        {recognition.is_pinned && (
                                            <div className="mb-3">
                                                <Badge className="bg-amber-500/15 text-amber-600 dark:text-amber-400 border-0 text-[10px] font-bold px-2.5 py-0.5 rounded-full">
                                                    <Trophy className="w-3 h-3 mr-1" /> Pinned
                                                </Badge>
                                            </div>
                                        )}

                                        {/* Sender → Recipient */}
                                        <div className="flex flex-wrap items-center gap-3 mb-4">
                                            <div className="flex items-center gap-2.5">
                                                <Avatar className={`h-8 w-8 ${senderColor} ring-2 ring-background shadow-sm`}>
                                                    <AvatarFallback className="text-white text-xs font-bold">
                                                        {senderInitials}
                                                    </AvatarFallback>
                                                </Avatar>
                                                <div>
                                                    <p className="text-sm font-bold text-foreground leading-tight">
                                                        {recognition.sender_name}
                                                    </p>
                                                    {recognition.sender_department && (
                                                        <p className="text-[11px] text-muted-foreground leading-tight">
                                                            {recognition.sender_department}
                                                        </p>
                                                    )}
                                                </div>
                                            </div>

                                            <ArrowRight className="w-4 h-4 text-muted-foreground/40 shrink-0 mx-1" />

                                            <div className="flex items-center gap-2.5">
                                                <div className={`h-8 w-8 rounded-full ${recipientColor} ring-2 ring-background shadow-sm flex items-center justify-center text-white text-xs font-bold`}>
                                                    {recipientInitials}
                                                </div>
                                                <div>
                                                    <p className="text-sm font-bold text-foreground leading-tight">
                                                        {recognition.recipient_name}
                                                    </p>
                                                    {recognition.recipient_department && (
                                                        <p className="text-[11px] text-muted-foreground leading-tight">
                                                            {recognition.recipient_department}
                                                        </p>
                                                    )}
                                                </div>
                                            </div>
                                        </div>

                                        {/* Message */}
                                        <div className="pl-0.5 mb-4">
                                            <p className="text-sm md:text-base text-foreground leading-relaxed italic border-l-3 border-amber-400/40 pl-4">
                                                &ldquo;{recognition.message}&rdquo;
                                            </p>
                                        </div>

                                        {/* Bottom bar */}
                                        <div className="flex items-center justify-between gap-4 pt-2 border-t border-border/30">
                                            <div className="flex items-center gap-4">
                                                {/* Like button */}
                                                <button
                                                    onClick={() => handleLike(recognition)}
                                                    disabled={isLiking}
                                                    className="flex items-center gap-1.5 group"
                                                    aria-label={recognition.liked_by_current_user ? 'Unlike' : 'Like'}
                                                >
                                                    {isLiking ? (
                                                        <Loader2 className="w-4 h-4 text-rose-500 animate-spin" />
                                                    ) : (
                                                        <Heart
                                                            className={`w-4 h-4 transition-all duration-200 ${recognition.liked_by_current_user
                                                                ? 'fill-rose-500 text-rose-500 scale-110'
                                                                : 'text-muted-foreground group-hover:text-rose-400 group-hover:scale-110'
                                                                }`}
                                                        />
                                                    )}
                                                    <span className={`text-xs font-semibold tabular-nums ${recognition.liked_by_current_user ? 'text-rose-500' : 'text-muted-foreground'
                                                        }`}>
                                                        {recognition.likes_count}
                                                    </span>
                                                </button>

                                                {/* Time ago */}
                                                <span className="text-xs text-muted-foreground flex items-center gap-1">
                                                    <Clock className="w-3 h-3" />
                                                    {timeAgo(recognition.created_at)}
                                                </span>
                                            </div>

                                            {/* Delete (own posts only) */}
                                            {isOwn && (
                                                <button
                                                    onClick={() => handleDelete(recognition)}
                                                    disabled={isDeleting}
                                                    className="flex items-center gap-1 text-xs text-muted-foreground hover:text-destructive transition-colors group"
                                                    aria-label="Delete recognition"
                                                >
                                                    {isDeleting ? (
                                                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                                                    ) : (
                                                        <Trash2 className="w-3.5 h-3.5 group-hover:scale-110 transition-transform" />
                                                    )}
                                                    <span className="hidden sm:inline">Delete</span>
                                                </button>
                                            )}
                                        </div>
                                    </CardContent>
                                </Card>
                            );
                        })}
                    </div>
                )}

                {/* ==================== FOOTER ==================== */}
                <Separator className="my-4" />
                <p className="text-center text-xs text-muted-foreground font-medium pb-6">
                    Spread positivity at BataanGHMC &mdash; every recognition makes a difference. 💙
                </p>
            </div>
        </>
    );
}