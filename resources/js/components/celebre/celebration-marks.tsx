import { cn } from '@/lib/utils';

export function CelebrationMarks({ className }: { className?: string }) {
    return (
        <span
            aria-hidden="true"
            className={cn('relative block h-10 w-12', className)}
        >
            <span className="bg-brand-yellow absolute top-0 left-5 h-4 w-1.5 rotate-3 rounded-full" />
            <span className="bg-brand-orange absolute top-3 right-1 h-1.5 w-4 -rotate-12 rounded-full" />
            <span className="bg-primary absolute bottom-0 left-1 h-1.5 w-4 rotate-[25deg] rounded-full" />
        </span>
    );
}
