import { useEffect, type RefObject } from 'react';
import { router } from '@inertiajs/react';

export function UnsavedChangesGuard({
    when,
    bypassRef,
}: {
    when: boolean;
    bypassRef?: RefObject<boolean>;
}) {
    useEffect(() => {
        if (!when) {
            return;
        }

        const message =
            'Você tem alterações ainda não salvas. Deseja sair e descartá-las?';
        const beforeUnload = (event: BeforeUnloadEvent) => {
            if (bypassRef?.current) {
                return;
            }

            event.preventDefault();
            event.returnValue = '';
        };
        const removeBeforeListener = router.on('before', () => {
            if (bypassRef?.current) {
                return;
            }

            return window.confirm(message);
        });

        window.addEventListener('beforeunload', beforeUnload);

        return () => {
            removeBeforeListener();
            window.removeEventListener('beforeunload', beforeUnload);
        };
    }, [bypassRef, when]);

    return null;
}
