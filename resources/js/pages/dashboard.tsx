import { Head, Link } from '@inertiajs/react';
import {
    BookOpen,
    Building2,
    FileText,
    HeartPulse,
    IdCard,
    LayoutGrid,
    QrCode,
    Users,
} from 'lucide-react';

const modules = [
    {
        title: 'HR Portal',
        description: 'Human resource services and employee records.',
        href: '/hr-portal',
        icon: Users,
    },
    {
        title: 'PETRO',
        description: 'Performance tracking and reporting tools.',
        href: '/petro',
        icon: FileText,
    },
    {
        title: 'PGS',
        description: 'Governance scorecards and monitoring.',
        href: '/pgs',
        icon: LayoutGrid,
    },
    {
        title: 'EFMS',
        description: 'Electronic forms and document management.',
        href: '/efms',
        icon: Building2,
    },
    {
        title: 'IHOMP',
        description: 'Integrated hospital operations module.',
        href: '/ihomp',
        icon: HeartPulse,
    },
    {
        title: "Employee's Portal",
        description: 'Employee self-service access.',
        href: '/employees-portal',
        icon: IdCard,
    },
    {
        title: 'User Guide',
        description: 'Guides, manuals, and system instructions.',
        href: '/user-guide',
        icon: BookOpen,
    },
    {
        title: 'QR-PASS',
        description: 'QR-based pass and verification tools.',
        href: '/qr-pass',
        icon: QrCode,
    },
];

export default function Dashboard() {
    return (
        <>
            <Head title="1sys Home" />

            <div className="flex flex-col gap-6 p-4">
                <section className="rounded-2xl border bg-card p-8 shadow-sm">
                    <p className="text-sm font-medium text-muted-foreground">
                        All-in-One System Portal
                    </p>

                    <h1 className="mt-2 text-4xl font-bold tracking-tight">
                        Welcome to 1sys
                    </h1>

                    <p className="mt-3 max-w-2xl text-muted-foreground">
                        Access institutional systems, employee services,
                        guides, directories, and internal tools from one place.
                    </p>
                </section>

                <section>
                    <h2 className="mb-3 text-xl font-semibold">
                        Quick Access
                    </h2>

                    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                        {modules.map((module) => {
                            const Icon = module.icon;

                            return (
                                <Link
                                    key={module.href}
                                    href={module.href}
                                    className="group rounded-2xl border bg-card p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
                                >
                                    <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-xl bg-muted">
                                        <Icon className="h-5 w-5" />
                                    </div>

                                    <h3 className="font-semibold">
                                        {module.title}
                                    </h3>

                                    <p className="mt-1 text-sm text-muted-foreground">
                                        {module.description}
                                    </p>
                                </Link>
                            );
                        })}
                    </div>
                </section>

                <section className="grid gap-4 lg:grid-cols-2">
                    <div className="rounded-2xl border bg-card p-5 shadow-sm">
                        <h2 className="text-lg font-semibold">
                            Announcements
                        </h2>

                        <p className="mt-2 text-sm text-muted-foreground">
                            No announcements available yet.
                        </p>
                    </div>

                    <div className="rounded-2xl border bg-card p-5 shadow-sm">
                        <h2 className="text-lg font-semibold">
                            Useful Links
                        </h2>

                        <p className="mt-2 text-sm text-muted-foreground">
                            Add frequently used links here.
                        </p>
                    </div>
                </section>
            </div>
        </>
    );
}