import { type LucideIcon } from 'lucide-react';

type ModuleCardProps = {
    title: string;
    description: string;
    icon?: LucideIcon;
};

export default function ModuleCard({
    title,
    description,
    icon: Icon,
}: ModuleCardProps) {
    return (
        <div className="rounded-xl border bg-card p-5 shadow-sm">
            {Icon && (
                <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-lg bg-muted">
                    <Icon className="h-5 w-5" />
                </div>
            )}

            <h2 className="font-semibold">{title}</h2>

            <p className="mt-2 text-sm text-muted-foreground">
                {description}
            </p>
        </div>
    );
}