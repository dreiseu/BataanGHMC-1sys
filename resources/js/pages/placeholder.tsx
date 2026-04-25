import { type BreadcrumbItem } from '@/types';
import { Head } from '@inertiajs/react';

type Props = {
    title: string;
};

export default function Placeholder({ title }: Props) {
    const breadcrumbs: BreadcrumbItem[] = [
        {
            title,
            href: '#',
        },
    ];

    return (
        <>
            <Head title={title} />

            <div className="flex h-full flex-1 flex-col gap-4 rounded-xl p-4">
                <div className="rounded-xl border p-6">
                    <h1 className="text-2xl font-bold">{title}</h1>
                    <p className="mt-2 text-muted-foreground">
                        This module is under construction.
                    </p>
                </div>
            </div>
        </>
    );
}