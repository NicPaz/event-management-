import type { ImgHTMLAttributes } from 'react';
import { CelebreLogo } from '@/components/celebre-logo';

export default function AppLogoIcon(
    props: ImgHTMLAttributes<HTMLImageElement>,
) {
    return <CelebreLogo variant="symbol" decorative {...props} />;
}
