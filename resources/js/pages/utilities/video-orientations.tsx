import LineWaves from '@/components/ui/linewaves';
import { Head, router, usePage } from '@inertiajs/react';
import { Search, PlayCircle, Link as LinkIcon, FileVideo, GripVertical } from 'lucide-react';
import { useMemo, useState, useRef, useEffect } from 'react';
import { DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors, DragEndEvent } from '@dnd-kit/core';
import { arrayMove, SortableContext, sortableKeyboardCoordinates, verticalListSortingStrategy, useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Button } from '@/components/ui/button';
import {
    Pagination,
    PaginationContent,
    PaginationEllipsis,
    PaginationItem,
    PaginationLink,
    PaginationNext,
    PaginationPrevious,
} from '@/components/ui/pagination';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { toast } from 'sonner';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';


type VideoEntry = {
    id: number;
    title: string;
    description: string | null;
    embed_url: string | null;
    video_path: string | null;
    is_active: boolean;
    sort_order: number;
};

type Props = {
    entries: VideoEntry[];
};

function SortableRow({ item, search, openEditDialog, setEntryToDelete }: any) {
    const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
        id: item.id,
        disabled: search !== ''
    });

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
        zIndex: isDragging ? 10 : 1,
        position: 'relative' as const,
    };

    return (
        <tr
            ref={setNodeRef}
            style={style}
            className={`border-t border-muted-foreground/5 transition-colors ${isDragging ? 'bg-muted shadow-lg opacity-90' : 'hover:bg-muted/30'} bg-card`}
        >
            <td className="px-5 py-4 text-muted-foreground/50">
                {!search && (
                    <div {...attributes} {...listeners} className="cursor-grab active:cursor-grabbing w-fit mx-auto p-1 hover:bg-muted rounded">
                        <GripVertical className="w-5 h-5 text-muted-foreground" />
                    </div>
                )}
            </td>
            <td className="px-5 py-4">
                <div className="font-semibold text-foreground">{item.title}</div>
                <div className="text-xs text-muted-foreground mt-1 max-w-md truncate">{item.description}</div>
            </td>
            <td className="px-5 py-4 text-center">
                {item.video_path ? (
                    <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-indigo-600 bg-indigo-50 px-2 py-1 rounded-md">
                        <FileVideo className="w-3.5 h-3.5" /> Direct Upload
                    </span>
                ) : item.embed_url ? (
                    <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-rose-600 bg-rose-50 px-2 py-1 rounded-md">
                        <LinkIcon className="w-3.5 h-3.5" /> Embedded Link
                    </span>
                ) : (
                    <span className="text-xs text-muted-foreground">No Video</span>
                )}
            </td>
            <td className="px-5 py-4 text-center">
                {item.is_active ? (
                    <span className="inline-flex items-center rounded-full bg-emerald-500/10 px-2.5 py-0.5 text-xs font-semibold text-emerald-600">Active</span>
                ) : (
                    <span className="inline-flex items-center rounded-full bg-slate-500/10 px-2.5 py-0.5 text-xs font-semibold text-slate-600">Inactive</span>
                )}
            </td>
            <td className="px-5 py-4 text-center">
                <div className="flex justify-center gap-2">
                    <button onClick={() => openEditDialog(item)} className="rounded-lg border border-muted-foreground/20 px-3 py-1.5 text-xs font-semibold hover:bg-muted transition-colors">Edit</button>
                    <button onClick={() => setEntryToDelete(item)} className="rounded-lg border border-destructive/30 px-3 py-1.5 text-xs font-semibold text-destructive hover:bg-destructive hover:text-destructive-foreground transition-colors">Delete</button>
                </div>
            </td>
        </tr>
    );
}

