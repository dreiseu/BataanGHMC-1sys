import ModulePageHeader from '@/components/module-page-header';
import { Head } from '@inertiajs/react';
import { PlayCircle } from 'lucide-react';

const videos = [
    {
        title: 'Introduction',
        duration: 'Duration: 5:09',
    },
    {
        title: 'Mission & Vision',
        duration: 'Duration: 5:22',
    },
    {
        title: 'Leave of Absence',
        duration: 'Duration: 8:10',
    },
    {
        title: 'Government Office Hours',
        duration: 'Duration: 4:52',
    },
    {
        title: 'Complimentary Time Off (CTO)',
        duration: 'Duration: 1:17',
    },
    {
        title: 'Daily Time Record (DTR)',
        duration: 'Duration: 0:35',
    },
    {
        title: 'Salary and Other Benefits',
        duration: 'Duration: 6:02',
    },
    {
        title: 'Code of Conduct',
        duration: 'Duration: 3:29',
    },
    {
        title: 'Norms',
        duration: 'Duration: 0:53',
    },
    {
        title: 'Performance Evaluation',
        duration: 'Duration: 3:08',
    },
    {
        title: 'Training and Development',
        duration: 'Duration: 1:25',
    },
    {
        title: 'Mandatory Requirements',
        duration: 'Duration: 0:21',
    },
    {
        title: 'Other Policies',
        duration: 'Duration: 3:03',
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
                            className="group relative overflow-hidden rounded-2xl border bg-card p-5 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-md hover:border-[#00D4FF]/40 block"
                        >
                            <div className="absolute inset-0 bg-gradient-to-br from-[#00D4FF]/5 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100 pointer-events-none" />

                            <div className="relative z-10">
                                <div className="mb-4 aspect-video rounded-xl bg-[#1E293B]/5 flex items-center justify-center transition-colors duration-300 group-hover:bg-[#00D4FF]/10">
                                    <div className="flex flex-col items-center justify-center text-center">
                                        <PlayCircle className="h-10 w-10 mb-2 text-[#1E293B] transition-all duration-300 group-hover:text-[#00D4FF] group-hover:scale-110" />

                                        <span className="text-sm font-medium text-muted-foreground group-hover:text-[#00D4FF]/80 transition-colors">
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
                            </div>
                        </a>
                    ))}
                </div>
            </div>
        </>
    );
}