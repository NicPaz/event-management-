import type { InputHTMLAttributes } from 'react';
import { cn } from '@/lib/utils';

function Switch({
    className,
    ...props
}: Omit<InputHTMLAttributes<HTMLInputElement>, 'type'>) {
    return (
        <input
            type="checkbox"
            role="switch"
            data-slot="switch"
            className={cn(
                'before:bg-card checked:bg-primary focus-visible:ring-ring/35 relative h-6 w-11 shrink-0 cursor-pointer appearance-none rounded-full border border-input bg-muted shadow-inner outline-none transition-colors before:absolute before:top-0.5 before:left-0.5 before:size-4.5 before:rounded-full before:shadow-sm before:transition-transform checked:before:translate-x-5 focus-visible:ring-3 disabled:cursor-not-allowed disabled:opacity-50',
                className,
            )}
            {...props}
        />
    );
}

export { Switch };
