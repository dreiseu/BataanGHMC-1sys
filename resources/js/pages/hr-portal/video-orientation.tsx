import LineWaves from '@/components/ui/linewaves';
import ModulePageHeader from '@/components/module-page-header';
import { Head, usePage } from '@inertiajs/react';
import { PlayCircle, X, LayoutGrid, List, FileVideo, Youtube } from 'lucide-react';
import { useState, useRef, useEffect } from 'react';

function getYouTubeEmbedUrl(url: string) {
    if (!url) return '';
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
    const match = url.match(regExp);
    if (match && match[2].length === 11) {
        return `https://www.youtube.com/embed/${match[2]}?autoplay=1`;
    }
    return url;
}

function getYouTubeThumbnail(url: string) {
    if (!url) return null;
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
    const match = url.match(regExp);
    if (match && match[2].length === 11) {
        return `https://img.youtube.com/vi/${match[2]}/hqdefault.jpg`;
    }
    return null;
}

const VideoDuration = ({ src }: { src: string }) => {
    const [duration, setDuration] = useState<string | null>(null);

    useEffect(() => {
        const video = document.createElement('video');
        video.src = src;
        video.preload = 'metadata';
        
        video.onloadedmetadata = () => {
            if (video.duration && !isNaN(video.duration) && video.duration !== Infinity) {
                const minutes = Math.floor(video.duration / 60);
                const seconds = Math.floor(video.duration % 60);
                setDuration(`${minutes}:${seconds.toString().padStart(2, '0')}`);
            }
        };
    }, [src]);

    if (!duration) return null;

    return (
        <div className="absolute bottom-2 right-2 bg-black/70 backdrop-blur-md text-white text-[10px] font-bold px-1.5 py-0.5 rounded shadow-sm z-20">
            {duration}
        </div>
    );
};
import {
    Dialog,
    DialogContent,
    DialogTitle,
    DialogDescription,
} from '@/components/ui/dialog';

