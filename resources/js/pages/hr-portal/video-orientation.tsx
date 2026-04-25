import ModulePageHeader from '@/components/module-page-header';
import { Head } from '@inertiajs/react';
import { PlayCircle } from 'lucide-react';

const videos = [
    {
        title: 'New Employee Orientation',
        duration: '25 mins',
    },
    {
        title: 'Code of Conduct Orientation',
        duration: '18 mins',
    },
    {
        title: 'Leave Filing Tutorial',
        duration: '12 mins',
    },
];

export default function VideoOrientation() {
    return (
        <>
            <Head title="Video Orientation" />

            <div className="p-6">
                <ModulePageHeader
                    title="Video Orientation"
                    description="Employee orientation and HR training videos."
                />

                <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                    {videos.map((video) => (
                        <a
                            key={video.title}
                            href="#"
                            className="block rounded-xl border bg-card p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
                        >
                            <div className="mb-4 aspect-video rounded-lg bg-muted flex items-center justify-center">
                                <div className="flex flex-col items-center justify-center text-center">
                                    <PlayCircle className="h-10 w-10 mb-2" />

                                    <span className="text-sm text-muted-foreground">
                                        Click to watch
                                    </span>
                                </div>
                            </div>

                            <h2 className="font-semibold">
                                {video.title}
                            </h2>

                            <p className="mt-1 text-sm text-muted-foreground">
                                {video.duration}
                            </p>
                        </a>
                    ))}
                </div>
            </div>
        </>
    );
}