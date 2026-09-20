import { useState, type FormEvent } from 'react';
import { Head, Link, useForm } from '@inertiajs/react';
import { CircleCheck, Palette } from 'lucide-react';
import EventAppearanceController from '@/actions/App/Http/Controllers/EventAppearanceController';
import GiftReservationController from '@/actions/App/Http/Controllers/GiftReservationController';
import GuestIdentityController from '@/actions/App/Http/Controllers/GuestIdentityController';
import EventInvitation from '@/components/event-invitation';
import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { participation } from '@/routes/public/events';
import type {
    EventGift,
    EventInvitation as EventInvitationData,
} from '@/types';

type IdentifiedGuest = {
    name: string;
    reservations: Record<string, number>;
};

export default function PublicEventShow({
    event,
    preview,
    canCustomize,
    showGuestActions,
    guest,
}: {
    event: EventInvitationData;
    preview: boolean;
    canCustomize: boolean;
    showGuestActions: boolean;
    guest: IdentifiedGuest | null;
}) {
    const [checkoutGift, setCheckoutGift] = useState<EventGift | null>(null);
    const [reservedGift, setReservedGift] = useState<EventGift | null>(null);
    const [reservationError, setReservationError] = useState<string | null>(
        null,
    );
    const reservationForm = useForm({ quantity: 1 });
    const identityForm = useForm<{
        name: string;
        phone: string;
        gift_id: number | null;
    }>({
        name: '',
        phone: '',
        gift_id: null,
    });
    const identityErrors = identityForm.errors as typeof identityForm.errors & {
        identity?: string;
    };

    const selectGift = (gift: EventGift) => {
        setReservationError(null);
        setCheckoutGift(gift);

        if (guest === null || event.slug === null) {
            identityForm.setData('gift_id', gift.id);

            return;
        }

        const quantity = guest.reservations[String(gift.id)] ?? 1;
        reservationForm.transform(() => ({ quantity }));
        reservationForm.patch(
            GiftReservationController.update({
                event: event.slug,
                gift: gift.id,
            }).url,
            {
                preserveScroll: true,
                onSuccess: () => {
                    setReservedGift(gift);
                    setCheckoutGift(null);
                },
                onError: (errors) => {
                    setReservationError(
                        errors.quantity ??
                            errors.identity ??
                            'Não foi possível reservar este presente.',
                    );
                },
            },
        );
    };

    const identifyAndReserve = (submitEvent: FormEvent<HTMLFormElement>) => {
        submitEvent.preventDefault();

        if (checkoutGift === null || event.slug === null) {
            return;
        }

        identityForm.post(GuestIdentityController.store(event.slug).url, {
            preserveScroll: true,
            onSuccess: () => {
                setReservedGift(checkoutGift);
                setCheckoutGift(null);
                identityForm.reset();
            },
            onError: (errors) => {
                if (errors.quantity) {
                    setReservationError(errors.quantity);
                }
            },
        });
    };

    const closeCheckout = () => {
        setCheckoutGift(null);
        setReservationError(null);
        identityForm.clearErrors();
    };

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
                    onGiftSelect={showGuestActions ? selectGift : undefined}
                    reservingGiftId={
                        reservationForm.processing ? checkoutGift?.id : null
                    }
                    giftReservations={guest?.reservations}
                />
            </main>

            <Dialog
                open={
                    checkoutGift !== null &&
                    guest === null &&
                    reservationError === null
                }
                onOpenChange={(open) => !open && closeCheckout()}
            >
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Quem está presenteando?</DialogTitle>
                        <DialogDescription>
                            Informe seus dados para reservar{' '}
                            <strong>{checkoutGift?.name}</strong>. Você só
                            precisa fazer isso uma vez neste navegador.
                        </DialogDescription>
                    </DialogHeader>
                    <form onSubmit={identifyAndReserve} className="grid gap-4">
                        <div className="grid gap-2">
                            <Label htmlFor="checkout-name">Nome completo</Label>
                            <Input
                                id="checkout-name"
                                value={identityForm.data.name}
                                onChange={(inputEvent) =>
                                    identityForm.setData(
                                        'name',
                                        inputEvent.target.value,
                                    )
                                }
                                autoComplete="name"
                                maxLength={120}
                                required
                            />
                            <InputError message={identityForm.errors.name} />
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="checkout-phone">
                                Telefone com DDD
                            </Label>
                            <Input
                                id="checkout-phone"
                                type="tel"
                                inputMode="tel"
                                value={identityForm.data.phone}
                                onChange={(inputEvent) =>
                                    identityForm.setData(
                                        'phone',
                                        inputEvent.target.value,
                                    )
                                }
                                autoComplete="tel"
                                maxLength={24}
                                placeholder="(11) 99999-9999"
                                required
                            />
                            <InputError message={identityForm.errors.phone} />
                        </div>
                        <InputError
                            message={
                                identityErrors.identity ??
                                identityForm.errors.gift_id
                            }
                        />
                        <DialogFooter>
                            <Button
                                type="button"
                                variant="outline"
                                onClick={closeCheckout}
                            >
                                Cancelar
                            </Button>
                            <Button disabled={identityForm.processing}>
                                {identityForm.processing
                                    ? 'Reservando...'
                                    : 'Reservar presente'}
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>

            <Dialog
                open={reservedGift !== null}
                onOpenChange={(open) => !open && setReservedGift(null)}
            >
                <DialogContent>
                    <DialogHeader className="items-center text-center sm:text-center">
                        <CircleCheck className="size-12 text-emerald-600" />
                        <DialogTitle>Presente reservado!</DialogTitle>
                        <DialogDescription>
                            {reservedGift?.name} foi adicionado aos seus
                            presentes escolhidos.
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter className="sm:justify-center">
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => setReservedGift(null)}
                        >
                            Continuar escolhendo
                        </Button>
                        {event.slug && (
                            <Button asChild>
                                <Link
                                    href={`${participation(event.slug).url}#presentes`}
                                >
                                    Ver presentes escolhidos
                                </Link>
                            </Button>
                        )}
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            <Dialog
                open={reservationError !== null}
                onOpenChange={(open) => !open && closeCheckout()}
            >
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Não foi possível reservar</DialogTitle>
                        <DialogDescription>
                            {reservationError}
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter>
                        <Button type="button" onClick={closeCheckout}>
                            Entendi
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </>
    );
}
