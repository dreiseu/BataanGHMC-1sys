import LineWaves from '@/components/ui/linewaves';
import { Head, router } from '@inertiajs/react';
import { PlayCircle, Link as LinkIcon, FileVideo, GripVertical, FileText, UploadCloud, Search } from 'lucide-react';
import { useMemo, useState, useEffect } from 'react';
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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';


type HrDocumentEntry = {
    id: number;
    title: string;
    description: string | null;
    type: string;
    category: string | null;
    file_path: string | null;
    file_type: string | null;
    is_active: boolean;
    sort_order: number;
};

type Props = {
    entries: HrDocumentEntry[];
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
            <td className="px-5 py-4 text-muted-foreground/50 w-12 text-center">
                {!search && (
                    <div {...attributes} {...listeners} className="cursor-grab active:cursor-grabbing w-fit mx-auto p-1 hover:bg-muted rounded">
                        <GripVertical className="w-5 h-5 text-muted-foreground" />
                    </div>
                )}
            </td>
            <td className="px-5 py-4">
                <div className="font-semibold text-foreground">{item.title}</div>
                <div className="text-xs text-muted-foreground mt-1 max-w-md truncate">{item.description}</div>
                <div className="text-xs text-[#00D4FF] font-medium mt-1">{item.category || 'Uncategorized'}</div>
            </td>
            <td className="px-5 py-4 text-center">
                <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-600 bg-slate-100 px-2 py-1 rounded-md capitalize">
                    {item.type.replace('_', ' ')}
                </span>
            </td>
            <td className="px-5 py-4 text-center">
                {item.file_type ? (
                    <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-indigo-600 bg-indigo-50 px-2 py-1 rounded-md">
                        <FileText className="w-3.5 h-3.5" /> {item.file_type}
                    </span>
                ) : (
                    <span className="text-xs text-muted-foreground">No File</span>
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

export default function HrDocuments({ entries }: Props) {
    const [showAddForm, setShowAddForm] = useState(false);
    const [form, setForm] = useState({
        title: '',
        description: '',
        type: 'form',
        category: '',
        is_active: true,
        sort_order: 0,
    });
    const [documentFile, setDocumentFile] = useState<File | null>(null);
    const [uploadProgress, setUploadProgress] = useState<number | null>(null);

    const [editingEntry, setEditingEntry] = useState<HrDocumentEntry | null>(null);

    function openEditDialog(entry: HrDocumentEntry) {
        setEditingEntry(entry);
        setForm({
            title: entry.title,
            description: entry.description || '',
            type: entry.type,
            category: entry.category || '',
            is_active: entry.is_active,
            sort_order: entry.sort_order,
        });
        setDocumentFile(null);
        setShowAddForm(true);
    }

    function resetDialog() {
        setEditingEntry(null);
        setErrors({});
        setForm({
            title: '',
            description: '',
            type: 'form',
            category: '',
            is_active: true,
            sort_order: 0,
        });
        setDocumentFile(null);
    }

    const [entryToDelete, setEntryToDelete] = useState<HrDocumentEntry | null>(null);
    const [search, setSearch] = useState('');
    const [typeFilter, setTypeFilter] = useState('all');
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

                router.post('/utilities/hr-documents/reorder', {
                    ordered_ids: newEntries.map(e => e.id)
                }, { preserveScroll: true });

                return newEntries;
            });
        }
    };

    const filteredDocuments = useMemo(() => {
        const keyword = search.toLowerCase().trim();
        return localEntries.filter((item) => {
            const matchesSearch = item.title.toLowerCase().includes(keyword) ||
                (item.description && item.description.toLowerCase().includes(keyword));
            const matchesType = typeFilter === 'all' || item.type === typeFilter;
            return matchesSearch && matchesType;
        });
    }, [search, typeFilter, localEntries]);

    const totalPages = Math.ceil(filteredDocuments.length / itemsPerPage);
    const paginatedDocuments = useMemo(() => {
        const start = (currentPage - 1) * itemsPerPage;
        return filteredDocuments.slice(start, start + itemsPerPage);
    }, [filteredDocuments, currentPage]);

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

    const saveDocument = () => {
        setIsSaving(true);
        const formData = new FormData();
        formData.append('title', form.title);
        formData.append('description', form.description);
        formData.append('type', form.type);
        formData.append('category', form.category);
        formData.append('is_active', form.is_active ? '1' : '0');
        formData.append('sort_order', form.sort_order.toString());

        if (documentFile) {
            formData.append('file_file', documentFile);
        }

        if (editingEntry) {
            formData.append('_method', 'PUT'); // required for Laravel to handle file uploads via PUT
            router.post(`/utilities/hr-documents/${editingEntry.id}`, formData, {
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
            router.post('/utilities/hr-documents', formData, {
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
            <Head title="HR Documents" />

            <div className="p-6 mt-6 mx-auto w-full max-w-7xl space-y-8">
                {/* Hero Banner */}
                <section className="relative overflow-hidden rounded-3xl border border-[#00D4FF]/20 bg-gradient-to-br from-[#0F172A] via-[#1E293B] to-[#0F172A] p-8 sm:p-10 shadow-lg min-h-[180px] flex flex-col justify-center group">
                    <div className="absolute inset-0 z-0 opacity-40 mix-blend-screen">
                        <LineWaves color1="#0F172A" color2="#00D4FF" color3="#0F172A" brightness={0.6} />
                    </div>

                    <div className="absolute top-0 right-0 -mt-20 -mr-20 h-72 w-72 rounded-full bg-[#00D4FF] opacity-10 blur-[80px] group-hover:opacity-20 transition-opacity duration-700 pointer-events-none"></div>

                    <div className="relative z-10 w-full max-w-3xl">
                        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#00D4FF]/10 border border-[#00D4FF]/20 text-[#00D4FF] text-xs font-bold tracking-widest uppercase mb-4 shadow-[0_0_15px_rgba(0,212,255,0.15)]">
                            <FileText className="w-4 h-4" /> Utility Module
                        </div>
                        <h1 className="text-3xl font-black tracking-tight text-white sm:text-4xl drop-shadow-md">
                            HR Documents
                        </h1>
                        <p className="mt-3 text-base sm:text-lg text-slate-300 leading-relaxed font-medium max-w-2xl">
                            Manage downloadable forms, policies, memoranda, and leave benefits for the HR Portal.
                        </p>
                    </div>
                </section>

                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
                        <div className="flex items-center gap-3 rounded-2xl border bg-card px-4 py-3 shadow-sm transition-colors focus-within:border-[#00D4FF]/50 focus-within:ring-2 focus-within:ring-[#00D4FF]/10 w-full sm:w-auto flex-grow">
                            <Search className="h-5 w-5 text-muted-foreground" />
                            <input
                                value={search}
                                onChange={(e) => { setSearch(e.target.value); setCurrentPage(1); }}
                                placeholder="Search documents..."
                                className="w-full bg-transparent text-sm outline-none placeholder:text-muted-foreground"
                            />
                        </div>

                        <Select value={typeFilter} onValueChange={(val) => { setTypeFilter(val); setCurrentPage(1); }}>
                            <SelectTrigger className="w-full sm:w-[200px] h-12 rounded-2xl border-muted-foreground/20">
                                <SelectValue placeholder="Filter by type" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">All Types</SelectItem>
                                <SelectItem value="form">Downloadable Forms</SelectItem>
                                <SelectItem value="policy">Policies</SelectItem>
                                <SelectItem value="memorandum">Memoranda</SelectItem>
                                <SelectItem value="leave_benefit">Leave Benefits</SelectItem>
                                <SelectItem value="faq">FAQs</SelectItem>
                            </SelectContent>
                        </Select>

                        <Button
                            onClick={() => setShowAddForm(true)}
                            className="cursor-pointer h-12 bg-[#1E293B] hover:bg-[#00D4FF] hover:shadow-[0_0_20px_rgba(0,212,255,0.4)] text-white font-semibold rounded-2xl shadow-md transition-all px-6 w-full sm:w-auto"
                        >
                            Add Document
                        </Button>
                    </div>

                    <div className="overflow-hidden rounded-2xl border border-muted-foreground/10 bg-card shadow-sm">
                        <DndContext id="hr-documents-dnd" sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
                            <SortableContext items={paginatedDocuments.map(v => v.id)} strategy={verticalListSortingStrategy}>
                                <table className="w-full text-sm">
                                    <thead className="bg-[#1E293B]/5 text-left text-muted-foreground uppercase tracking-wider text-[11px] font-bold border-b border-muted-foreground/10">
                                        <tr>
                                            <th className="px-5 py-4 w-12 text-center"></th>
                                            <th className="px-5 py-4">Title & Details</th>
                                            <th className="px-5 py-4 text-center">Type</th>
                                            <th className="px-5 py-4 text-center">File Format</th>
                                            <th className="px-5 py-4 text-center">Status</th>
                                            <th className="px-5 py-4 text-center">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {paginatedDocuments.map((item) => (
                                            <SortableRow
                                                key={item.id}
                                                item={item}
                                                search={search}
                                                openEditDialog={openEditDialog}
                                                setEntryToDelete={setEntryToDelete}
                                            />
                                        ))}
                                        {filteredDocuments.length === 0 && (
                                            <tr>
                                                <td colSpan={6} className="px-4 py-12 text-center text-muted-foreground">
                                                    No documents found.
                                                </td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>
                            </SortableContext>
                        </DndContext>
                        
                        <div className="flex items-center justify-between p-4 border-t border-muted/20 bg-muted/5">
                            <div className="text-xs text-muted-foreground font-medium">
                                Showing <span className="text-foreground">{paginatedDocuments.length}</span> of <span className="text-foreground">{filteredDocuments.length}</span> records
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
                    <DialogDescription className="hidden">Add or edit HR document.</DialogDescription>

                    <div className="relative flex items-center justify-center p-5 border-b border-muted/50">
                        <DialogTitle className="text-lg font-bold tracking-tight text-foreground">{editingEntry ? 'Edit Document' : 'Upload Document'}</DialogTitle>
                    </div>

                    <div className="p-6 md:p-8">
                        <div className="grid md:grid-cols-2 gap-8 lg:gap-12">

                            {/* Left Column: Media Section */}
                            <div className="flex flex-col gap-6">
                                <div>
                                    <h3 className="text-base font-semibold text-foreground">File Upload</h3>
                                    <p className="text-xs text-muted-foreground mt-1">Upload a PDF or Word document.</p>
                                </div>

                                <div className="flex flex-col gap-4">
                                    {form.type !== 'faq' ? (
                                        <div className="relative group flex flex-col items-center justify-center p-6 border-2 border-dashed border-muted-foreground/20 rounded-2xl bg-muted/10 hover:bg-muted/30 transition-colors text-center h-[192px]">
                                            <div className="w-10 h-10 rounded-full bg-slate-200 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                                                <UploadCloud className="w-5 h-5 text-slate-600" />
                                            </div>
                                            <span className="text-sm font-semibold text-foreground mb-1">Select document file</span>
                                            <span className="text-xs text-muted-foreground mb-3">PDF, DOC, DOCX up to 50MB</span>

                                            <Input
                                                type="file"
                                                accept=".pdf,.doc,.docx"
                                                onChange={(e) => setDocumentFile(e.target.files?.[0] || null)}
                                                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                                            />

                                            <div className="px-4 py-2 rounded-full bg-primary text-primary-foreground text-xs font-bold pointer-events-none truncate max-w-[80%]">
                                                {documentFile ? documentFile.name : 'Select file'}
                                            </div>
                                            {errors.file_file && <p className="text-xs text-destructive absolute bottom-2">{errors.file_file}</p>}
                                        </div>
                                    ) : (
                                        <div className="flex flex-col items-center justify-center p-6 border-2 border-dashed border-muted-foreground/20 rounded-2xl bg-[#00D4FF]/5 text-center h-[192px]">
                                            <div className="w-10 h-10 rounded-full bg-[#00D4FF]/10 flex items-center justify-center mb-3">
                                                <FileText className="w-5 h-5 text-[#00D4FF]" />
                                            </div>
                                            <span className="text-sm font-semibold text-foreground mb-1">FAQ Mode</span>
                                            <span className="text-xs text-muted-foreground max-w-[200px]">No file upload required. Use the details section to write the Q&A.</span>
                                        </div>
                                    )}
                                    
                                    <div className="flex flex-col gap-2">
                                        <label className="text-xs font-medium text-muted-foreground">Document Type</label>
                                        <Select value={form.type} onValueChange={(v) => setForm({ ...form, type: v })}>
                                            <SelectTrigger className="w-full rounded-xl border-muted-foreground/20 bg-card h-11">
                                                <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="form">Downloadable Form</SelectItem>
                                                <SelectItem value="policy">Policy</SelectItem>
                                                <SelectItem value="memorandum">Announcement (Memorandum)</SelectItem>
                                                <SelectItem value="leave_benefit">Leave Benefit</SelectItem>
                                                <SelectItem value="faq">FAQ</SelectItem>
                                            </SelectContent>
                                        </Select>
                                        {errors.type && <p className="text-xs text-destructive mt-1">{errors.type}</p>}
                                    </div>
                                </div>
                            </div>

                            {/* Right Column: Details Section */}
                            <div className="flex flex-col gap-6">
                                <div>
                                    <h3 className="text-base font-semibold text-foreground">Details</h3>
                                    <p className="text-xs text-muted-foreground mt-1">Provide information about this document.</p>
                                </div>

                                <div className="flex flex-col gap-5">
                                    <div className="relative rounded-xl border border-muted-foreground/20 focus-within:border-primary focus-within:ring-1 focus-within:ring-primary transition-all p-3 bg-card">
                                        <label className="text-xs font-medium text-muted-foreground mb-1 block">
                                            {form.type === 'faq' ? 'Question (required)' : 'Title (required)'}
                                        </label>
                                        <Input
                                            className="border-0 p-0 h-auto focus-visible:ring-0 text-foreground font-medium rounded-none bg-transparent"
                                            placeholder={form.type === 'faq' ? 'e.g. How do I file for leave?' : 'e.g. Leave Application Form'}
                                            value={form.title}
                                            onChange={(e) => setForm({ ...form, title: e.target.value })}
                                        />
                                        {errors.title && <p className="text-xs text-destructive mt-1">{errors.title}</p>}
                                    </div>
                                    
                                    <div className="relative rounded-xl border border-muted-foreground/20 focus-within:border-primary focus-within:ring-1 focus-within:ring-primary transition-all p-3 bg-card">
                                        <label className="text-xs font-medium text-muted-foreground mb-1 block">Category</label>
                                        <Input
                                            className="border-0 p-0 h-auto focus-visible:ring-0 text-foreground font-medium rounded-none bg-transparent"
                                            placeholder="e.g. Employment, Training, General"
                                            value={form.category}
                                            onChange={(e) => setForm({ ...form, category: e.target.value })}
                                        />
                                        {errors.category && <p className="text-xs text-destructive mt-1">{errors.category}</p>}
                                    </div>

                                    <div className="relative rounded-xl border border-muted-foreground/20 focus-within:border-primary focus-within:ring-1 focus-within:ring-primary transition-all p-3 bg-card flex-grow flex flex-col min-h-[100px]">
                                        <label className="text-xs font-medium text-muted-foreground mb-1 block">
                                            {form.type === 'faq' ? 'Answer (required)' : 'Description'}
                                        </label>
                                        <Textarea
                                            className="border-0 p-0 focus-visible:ring-0 text-foreground resize-none rounded-none bg-transparent flex-grow"
                                            placeholder={form.type === 'faq' ? 'Provide the detailed answer here...' : 'Optional brief description'}
                                            value={form.description}
                                            onChange={(e) => setForm({ ...form, description: e.target.value })}
                                        />
                                        {errors.description && <p className="text-xs text-destructive mt-1">{errors.description}</p>}
                                    </div>

                                    {/* Visibility Section */}
                                    <div className="flex items-center justify-between p-4 rounded-xl border border-muted-foreground/10 bg-card mt-auto">
                                        <div className="flex flex-col">
                                            <label className="text-sm font-semibold text-foreground">Visibility</label>
                                            <span className="text-xs text-muted-foreground mt-0.5">Make available to employees</span>
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
                                onClick={saveDocument}
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
                        <AlertDialogTitle>Delete Document?</AlertDialogTitle>
                        <AlertDialogDescription>
                            Are you sure you want to delete <strong>{entryToDelete?.title}</strong>? The uploaded file will be permanently deleted.
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
                                router.delete(`/utilities/hr-documents/${entryToDelete.id}`, {
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
