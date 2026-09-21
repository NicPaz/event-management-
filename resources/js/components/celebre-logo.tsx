import type { ImgHTMLAttributes } from 'react';
import { cn } from '@/lib/utils';

type CelebreLogoProps = Omit<
    ImgHTMLAttributes<HTMLImageElement>,
    'alt' | 'src'
> & {
    variant?: 'primary' | 'light' | 'symbol';
    decorative?: boolean;
};

const sources = {
    primary: '/images/brand/celebre-logo.png',
    light: '/images/brand/celebre-logo-clara.png',
    symbol: '/images/brand/celebre-simbolo.png',
} as const;

export function CelebreLogo({
    variant = 'primary',
    decorative = false,
    className,
    ...props
}: CelebreLogoProps) {
    return (
        <img
            src={sources[variant]}
            alt={decorative ? '' : 'Celebre'}
            aria-hidden={decorative || undefined}
            className={cn('block object-contain', className)}
            {...props}
        />
    );
}
