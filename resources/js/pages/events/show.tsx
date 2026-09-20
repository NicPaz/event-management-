import { Head, Link } from '@inertiajs/react';
import { Palette } from 'lucide-react';
import EventAppearanceController from '@/actions/App/Http/Controllers/EventAppearanceController';
import EventInvitation from '@/components/event-invitation';
import type { EventInvitation as EventInvitationData } from '@/types';

export default function PublicEventShow({
    event,
    preview,
    canCustomize,
    showGuestActions,
}: {
    event: EventInvitationData;
    preview: boolean;
    canCustomize: boolean;
    showGuestActions: boolean;
}) {
    return (
        <>
            <Head title={event.title} />
            <main>
                {canCustomize && (
                    <div className="fixed top-4 right-4 z-30">
                        <Link
                            href={EventAppearanceController.edit(event.id)}
                            className="inline-flex min-h-11 items-center gap-2 rounded-full bg-neutral-950 px-5 text-sm font-semibold text-white shadow-lg outline-offset-4 hover:bg-neutral-800 focus-visible:outline-2"
                        >
                            <Palette className="size-4" />
                            Personalizar
                        </Link>
                    </div>
                )}
                {preview && (
                    <div className="bg-[#88715b] px-4 py-2 text-center text-sm font-medium text-white">
                        Prévia privada — esta versão ainda não é necessariamente
                        pública
                    </div>
                )}
                <EventInvitation
                    event={event}
                    showGuestActions={showGuestActions}
                />
            </main>
        </>
    );
}
