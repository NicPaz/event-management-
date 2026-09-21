import { Link } from '@inertiajs/react';
import { CelebrationMarks } from '@/components/celebre/celebration-marks';
import { CelebreLogo } from '@/components/celebre-logo';
import { home } from '@/routes';
import type { AuthLayoutProps } from '@/types';

export default function AuthSimpleLayout({
    children,
    title,
    description,
}: AuthLayoutProps) {
    return (
        <div className="bg-background relative flex min-h-svh items-center justify-center overflow-hidden p-4 sm:p-8">
            <div className="bg-brand-orange/10 absolute -top-24 -left-20 size-72 rounded-full" />
            <div className="bg-brand-soft absolute -right-28 -bottom-20 size-80 rounded-full" />
            <CelebrationMarks className="absolute top-10 right-8 hidden sm:block" />

            <div className="relative w-full max-w-md">
                <div className="bg-card flex flex-col gap-7 rounded-2xl border p-6 shadow-[0_24px_70px_rgba(59,39,82,0.12)] sm:p-9">
                    <div className="flex flex-col items-center gap-6">
                        <Link
                            href={home()}
                            className="celebre-focus rounded-lg"
                        >
                            <CelebreLogo className="h-auto w-40 sm:w-44" />
                            <span className="sr-only">Página inicial</span>
                        </Link>

                        <div className="space-y-2 text-center">
                            <h1 className="font-serif text-3xl">{title}</h1>
                            <p className="text-muted-foreground text-sm leading-6">
                                {description}
                            </p>
                        </div>
                    </div>
                    {children}
                </div>
            </div>
        </div>
    );
}