export default function VideoOrientations({ entries }: Props) {
    const [showAddForm, setShowAddForm] = useState(false);
    const [form, setForm] = useState({
        title: '',
        description: '',
        embed_url: '',
        is_active: true,
        sort_order: 0,
    });
    const [videoFile, setVideoFile] = useState<File | null>(null);
    const [uploadProgress, setUploadProgress] = useState<number | null>(null);

    const [editingEntry, setEditingEntry] = useState<VideoEntry | null>(null);

    function openEditDialog(entry: VideoEntry) {
        setEditingEntry(entry);
        setForm({
            title: entry.title,
            description: entry.description || '',
            embed_url: entry.embed_url || '',
            is_active: entry.is_active,
            sort_order: entry.sort_order,
        });
        setVideoFile(null);
        setShowAddForm(true);
    }

    function resetDialog() {
        setEditingEntry(null);
        setErrors({});
        setForm({
            title: '',
            description: '',
            embed_url: '',
            is_active: true,
            sort_order: 0,
        });
        setVideoFile(null);
    }

    const [entryToDelete, setEntryToDelete] = useState<VideoEntry | null>(null);
    const [search, setSearch] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 10;

    const [localEntries, setLocalEntries] = useState(entries);
    useEffect(() => { setLocalEntries(entries); }, [entries]);

    const sensors = useSensors(
        useSensor(PointerSensor),
        useSensor(KeyboardSensor, {
            coordinateGetter: sortableKeyboardCoordinates,
        })
    );

    const handleDragEnd = (event: DragEndEvent) => {
        const { active, over } = event;

        if (over && active.id !== over.id) {
            setLocalEntries((items) => {
                const oldIndex = items.findIndex((i) => i.id === active.id);
                const newIndex = items.findIndex((i) => i.id === over.id);

                const newEntries = arrayMove(items, oldIndex, newIndex);

                router.post('/utilities/video-orientations/reorder', {
                    ordered_ids: newEntries.map(e => e.id)
                }, { preserveScroll: true });

                return newEntries;
            });
        }
    };

    const filteredVideos = useMemo(() => {
        const keyword = search.toLowerCase().trim();
        if (!keyword) return localEntries;
        return localEntries.filter((item) => {
            return item.title.toLowerCase().includes(keyword) ||
                (item.description && item.description.toLowerCase().includes(keyword));
        });
    }, [search, localEntries]);

    const totalPages = Math.ceil(filteredVideos.length / itemsPerPage);
    const paginatedVideos = useMemo(() => {
        const start = (currentPage - 1) * itemsPerPage;
        return filteredVideos.slice(start, start + itemsPerPage);
    }, [filteredVideos, currentPage]);

    const paginationRange = useMemo(() => {
        const maxVisible = 5;
        let start = Math.max(1, currentPage - Math.floor(maxVisible / 2));
        let end = Math.min(totalPages, start + maxVisible - 1);
        if (end - start + 1 < maxVisible) {
            start = Math.max(1, end - maxVisible + 1);
        }
        const range = [];
        for (let i = start; i <= end; i++) range.push(i);
        if (start > 1) range.unshift('...');
        if (end < totalPages) range.push('...');
        return range;
    }, [currentPage, totalPages]);

    const [errors, setErrors] = useState<Record<string, string>>({});
    const [isSaving, setIsSaving] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);

    const saveVideo = () => {
        setIsSaving(true);
        const formData = new FormData();
        formData.append('title', form.title);
        formData.append('description', form.description);
        formData.append('embed_url', form.embed_url);
        formData.append('is_active', form.is_active ? '1' : '0');
        formData.append('sort_order', form.sort_order.toString());

        if (videoFile) {
            formData.append('video_file', videoFile);
        }

        if (editingEntry) {
            formData.append('_method', 'PUT'); // required for Laravel to handle file uploads via PUT
            router.post(`/utilities/video-orientations/${editingEntry.id}`, formData, {
                onProgress: (progress) => {
                    if (progress?.percentage) setUploadProgress(progress.percentage);
                },
                onSuccess: () => { 
                    toast.success('Updated successfully.'); 
                    resetDialog(); 
                    setShowAddForm(false); 
                    router.reload({ only: ['entries'] });
                },
                onError: (err) => { setErrors(err); toast.error('Failed to update.'); },
                onFinish: () => { setIsSaving(false); setUploadProgress(null); },
            });
        } else {
            router.post('/utilities/video-orientations', formData, {
                onProgress: (progress) => {
                    if (progress?.percentage) setUploadProgress(progress.percentage);
                },
                onSuccess: () => { 
                    toast.success('Added successfully.'); 
                    resetDialog(); 
                    setShowAddForm(false);
                    router.reload({ only: ['entries'] });
                },
                onError: (err) => { setErrors(err); toast.error('Failed to add.'); },
                onFinish: () => { setIsSaving(false); setUploadProgress(null); },
            });
        }
    };

    return (
        <>
            <Head title="Manage Video Orientations" />

            <div className="p-6 mt-6 mx-auto w-full max-w-7xl space-y-8">
                {/* Hero Banner */}
                <section className="relative overflow-hidden rounded-3xl border border-[#00D4FF]/20 bg-gradient-to-br from-[#0F172A] via-[#1E293B] to-[#0F172A] p-8 sm:p-10 shadow-lg min-h-[180px] flex flex-col justify-center group">
                    <div className="absolute inset-0 z-0 opacity-30 mix-blend-screen">
                        <LineWaves />
                    </div>

                    <div className="absolute top-0 right-0 -mt-20 -mr-20 h-72 w-72 rounded-full bg-[#00D4FF] opacity-10 blur-[80px] group-hover:opacity-20 transition-opacity duration-700 pointer-events-none"></div>

                    <div className="relative z-10 w-full max-w-3xl">
                        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#00D4FF]/10 border border-[#00D4FF]/20 text-[#00D4FF] text-xs font-bold tracking-widest uppercase mb-4 shadow-[0_0_15px_rgba(0,212,255,0.15)]">
                            Utility Module
                        </div>
                        <h1 className="text-3xl font-black tracking-tight text-white sm:text-4xl drop-shadow-md">
                            HR Video Orientations
                        </h1>
                        <p className="mt-3 text-base sm:text-lg text-slate-300 leading-relaxed font-medium max-w-2xl">
                            Manage the video library for employee onboarding. You can embed YouTube/Drive links or upload MP4 files directly.
                        </p>
                    </div>
                </section>

                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
                    <div className="flex items-center gap-3 flex-1">
                        <div className="relative flex-1 max-w-sm group">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground transition-colors group-focus-within:text-[#00D4FF]" />
                            <Input
                                value={search}
                                onChange={(e) => { setSearch(e.target.value); setCurrentPage(1); }}
                                placeholder="Search videos..."
                                className="pl-10 border-muted-foreground/20 focus-visible:ring-[#00D4FF]/30 transition-all shadow-sm rounded-xl"
                            />
                        </div>
                    </div>

                    <Button
                        onClick={() => setShowAddForm(true)}
                        className="cursor-pointer bg-[#1E293B] hover:bg-[#00D4FF] hover:shadow-[0_0_20px_rgba(0,212,255,0.4)] text-white font-semibold rounded-xl shadow-md transition-all"
                    >
                        Add Video
                    </Button>
                </div>

                <div className="overflow-hidden rounded-2xl border border-muted-foreground/10 bg-card shadow-sm">
                    <DndContext id="video-orientations-dnd" sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
                        <SortableContext items={paginatedVideos.map(v => v.id)} strategy={verticalListSortingStrategy}>
                            <table className="w-full text-sm">
                                <thead className="bg-[#1E293B]/5 text-left text-muted-foreground uppercase tracking-wider text-[11px] font-bold border-b border-muted-foreground/10">
                                    <tr>
                                        <th className="px-5 py-4 w-12 text-center"></th>
                                        <th className="px-5 py-4">Title & Details</th>
                                        <th className="px-5 py-4 text-center">Type</th>
                                        <th className="px-5 py-4 text-center">Status</th>
                                        <th className="px-5 py-4 text-center">Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {paginatedVideos.map((item) => (
                                        <SortableRow
                                            key={item.id}
                                            item={item}
                                            search={search}
                                            openEditDialog={openEditDialog}
                                            setEntryToDelete={setEntryToDelete}
                                        />
                                    ))}
                                    {filteredVideos.length === 0 && (
                                        <tr>
                                            <td colSpan={5} className="px-4 py-8 text-center text-muted-foreground">No videos found.</td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </SortableContext>
                    </DndContext>
                    
                    <div className="flex items-center justify-between p-4 border-t border-muted/20 bg-muted/5">
                        <div className="text-xs text-muted-foreground font-medium">
                            Showing <span className="text-foreground">{paginatedVideos.length}</span> of <span className="text-foreground">{filteredVideos.length}</span> records
                        </div>
                        {totalPages > 1 && (
                            <Pagination className="justify-end w-auto mx-0">
                                <PaginationContent>
                                    <PaginationItem>
                                        <PaginationPrevious
                                            onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                                            className={`cursor-pointer h-8 px-3 text-xs ${currentPage === 1 ? 'pointer-events-none opacity-50' : ''}`}
                                        />
                                    </PaginationItem>
                                    {paginationRange.map((item, index) => (
                                        <PaginationItem key={index}>
                                            {item === '...' ? (
                                                <PaginationEllipsis />
                                            ) : (
                                                <PaginationLink
                                                    onClick={() => setCurrentPage(item as number)}
                                                    isActive={currentPage === item}
                                                    className="cursor-pointer h-8 w-8 text-xs"
                                                >
                                                    {item}
                                                </PaginationLink>
                                            )}
                                        </PaginationItem>
                                    ))}
                                    <PaginationItem>
                                        <PaginationNext
                                            onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                                            className={`cursor-pointer h-8 px-3 text-xs ${currentPage === totalPages ? 'pointer-events-none opacity-50' : ''}`}
                                        />
                                    </PaginationItem>
                                </PaginationContent>
                            </Pagination>
                        )}
                    </div>
                </div>
            </div>

            <Dialog open={showAddForm} onOpenChange={(open) => { setShowAddForm(open); if (!open) resetDialog(); }}>
                <DialogContent className="w-[95vw] max-w-[1000px] sm:max-w-[1000px] p-0 overflow-hidden bg-background rounded-3xl border-0 shadow-[0_20px_60px_-15px_rgba(0,0,0,0.3)]">
                    <DialogDescription className="hidden">Add or edit video orientation.</DialogDescription>

                    {/* Centered Minimalist Header */}
                    <div className="relative flex items-center justify-center p-5 border-b border-muted/50">
                        <DialogTitle className="text-lg font-bold tracking-tight text-foreground">{editingEntry ? 'Edit video details' : 'Upload video'}</DialogTitle>
                    </div>

                    <div className="p-6 md:p-8">
                        <div className="grid md:grid-cols-2 gap-8 lg:gap-12">

                            {/* Left Column: Media Section */}
                            <div className="flex flex-col gap-6">
                                <div>
                                    <h3 className="text-base font-semibold text-foreground">Media</h3>
                                    <p className="text-xs text-muted-foreground mt-1">Upload an MP4 file or paste an embed link.</p>
                                </div>

                                <div className="flex flex-col gap-4">
                                    {/* Upload Zone */}
                                    <div className="relative group flex flex-col items-center justify-center p-6 border-2 border-dashed border-muted-foreground/20 rounded-2xl bg-muted/10 hover:bg-muted/30 transition-colors text-center h-[192px]">
                                        <div className="w-10 h-10 rounded-full bg-slate-200 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                                            <PlayCircle className="w-5 h-5 text-slate-600" />
                                        </div>
                                        <span className="text-sm font-semibold text-foreground mb-1">Select video file</span>
                                        <span className="text-xs text-muted-foreground mb-3">MP4 or M4V formats</span>

                                        <Input
                                            type="file"
                                            accept="video/mp4,video/x-m4v,video/*"
                                            onChange={(e) => setVideoFile(e.target.files?.[0] || null)}
                                            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                                        />

                                        <div className="px-4 py-2 rounded-full bg-primary text-primary-foreground text-xs font-bold pointer-events-none truncate max-w-[80%]">
                                            {videoFile ? videoFile.name : 'Select file'}
                                        </div>
                                        {errors.video_file && <p className="text-xs text-destructive absolute bottom-2">{errors.video_file}</p>}
                                    </div>

                                    {/* Embed Link Alternative */}
                                    <div className="flex flex-col justify-center p-5 border border-muted-foreground/10 rounded-2xl bg-card">
                                        <div className="mb-3">
                                            <span className="text-sm font-semibold text-foreground block">Or embed a link</span>
                                        </div>
                                        <div className="relative">
                                            <LinkIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                                            <Input
                                                className="pl-10 bg-muted/30 border-transparent focus-visible:bg-transparent focus-visible:border-primary transition-all rounded-xl h-11"
                                                placeholder="Paste YouTube/Drive link..."
                                                value={form.embed_url}
                                                onChange={(e) => setForm({ ...form, embed_url: e.target.value })}
                                            />
                                        </div>
                                        {errors.embed_url && <p className="text-xs text-destructive mt-2">{errors.embed_url}</p>}
                                    </div>
                                </div>
                            </div>

                            {/* Right Column: Details Section */}
                            <div className="flex flex-col gap-6">
                                <div>
                                    <h3 className="text-base font-semibold text-foreground">Details</h3>
                                    <p className="text-xs text-muted-foreground mt-1">Provide information about your video.</p>
                                </div>

                                <div className="flex flex-col gap-5">
                                    <div className="relative rounded-xl border border-muted-foreground/20 focus-within:border-primary focus-within:ring-1 focus-within:ring-primary transition-all p-3 bg-card">
                                        <label className="text-xs font-medium text-muted-foreground mb-1 block">Title (required)</label>
                                        <Input
                                            className="border-0 p-0 h-auto focus-visible:ring-0 text-foreground font-medium rounded-none bg-transparent"
                                            placeholder="Add a title that describes your video"
                                            value={form.title}
                                            onChange={(e) => setForm({ ...form, title: e.target.value })}
                                        />
                                        {errors.title && <p className="text-xs text-destructive mt-1">{errors.title}</p>}
                                    </div>

                                    <div className="relative rounded-xl border border-muted-foreground/20 focus-within:border-primary focus-within:ring-1 focus-within:ring-primary transition-all p-3 bg-card flex-grow flex flex-col min-h-[140px]">
                                        <label className="text-xs font-medium text-muted-foreground mb-1 block">Description</label>
                                        <Textarea
                                            className="border-0 p-0 focus-visible:ring-0 text-foreground resize-none rounded-none bg-transparent flex-grow"
                                            placeholder="Tell your viewers about your video"
                                            value={form.description}
                                            onChange={(e) => setForm({ ...form, description: e.target.value })}
                                        />
                                        {errors.description && <p className="text-xs text-destructive mt-1">{errors.description}</p>}
                                    </div>

                                    {/* Visibility Section */}
                                    <div className="flex items-center justify-between p-5 rounded-xl border border-muted-foreground/10 bg-card mt-auto">
                                        <div className="flex flex-col">
                                            <label className="text-sm font-semibold text-foreground">Visibility</label>
                                            <span className="text-xs text-muted-foreground mt-0.5">Make this video public to employees</span>
                                        </div>
                                        <Switch
                                            checked={form.is_active}
                                            onCheckedChange={(c: boolean) => setForm({ ...form, is_active: c })}
                                            className="data-[state=checked]:bg-blue-600"
                                        />
                                    </div>
                                </div>
                            </div>

                        </div>
                    </div>

                    {/* Footer */}
                    <DialogFooter className="px-6 py-5 border-t border-muted/50 bg-background flex flex-col sm:flex-row sm:items-center sm:justify-between relative">
                        {uploadProgress !== null && (
                            <div className="absolute top-0 left-0 h-[2px] bg-blue-600 transition-all duration-300" style={{ width: `${uploadProgress}%` }} />
                        )}
                        <div className="text-xs text-muted-foreground mb-4 sm:mb-0 font-medium">
                            {uploadProgress !== null ? `Uploading ${uploadProgress}%... Please wait.` : 'Changes will be saved immediately.'}
                        </div>
                        <div className="flex gap-3">
                            <Button variant="ghost" className="rounded-full font-semibold hover:bg-muted" onClick={() => setShowAddForm(false)}>Cancel</Button>
                            <Button
                                className="rounded-full font-bold px-6 bg-foreground text-background hover:bg-foreground/90 shadow-none min-w-[100px]"
                                onClick={saveVideo}
                                disabled={isSaving}
                            >
                                {isSaving ? 'Saving' : 'Save'}
                            </Button>
                        </div>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            <AlertDialog open={!!entryToDelete} onOpenChange={(open) => { if (!open) setEntryToDelete(null); }}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Delete Video?</AlertDialogTitle>
                        <AlertDialogDescription>
                            Are you sure you want to delete <strong>{entryToDelete?.title}</strong>? If an MP4 was uploaded, it will be permanently deleted.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                            disabled={isDeleting}
                            className="bg-destructive text-destructive-foreground"
                            onClick={() => {
                                if (!entryToDelete) return;
                                setIsDeleting(true);
                                router.delete(`/utilities/video-orientations/${entryToDelete.id}`, {
                                    onSuccess: () => { 
                                        toast.success('Deleted successfully.'); 
                                        setEntryToDelete(null); 
                                        router.reload({ only: ['entries'] });
                                    },
                                    onError: () => toast.error('Failed to delete.'),
                                    onFinish: () => setIsDeleting(false),
                                });
                            }}
                        >
                            {isDeleting ? 'Deleting...' : 'Delete'}
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </>
    );
}
