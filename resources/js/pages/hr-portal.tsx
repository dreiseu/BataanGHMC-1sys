import ModulePageHeader from '@/components/module-page-header';
import { Head, Link } from '@inertiajs/react';
import {
    Bell,
    BriefcaseBusiness,
    Download,
    FileText,
    HelpCircle,
    PlayCircle,
    Search,
} from 'lucide-react';
import { useState } from 'react';

const hrSections = [
    {
        title: 'Video Orientation',
        description: 'Watch onboarding and HR orientation videos.',
        icon: PlayCircle,
        href: '/hr-portal/video-orientation',
    },
    {
        title: 'Downloadable Forms',
        description: 'Access HR forms, templates, and request documents.',
        icon: Download,
        href: '/hr-portal/downloadable-forms',
    },
    {
        title: 'Policies & Memoranda',
        description: 'Read HR policies, advisories, and memoranda.',
        icon: FileText,
        href: '/hr-portal/policies',
    },
    {
        title: 'Leave & Benefits',
        description: 'Find leave, benefits, and employee welfare resources.',
        icon: BriefcaseBusiness,
        href: '/hr-portal/leave-benefits',
    },
    {
        title: 'HR Announcements',
        description: 'View official HR updates and announcements.',
        icon: Bell,
        href: '/hr-portal/announcements',
    },
    {
        title: 'FAQs',
        description: 'Common questions about HR processes and services.',
        icon: HelpCircle,
        href: '/hr-portal/faqs',
    },
];

const announcementsPreview = [
    {
        title: 'Updated leave filing schedule released',
        date: 'Apr 24, 2026',
        isNew: true,
    },
    {
        title: 'Mandatory employee orientation this month',
        date: 'Apr 20, 2026',
        isNew: true,
    },
    {
        title: 'New HR advisory on employee benefits',
        date: 'Mar 31, 2026',
        isNew: false,
    },
];

export default function HrPortal() {

    const [resourceSearch, setResourceSearch] = useState('');

    const filteredHrSections = hrSections.filter((section) =>
        section.title.toLowerCase().includes(resourceSearch.toLowerCase()) ||
        section.description.toLowerCase().includes(resourceSearch.toLowerCase())
    );

    return (
        <>
            <Head title="HR Portal" />

            <div className="p-6">
                <ModulePageHeader
                    title="HR Portal"
                    description="Human Resource services, employee resources, policies, forms, and announcements."
                />

                <div className="mb-6 rounded-2xl border bg-card p-6 shadow-sm">
                    <p className="text-sm font-medium text-muted-foreground">
                        Human Resource Management Office
                    </p>

                    <h2 className="mt-2 text-2xl font-bold tracking-tight">
                        Employee services, forms, policies, and HR updates in one place.
                    </h2>

                    <p className="mt-3 max-w-3xl text-sm text-muted-foreground">
                        Access orientation materials, downloadable forms, employee benefits
                        resources, announcements, and frequently asked questions.
                    </p>
                </div>

                <div className="mb-6 flex items-center gap-2 rounded-xl border bg-card px-3 py-2 shadow-sm">
                    <Search className="h-4 w-4 text-muted-foreground" />

                    <input
                        value={resourceSearch}
                        onChange={(e) =>
                            setResourceSearch(e.target.value)
                        }
                        placeholder="Search HR resources..."
                        className="w-full bg-transparent text-sm outline-none"
                    />
                </div>

                <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
                    {filteredHrSections.map((section) => {
                        const Icon = section.icon;

                        return (
                            <Link
                                key={section.title}
                                href={section.href}
                                className="group rounded-xl border bg-card p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
                            >
                                <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-xl bg-muted">
                                    <Icon className="h-5 w-5" />
                                </div>

                                <h2 className="font-semibold">
                                    {section.title}
                                </h2>

                                <p className="mt-2 text-sm text-muted-foreground">
                                    {section.description}
                                </p>
                            </Link>
                        );
                    })}
                </div>

                {filteredHrSections.length === 0 && (
                    <div className="rounded-xl border bg-card p-6 text-center text-sm text-muted-foreground">
                        No HR resources found.
                    </div>
                )}

                <div className="mt-8 rounded-2xl border bg-card p-6 shadow-sm">
                    <h2 className="text-lg font-semibold">
                        Latest HR Announcements
                    </h2>

                    <div className="mt-4 grid gap-3">
                        {announcementsPreview.map((item) => (
                            <div
                                key={item.title}
                                className="rounded-lg border p-4"
                            >
                                <div className="flex items-center justify-between gap-4">
                                    <h3 className="font-medium">
                                        {item.title}
                                    </h3>

                                    {item.isNew && (
                                        <span className="rounded-full bg-primary px-2 py-1 text-xs text-primary-foreground">
                                            NEW
                                        </span>
                                    )}
                                </div>

                                <p className="mt-2 text-sm text-muted-foreground">
                                    {item.date}
                                </p>
                            </div>
                        ))}
                    </div>

                    <Link
                        href="/hr-portal/announcements"
                        className="mt-4 inline-block text-sm font-medium underline"
                    >
                        View all announcements
                    </Link>
                </div>
            </div>
        </>
    );
}