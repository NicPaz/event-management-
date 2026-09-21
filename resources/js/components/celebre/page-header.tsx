import type { ReactNode } from 'react';

export function PageHeader({
    title,
    description,
    eyebrow,
    actions,
}: {
    title: string;
    description?: string;
    eyebrow?: string;
    actions?: ReactNode;
}) {
    return (
        <header className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div className="max-w-3xl">
                {eyebrow && (
                    <p className="text-primary mb-2 text-xs font-bold tracking-[0.18em] uppercase">
                        {eyebrow}
                    </p>
                )}
                <h1 className="celebre-editorial-title text-3xl sm:text-4xl">
                    {title}
                </h1>
                {description && (
                    <p className="text-muted-foreground mt-2 text-sm leading-6 sm:text-base">
                        {description}
                    </p>
                )}
            </div>
            {actions && (
                <div className="flex flex-wrap items-center gap-2">
                    {actions}
                </div>
            )}
        </header>
    );
}
