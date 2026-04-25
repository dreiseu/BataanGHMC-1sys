type ModulePageHeaderProps = {
    title: string;
    description?: string;
};

export default function ModulePageHeader({
    title,
    description,
}: ModulePageHeaderProps) {
    return (
        <div className="mb-6">
            <h1 className="text-2xl font-bold tracking-tight">
                {title}
            </h1>

            {description && (
                <p className="mt-1 text-muted-foreground">
                    {description}
                </p>
            )}
        </div>
    );
}