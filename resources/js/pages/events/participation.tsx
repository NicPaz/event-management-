import { useState } from 'react';
import { Form, Head, Link } from '@inertiajs/react';
import GuestAttendanceController from '@/actions/App/Http/Controllers/GuestAttendanceController';
import GuestIdentityController from '@/actions/App/Http/Controllers/GuestIdentityController';
import GiftReservationController from '@/actions/App/Http/Controllers/GiftReservationController';
import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { show as publicEvent } from '@/routes/public/events';
import type { EventInvitation } from '@/types';

type GuestParticipation = {
    name: string;
    rsvpStatus: 'unanswered' | 'confirmed' | 'declined';
    companionsCount: number;
};

const statusLabels: Record<GuestParticipation['rsvpStatus'], string> = {
    unanswered: 'Você ainda não respondeu',
    confirmed: 'Sua presença está confirmada',
    declined: 'Você informou que não poderá ir',
};

export default function Participation({
    event,
    guest,
    canRespond,
    reservations,
}: {
    event: EventInvitation;
    guest: GuestParticipation | null;
    canRespond: boolean;
    reservations: Record<string, { giftName: string; quantity: number }>;
}) {
    const [attendanceChoice, setAttendanceChoice] = useState<
        'confirmed' | 'declined' | null
    >(null);

    return (
        <>
            <Head title={`Minha participação — ${event.title}`} />
            <main
                className="min-h-screen px-4 py-8 sm:py-14"
                style={{
                    backgroundColor: event.theme.backgroundColor,
                    color: event.theme.textColor,
                }}
            >
                <div className="mx-auto flex w-full max-w-xl flex-col gap-5">
                    <div className="text-center">
                        <Link
                            href={publicEvent(event.slug ?? '')}
                            className="text-sm underline underline-offset-4"
                        >
                            Voltar ao convite
                        </Link>
                        <h1 className="mt-5 font-serif text-4xl">
                            Minha participação
                        </h1>
                        <p className="mt-2 text-sm opacity-70">{event.title}</p>
                    </div>

                    {guest === null ? (
                        <Card>
                            <CardHeader>
                                <CardTitle>Identifique-se</CardTitle>
                                <CardDescription>
                                    Use o mesmo nome e telefone nos próximos
                                    acessos. O telefone não é verificado por
                                    SMS.
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                <Form
                                    action={GuestIdentityController.store(
                                        event.slug ?? '',
                                    )}
                                    options={{ preserveScroll: true }}
                                >
                                    {({ errors, processing }) => (
                                        <div className="grid gap-5">
                                            <div className="grid gap-2">
                                                <Label htmlFor="name">
                                                    Nome completo
                                                </Label>
                                                <Input
                                                    id="name"
                                                    name="name"
                                                    autoComplete="name"
                                                    maxLength={120}
                                                    required
                                                />
                                                <InputError
                                                    message={errors.name}
                                                />
                                            </div>
                                            <div className="grid gap-2">
                                                <Label htmlFor="phone">
                                                    Telefone com DDD
                                                </Label>
                                                <Input
                                                    id="phone"
                                                    name="phone"
                                                    type="tel"
                                                    inputMode="tel"
                                                    autoComplete="tel"
                                                    maxLength={24}
                                                    placeholder="(11) 99999-9999"
                                                    required
                                                />
                                                <InputError
                                                    message={errors.phone}
                                                />
                                            </div>
                                            <InputError
                                                message={errors.identity}
                                            />
                                            <Button disabled={processing}>
                                                {processing
                                                    ? 'Entrando...'
                                                    : 'Acessar participação'}
                                            </Button>
                                        </div>
                                    )}
                                </Form>
                            </CardContent>
                        </Card>
                    ) : (
                        <>
                            <Card>
                                <CardHeader>
                                    <CardTitle>Olá, {guest.name}</CardTitle>
                                    <CardDescription>
                                        Escolha abaixo se você poderá
                                        participar.
                                    </CardDescription>
                                </CardHeader>
                                <CardContent className="grid gap-5">
                                    <div
                                        className={`rounded-xl border p-4 ${
                                            guest.rsvpStatus === 'confirmed'
                                                ? 'border-emerald-200 bg-emerald-50 text-emerald-950'
                                                : guest.rsvpStatus ===
                                                    'declined'
                                                  ? 'border-amber-200 bg-amber-50 text-amber-950'
                                                  : 'bg-muted/50'
                                        }`}
                                    >
                                        <p className="text-xs font-semibold tracking-wide uppercase opacity-70">
                                            Situação atual
                                        </p>
                                        <p className="mt-1 text-lg font-semibold">
                                            {statusLabels[guest.rsvpStatus]}
                                        </p>
                                        {guest.rsvpStatus === 'confirmed' && (
                                            <p className="mt-1 text-sm opacity-80">
                                                {guest.companionsCount === 0
                                                    ? 'Sem acompanhantes.'
                                                    : `${guest.companionsCount} acompanhante${guest.companionsCount === 1 ? '' : 's'}.`}
                                            </p>
                                        )}
                                    </div>

                                    {!canRespond && (
                                        <p className="rounded-lg border p-4 text-sm">
                                            Este evento está disponível somente
                                            para consulta ou não aceita novas
                                            respostas no momento.
                                        </p>
                                    )}

                                    {canRespond && (
                                        <div className="grid gap-5">
                                            <div className="grid gap-3 sm:grid-cols-2">
                                                <Button
                                                    type="button"
                                                    variant={
                                                        attendanceChoice ===
                                                        'confirmed'
                                                            ? 'default'
                                                            : 'outline'
                                                    }
                                                    className="h-auto min-h-14 py-3 whitespace-normal"
                                                    onClick={() =>
                                                        setAttendanceChoice(
                                                            'confirmed',
                                                        )
                                                    }
                                                >
                                                    Confirmar presença
                                                </Button>
                                                <Button
                                                    type="button"
                                                    variant={
                                                        attendanceChoice ===
                                                        'declined'
                                                            ? 'destructive'
                                                            : 'outline'
                                                    }
                                                    className="h-auto min-h-14 py-3 whitespace-normal"
                                                    onClick={() =>
                                                        setAttendanceChoice(
                                                            'declined',
                                                        )
                                                    }
                                                >
                                                    Não poderei ir
                                                </Button>
                                            </div>

                                            {attendanceChoice ===
                                                'confirmed' && (
                                                <Form
                                                    action={GuestAttendanceController.update(
                                                        event.slug ?? '',
                                                    )}
                                                    options={{
                                                        preserveScroll: true,
                                                    }}
                                                >
                                                    {({
                                                        errors,
                                                        processing,
                                                    }) => (
                                                        <div className="grid gap-4 rounded-xl border p-4">
                                                            <input
                                                                type="hidden"
                                                                name="status"
                                                                value="confirmed"
                                                            />
                                                            <div className="grid gap-2">
                                                                <Label htmlFor="companions_count">
                                                                    Quantidade
                                                                    de
                                                                    acompanhantes
                                                                </Label>
                                                                <Input
                                                                    id="companions_count"
                                                                    name="companions_count"
                                                                    type="number"
                                                                    min={0}
                                                                    max={100}
                                                                    defaultValue={
                                                                        guest.companionsCount
                                                                    }
                                                                    required
                                                                />
                                                                <InputError
                                                                    message={
                                                                        errors.companions_count
                                                                    }
                                                                />
                                                            </div>
                                                            <InputError
                                                                message={
                                                                    errors.attendance ??
                                                                    errors.identity
                                                                }
                                                            />
                                                            <Button
                                                                disabled={
                                                                    processing
                                                                }
                                                            >
                                                                {processing
                                                                    ? 'Confirmando...'
                                                                    : 'Salvar confirmação'}
                                                            </Button>
                                                        </div>
                                                    )}
                                                </Form>
                                            )}

                                            {attendanceChoice ===
                                                'declined' && (
                                                <Form
                                                    action={GuestAttendanceController.update(
                                                        event.slug ?? '',
                                                    )}
                                                    options={{
                                                        preserveScroll: true,
                                                    }}
                                                >
                                                    {({
                                                        errors,
                                                        processing,
                                                    }) => (
                                                        <div className="grid gap-4 rounded-xl border border-amber-200 bg-amber-50/60 p-4">
                                                            <input
                                                                type="hidden"
                                                                name="status"
                                                                value="declined"
                                                            />
                                                            <input
                                                                type="hidden"
                                                                name="companions_count"
                                                                value="0"
                                                            />
                                                            <div>
                                                                <p className="font-medium">
                                                                    O que deseja
                                                                    fazer com
                                                                    seus
                                                                    presentes?
                                                                </p>
                                                                <p className="text-muted-foreground mt-1 text-sm">
                                                                    Esta escolha
                                                                    afeta suas
                                                                    reservas
                                                                    atuais.
                                                                </p>
                                                            </div>
                                                            <label className="flex items-start gap-3 rounded-lg border bg-white p-3 text-sm">
                                                                <input
                                                                    type="radio"
                                                                    name="reservation_handling"
                                                                    value="keep"
                                                                    defaultChecked
                                                                    className="mt-0.5"
                                                                />
                                                                Manter os
                                                                presentes que
                                                                escolhi
                                                            </label>
                                                            <label className="flex items-start gap-3 rounded-lg border bg-white p-3 text-sm">
                                                                <input
                                                                    type="radio"
                                                                    name="reservation_handling"
                                                                    value="cancel"
                                                                    className="mt-0.5"
                                                                />
                                                                Cancelar também
                                                                minhas reservas
                                                                de presentes
                                                            </label>
                                                            <InputError
                                                                message={
                                                                    errors.reservation_handling ??
                                                                    errors.attendance ??
                                                                    errors.identity
                                                                }
                                                            />
                                                            <Button
                                                                variant="destructive"
                                                                disabled={
                                                                    processing
                                                                }
                                                            >
                                                                {processing
                                                                    ? 'Salvando...'
                                                                    : 'Confirmar que não poderei ir'}
                                                            </Button>
                                                        </div>
                                                    )}
                                                </Form>
                                            )}
                                        </div>
                                    )}
                                </CardContent>
                            </Card>

                            <Card id="presentes">
                                <CardHeader>
                                    <CardTitle>Meus presentes</CardTitle>
                                    <CardDescription>
                                        Reserve a quantidade final desejada.
                                        Repetir o mesmo valor não duplica a
                                        reserva.
                                    </CardDescription>
                                </CardHeader>
                                <CardContent className="grid gap-4">
                                    {event.gifts.map((gift) => {
                                        const reservation =
                                            reservations[String(gift.id)];
                                        return (
                                            <div
                                                key={gift.id}
                                                id={`presente-${gift.id}`}
                                                className="grid gap-3 rounded-lg border p-4 sm:grid-cols-[1fr_auto] sm:items-end"
                                            >
                                                <div>
                                                    <h3 className="font-medium">
                                                        {gift.name}
                                                    </h3>
                                                    <p className="text-muted-foreground text-sm">
                                                        {gift.quantityAvailable}{' '}
                                                        unidades disponíveis
                                                        {reservation
                                                            ? ` · você reservou ${reservation.quantity}`
                                                            : ''}
                                                    </p>
                                                </div>
                                                <div className="flex flex-wrap gap-2">
                                                    <Form
                                                        action={GiftReservationController.update(
                                                            {
                                                                event:
                                                                    event.slug ??
                                                                    '',
                                                                gift: gift.id,
                                                            },
                                                        )}
                                                        options={{
                                                            preserveScroll: true,
                                                        }}
                                                    >
                                                        {({
                                                            errors,
                                                            processing,
                                                        }) => (
                                                            <div className="flex items-start gap-2">
                                                                <Input
                                                                    name="quantity"
                                                                    type="number"
                                                                    min={1}
                                                                    max={
                                                                        gift.quantityTotal
                                                                    }
                                                                    defaultValue={
                                                                        reservation?.quantity ??
                                                                        1
                                                                    }
                                                                    className="w-20"
                                                                    aria-label={`Quantidade de ${gift.name}`}
                                                                />
                                                                <Button
                                                                    disabled={
                                                                        processing ||
                                                                        event.isReadOnly ||
                                                                        (gift.quantityAvailable ===
                                                                            0 &&
                                                                            !reservation)
                                                                    }
                                                                >
                                                                    Reservar
                                                                </Button>
                                                                <InputError
                                                                    message={
                                                                        errors.quantity ??
                                                                        errors.identity
                                                                    }
                                                                />
                                                            </div>
                                                        )}
                                                    </Form>
                                                    {reservation && (
                                                        <Form
                                                            action={GiftReservationController.destroy(
                                                                {
                                                                    event:
                                                                        event.slug ??
                                                                        '',
                                                                    gift: gift.id,
                                                                },
                                                            )}
                                                            options={{
                                                                preserveScroll: true,
                                                            }}
                                                        >
                                                            <Button variant="outline">
                                                                Cancelar reserva
                                                            </Button>
                                                        </Form>
                                                    )}
                                                </div>
                                            </div>
                                        );
                                    })}
                                    {event.gifts.length === 0 && (
                                        <p className="text-muted-foreground text-sm">
                                            Nenhum presente disponível.
                                        </p>
                                    )}
                                </CardContent>
                            </Card>

                            <Form
                                action={GuestIdentityController.destroy(
                                    event.slug ?? '',
                                )}
                            >
                                {({ processing }) => (
                                    <Button
                                        variant="ghost"
                                        className="w-full"
                                        disabled={processing}
                                    >
                                        Sair ou trocar convidado
                                    </Button>
                                )}
                            </Form>
                        </>
                    )}
                </div>
            </main>
        </>
    );
}