export default function VideoOrientation() {
    const { videos } = usePage<any>().props;
    const [selectedVideo, setSelectedVideo] = useState<any>(null);
    const [isPlayerActive, setIsPlayerActive] = useState(true);
    const [viewMode, setViewMode] = useState<'card' | 'list'>('card');
    const timeoutRef = useRef<NodeJS.Timeout | null>(null);

    const handleMouseMove = () => {
        setIsPlayerActive(true);
        if (timeoutRef.current) clearTimeout(timeoutRef.current);
        timeoutRef.current = setTimeout(() => {
            setIsPlayerActive(false);
        }, 2500);
    };

    useEffect(() => {
        return () => {
            if (timeoutRef.current) clearTimeout(timeoutRef.current);
        };
    }, []);

    return (
        <>
            <Head title="Video Orientation" />

            <div className="p-6">
                {/* Hero Banner */}
                <section className="relative overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-br from-[#1E293B] to-[#0F172A] p-8 shadow-lg min-h-[180px] flex flex-col justify-center mb-8">
                    <div className="absolute inset-0 z-0">
                        <LineWaves />
                    </div>
                    <div className="absolute top-0 right-0 -mt-16 -mr-16 h-64 w-64 rounded-full bg-[#00D4FF] opacity-10 blur-3xl mix-blend-screen pointer-events-none group-hover:opacity-20 transition-opacity duration-700"></div>

                    <div className="relative z-10 w-full max-w-3xl">
                        <p className="text-xs font-bold tracking-widest text-[#00D4FF] uppercase mb-2">
                            HR PORTAL RESOURCE
                        </p>
                        <h1 className="text-3xl font-extrabold tracking-tight text-white sm:text-4xl drop-shadow-md">
                            Video Orientations
                        </h1>
                        <p className="mt-3 text-base text-white/90 leading-relaxed font-medium max-w-2xl">
                            Watch employee orientation and HR training videos.
                        </p>
                    </div>
                </section>

                <div className="flex items-center justify-between mb-4">
                    <h2 className="text-lg font-bold text-foreground">Available Videos</h2>
                    <div className="flex items-center gap-1 bg-muted p-1 rounded-xl">
                        <button
                            onClick={() => setViewMode('card')}
                            className={`cursor-pointer p-2 rounded-lg transition-colors ${viewMode === 'card' ? 'bg-background shadow-sm text-foreground' : 'text-muted-foreground hover:text-foreground hover:bg-background/50'}`}
                            title="Grid View"
                        >
                            <LayoutGrid className="w-4 h-4" />
                        </button>
                        <button
                            onClick={() => setViewMode('list')}
                            className={`cursor-pointer p-2 rounded-lg transition-colors ${viewMode === 'list' ? 'bg-background shadow-sm text-foreground' : 'text-muted-foreground hover:text-foreground hover:bg-background/50'}`}
                            title="List View"
                        >
                            <List className="w-4 h-4" />
                        </button>
                    </div>
                </div>

                <div className={viewMode === 'card' ? "grid gap-4 md:grid-cols-2 xl:grid-cols-3" : "flex flex-col gap-4"}>
                    {videos.map((video: any) => (
                        <button
                            key={video.id}
                            onClick={() => {
                                setSelectedVideo(video);
                                setIsPlayerActive(true);
                                handleMouseMove();
                            }}
                            className={`group relative overflow-hidden rounded-2xl border bg-card p-5 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-md hover:border-[#00D4FF]/40 text-left w-full ${viewMode === 'list' ? 'flex flex-col sm:flex-row items-start sm:items-center gap-6' : 'block'}`}
                        >
                            <div className="absolute inset-0 bg-gradient-to-br from-[#00D4FF]/5 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100 pointer-events-none" />

                            <div className={`relative z-10 ${viewMode === 'list' ? 'w-full sm:w-48 flex-shrink-0' : 'mb-4'}`}>
                                <div className="cursor-pointer aspect-video rounded-xl bg-gradient-to-br from-[#1E293B] to-[#0F172A] flex items-center justify-center transition-colors duration-300 group-hover:shadow-[0_0_15px_rgba(0,212,255,0.2)] overflow-hidden relative border border-white/5">
                                    {video.embed_url && getYouTubeThumbnail(video.embed_url) ? (
                                        <img 
                                            src={getYouTubeThumbnail(video.embed_url)!} 
                                            alt={video.title}
                                            className="absolute inset-0 w-full h-full object-cover opacity-60 group-hover:opacity-80 transition-opacity duration-300"
                                        />
                                    ) : (
                                        <div className="absolute inset-0 bg-[#0F172A] opacity-80 mix-blend-overlay"></div>
                                    )}

                                    {video.video_path && (
                                        <VideoDuration src={`/storage/${video.video_path}`} />
                                    )}

                                    <div className="absolute top-2 left-2 z-20">
                                        {video.video_path ? (
                                            <span className="flex items-center gap-1 bg-indigo-500/80 backdrop-blur-md text-white text-[9px] font-bold px-1.5 py-0.5 rounded shadow-sm uppercase tracking-wider">
                                                <FileVideo className="w-3 h-3" /> MP4
                                            </span>
                                        ) : (
                                            <span className="flex items-center gap-1 bg-red-600/80 backdrop-blur-md text-white text-[9px] font-bold px-1.5 py-0.5 rounded shadow-sm uppercase tracking-wider">
                                                <Youtube className="w-3 h-3" /> YouTube
                                            </span>
                                        )}
                                    </div>

                                    <div className="flex flex-col items-center justify-center text-center relative z-20">
                                        <PlayCircle className={`transition-all duration-300 text-white/80 group-hover:text-[#00D4FF] group-hover:scale-110 drop-shadow-md ${viewMode === 'list' ? 'h-10 w-10' : 'h-12 w-12 mb-2'}`} />
                                    </div>
                                </div>
                            </div>

                            <div className={`relative z-10 flex-1 ${viewMode === 'list' ? 'flex flex-col justify-center' : ''}`}>
                                <h2 className={`font-semibold text-foreground ${viewMode === 'list' ? 'text-lg' : ''}`}>
                                    {video.title}
                                </h2>
                                {video.description && (
                                    <p className={`mt-1 text-sm text-muted-foreground ${viewMode === 'card' ? 'line-clamp-2' : ''}`}>
                                        {video.description}
                                    </p>
                                )}
                            </div>
                        </button>
                    ))}

                    {videos.length === 0 && (
                        <div className="col-span-full py-12 text-center text-muted-foreground">
                            No active orientation videos found.
                        </div>
                    )}
                </div>
            </div>

            <Dialog open={!!selectedVideo} onOpenChange={(open) => { if (!open) setSelectedVideo(null); }}>
                <DialogContent
                    className="sm:max-w-4xl p-0 overflow-hidden bg-black border-border/50 [&>button]:hidden"
                    onMouseMove={handleMouseMove}
                    onMouseLeave={() => setIsPlayerActive(false)}
                >
                    <DialogDescription className="hidden">Video Player</DialogDescription>
                    <div className={`absolute top-0 left-0 right-0 z-50 flex items-center justify-between p-4 bg-gradient-to-b from-black/80 to-transparent transition-opacity duration-500 pointer-events-none ${isPlayerActive ? 'opacity-100' : 'opacity-0'}`}>
                        <DialogTitle className="text-white drop-shadow-md pointer-events-auto">{selectedVideo?.title}</DialogTitle>
                        <button
                            onClick={() => setSelectedVideo(null)}
                            className="pointer-events-auto rounded-full p-2 bg-white/10 text-white hover:bg-white/20 transition-colors backdrop-blur-sm"
                        >
                            <X className="w-5 h-5" />
                        </button>
                    </div>

                    <div className="w-full aspect-video bg-black flex items-center justify-center relative">
                        {selectedVideo && (
                            selectedVideo.video_path ? (
                                <video
                                    src={`/storage/${selectedVideo.video_path}`}
                                    controls
                                    autoPlay
                                    controlsList="nodownload"
                                    onContextMenu={(e) => e.preventDefault()}
                                    className="w-full h-full object-contain"
                                />
                            ) : (
                                <iframe
                                    src={getYouTubeEmbedUrl(selectedVideo.embed_url)}
                                    className="w-full h-full border-0"
                                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                    allowFullScreen
                                />
                            )
                        )}
                    </div>
                </DialogContent>
            </Dialog>
        </>
    );
}