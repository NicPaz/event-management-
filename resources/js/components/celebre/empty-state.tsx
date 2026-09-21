import type { LucideIcon } from 'lucide-react';
import type { ReactNode } from 'react';

export function EmptyState({
    icon: Icon,
    title,
    description,
    action,
}: {
    icon: LucideIcon;
    title: string;
    description: string;
    action?: ReactNode;
}) {
    return (
        <div className="border-primary/25 bg-card relative isolate grid min-h-56 justify-items-center gap-4 overflow-hidden rounded-2xl border border-dashed p-8 text-center shadow-[0_10px_35px_rgba(59,39,82,0.04)]">
            <span className="bg-brand-orange/12 absolute -top-8 -right-8 -z-10 size-28 rounded-full" />
            <span className="bg-brand-yellow/18 absolute -bottom-10 -left-8 -z-10 size-24 rounded-full" />
            <div className="bg-brand-soft text-primary flex size-12 items-center justify-center rounded-2xl">
                <Icon className="size-6" aria-hidden="true" />
            </div>
            <div className="max-w-md">
                <h2 className="font-serif text-xl">{title}</h2>
                <p className="text-muted-foreground mt-1 text-sm leading-6">
                    {description}
                </p>
            </div>
            {action}
        </div>
    );
}
