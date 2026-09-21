import AppLogoIcon from '@/components/app-logo-icon';
import { CelebreLogo } from '@/components/celebre-logo';

export default function AppLogo() {
    return (
        <>
            <div className="flex aspect-square size-9 shrink-0 items-center justify-center rounded-xl bg-white shadow-sm ring-1 ring-black/5 dark:bg-white">
                <AppLogoIcon className="size-8" />
            </div>
            <div className="ml-1 flex flex-1 items-center group-data-[collapsible=icon]:hidden">
                <CelebreLogo className="h-8 w-auto max-w-28" />
            </div>
        </>
    );
}
