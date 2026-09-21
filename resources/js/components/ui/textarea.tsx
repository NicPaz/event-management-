import * as React from 'react';
import { cn } from '@/lib/utils';

function Textarea({
    className,
    ...props
}: React.ComponentProps<'textarea'>) {
    return (
        <textarea
            data-slot="textarea"
            className={cn(
                'border-input placeholder:text-muted-foreground selection:bg-primary selection:text-primary-foreground min-h-24 w-full rounded-xl border bg-card px-3.5 py-3 text-base shadow-xs transition-[color,box-shadow] outline-none disabled:cursor-not-allowed disabled:bg-muted disabled:opacity-60 md:text-sm',
                'focus-visible:border-ring focus-visible:ring-ring/35 focus-visible:ring-3',
                'aria-invalid:border-destructive aria-invalid:ring-destructive/20',
                className,
            )}
            {...props}
        />
    );
}

export { Textarea };
