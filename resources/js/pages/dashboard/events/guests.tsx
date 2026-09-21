import { useState } from 'react';
import { Form, Head, Link, router, useForm } from '@inertiajs/react';
import { Gift, Pencil, Search, Users } from 'lucide-react';
import { toast } from 'sonner';
import EventGuestController from '@/actions/App/Http/Controllers/EventGuestController';
import { EmptyState } from '@/components/celebre/empty-state';
import { EventSelector } from '@/components/celebre/event-selector';
import { PageHeader } from '@/components/celebre/page-header';
import InputError from '@/components/input-error';
import { Pagination, type PaginationLink } from '@/components/pagination';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import {
    create,
    index as eventsIndex,
    show as eventShow,
} from '@/routes/events';
import { index as giftsIndex } from '@/routes/gifts';
import { index as guestsIndex } from '@/routes/guests';
import { index as nestedGuestsIndex } from '@/routes/events/guests';

type GuestStatus = 'unanswered' | 'confirmed' | 'declined';
type Guest = {
    id: number;
    name: string;
    phone: string;
    status: GuestStatus;
    companionsCount: number;
    reservations: { giftName: string; quantity: number }[];
};
type PaginatedGuests = {
    data: Guest[];
    links: PaginationLink[];
    total: number;
};
type EventOption = { id: number; title: string };

const statusLabels: Record<GuestStatus, string> = {
    unanswered: 'Sem resposta',
    confirmed: 'Confirmado',
    declined: 'Não irá',
};

const statusVariants: Record<GuestStatus, 'secondary' | 'success' | 'warning'> =
    {
        unanswered: 'secondary',
        confirmed: 'success',
        declined: 'warning',
    };

export default function EventGuests({
    event,
    events = [],
    guests,
    filters,
    metrics,
    standalone = false,
}: {
    event: EventOption | null;
    events?: EventOption[];
    guests: PaginatedGuests;
    filters: { search: string };
    metrics: {
        confirmedGuests: number;
        companions: number;
        expectedTotal: number;
        declinedGuests: number;
        reservedUnits: number;
    };
    standalone?: boolean;
}) {
    const [editingGuest, setEditingGuest] = useState<Guest | null>(null);
    const metricCards = [
        ['Titulares confirmados', metrics.confirmedGuests],
        ['Acompanhantes', metrics.companions],
        ['Total esperado', metrics.expectedTotal],
        ['Não irão', metrics.declinedGuests],
        ['Itens reservados', metrics.reservedUnits],
    ] as const;
    const searchAction = event
        ? standalone
            ? guestsIndex({ query: { event: event.id } })
            : nestedGuestsIndex(event.id)
        : guestsIndex();

    return (
        <>
            <Head
                title={event ? `Convidados — ${event.title}` : 'Convidados'}
            />
            <div className="flex flex-1 flex-col gap-6 p-4 md:p-6">
                <PageHeader
                    eyebrow="Organização"
                    title="Convidados"
                    description={
                        event?.title ??
                        'Selecione um evento para consultar convidados e reservas.'
                    }
                    actions={
                        event && (
                            <div className="flex flex-wrap gap-2">
                                {standalone && (
                                    <Button asChild variant="outline">
                                        <Link
                                            href={giftsIndex({
                                                query: { event: event.id },
                                            })}
                                        >
                                            Ver presentes
                                        </Link>
                                    </Button>
                                )}
                                <Button asChild variant="outline">
                                    <Link href={eventShow(event.id)}>
                                        Abrir evento
                                    </Link>
                                </Button>
                            </div>
                        )
                    }
                />

                {standalone && events.length > 0 && (
                    <Card>
                        <CardContent className="grid gap-2 pt-6">
                            <EventSelector
                                events={events}
                                selectedEventId={event?.id ?? null}
                                onChange={(eventId) => {
                                    router.get(
                                        guestsIndex({
                                            query: eventId
                                                ? { event: eventId }
                                                : {},
                                        }).url,
                                    );
                                }}
                            />
                        </CardContent>
                    </Card>
                )}

                {standalone && events.length === 0 && (
                    <EmptyState
                        icon={Users}
                        title="Seus convidados começam com um evento"
                        description="Crie seu primeiro evento para compartilhar o convite e receber confirmações."
                        action={
                            <Button asChild>
                                <Link href={create()}>
                                    Criar meu primeiro evento
                                </Link>
                            </Button>
                        }
                    />
                )}

                {standalone && events.length > 1 && event === null && (
                    <p className="text-muted-foreground rounded-xl border border-dashed p-10 text-center">
                        Selecione um evento acima para visualizar os convidados.
                    </p>
                )}

                {event && (
                    <>
                        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
                            {metricCards.map(([label, value]) => (
                                <Card key={label}>
                                    <CardHeader className="gap-1">
                                        <p className="text-muted-foreground text-sm">
                                            {label}
                                        </p>
                                        <CardTitle className="text-3xl tabular-nums">
                                            {value}
                                        </CardTitle>
                                    </CardHeader>
                                </Card>
                            ))}
                        </div>

                        <Card>
                            <CardContent className="pt-6">
                                <Form
                                    action={searchAction}
                                    options={{
                                        preserveState: true,
                                        replace: true,
                                    }}
                                    className="flex flex-col gap-3 sm:flex-row"
                                >
                                    {standalone && (
                                        <input
                                            type="hidden"
                                            name="event"
                                            value={event.id}
                                        />
                                    )}
                                    <div className="relative flex-1">
                                        <Search className="text-muted-foreground absolute top-1/2 left-3 size-4 -translate-y-1/2" />
                                        <Input
                                            name="search"
                                            defaultValue={filters.search}
                                            placeholder="Buscar por nome ou telefone"
                                            className="pl-9"
                                        />
                                    </div>
                                    <Button>Buscar</Button>
                                    {filters.search && (
                                        <Button asChild variant="outline">
                                            <Link href={searchAction}>
                                                Limpar
                                            </Link>
                                        </Button>
                                    )}
                                </Form>
                            </CardContent>
                        </Card>

                        {guests.data.length > 0 && (
                            <div className="overflow-hidden rounded-xl border">
                                <table className="hidden w-full table-fixed text-sm md:table">
                                    <thead className="bg-muted/60 text-left">
                                        <tr>
                                            <th className="w-[20%] px-4 py-3 font-medium">
                                                Nome
                                            </th>
                                            <th className="w-[16%] px-4 py-3 font-medium">
                                                Telefone
                                            </th>
                                            <th className="w-[14%] px-4 py-3 font-medium">
                                                Presença
                                            </th>
                                            <th className="w-[12%] px-4 py-3 text-center font-medium">
                                                Acompanhantes
                                            </th>
                                            <th className="px-4 py-3 font-medium">
                                                Presentes reservados
                                            </th>
                                            <th className="w-24 px-4 py-3 text-right font-medium">
                                                Ações
                                            </th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y">
                                        {guests.data.map((guest) => (
                                            <tr key={guest.id}>
                                                <td className="truncate px-4 py-3 font-medium">
                                                    {guest.name}
                                                </td>
                                                <td className="text-muted-foreground truncate px-4 py-3">
                                                    {guest.phone}
                                                </td>
                                                <td className="px-4 py-3">
                                                    <Badge
                                                        variant={
                                                            statusVariants[
                                                                guest.status
                                                            ]
                                                        }
                                                    >
                                                        {
                                                            statusLabels[
                                                                guest.status
                                                            ]
                                                        }
                                                    </Badge>
                                                </td>
                                                <td className="px-4 py-3 text-center tabular-nums">
                                                    {guest.companionsCount}
                                                </td>
                                                <td className="px-4 py-3">
                                                    <GuestReservations
                                                        guest={guest}
                                                    />
                                                </td>
                                                <td className="px-4 py-3 text-right">
                                                    <Button
                                                        type="button"
                                                        size="sm"
                                                        variant="ghost"
                                                        onClick={() =>
                                                            setEditingGuest(
                                                                guest,
                                                            )
                                                        }
                                                    >
                                                        <Pencil /> Editar
                                                    </Button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>

                                <div className="divide-y md:hidden">
                                    {guests.data.map((guest) => (
                                        <div
                                            key={guest.id}
                                            className="grid grid-cols-[minmax(0,1fr)_auto] gap-x-3 gap-y-2 px-4 py-3"
                                        >
                                            <div className="min-w-0">
                                                <p className="truncate font-medium">
                                                    {guest.name}
                                                </p>
                                                <p className="text-muted-foreground truncate text-sm">
                                                    {guest.phone}
                                                </p>
                                            </div>
                                            <Button
                                                type="button"
                                                size="icon"
                                                variant="ghost"
                                                aria-label={`Editar ${guest.name}`}
                                                onClick={() =>
                                                    setEditingGuest(guest)
                                                }
                                            >
                                                <Pencil />
                                            </Button>
                                            <div className="col-span-2 flex flex-wrap items-center gap-2 text-xs">
                                                <Badge
                                                    variant={
                                                        statusVariants[
                                                            guest.status
                                                        ]
                                                    }
                                                >
                                                    {statusLabels[guest.status]}
                                                </Badge>
                                                <span className="text-muted-foreground">
                                                    {guest.companionsCount}{' '}
                                                    acompanhante
                                                    {guest.companionsCount === 1
                                                        ? ''
                                                        : 's'}
                                                </span>
                                            </div>
                                            <div className="col-span-2">
                                                <GuestReservations
                                                    guest={guest}
                                                />
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                        {guests.data.length === 0 && (
                            <EmptyState
                                icon={Users}
                                title={
                                    filters.search
                                        ? 'Nenhum resultado encontrado'
                                        : 'Nenhum convidado identificado'
                                }
                                description={
                                    filters.search
                                        ? 'Tente buscar por outro nome ou telefone.'
                                        : 'Os convidados aparecerão aqui depois que acessarem o convite.'
                                }
                            />
                        )}
                        <Pagination links={guests.links} />

                        <GuestEditDialog
                            eventId={event.id}
                            guest={editingGuest}
                            onClose={() => setEditingGuest(null)}
                        />
                    </>
                )}
            </div>
        </>
    );
}

function GuestReservations({ guest }: { guest: Guest }) {
    if (guest.reservations.length === 0) {
        return (
            <span className="text-muted-foreground inline-flex items-center gap-1 text-xs">
                <Gift className="size-3.5" /> Nenhum presente reservado
            </span>
        );
    }

    return (
        <div className="flex min-w-0 flex-wrap gap-1">
            {guest.reservations.map((reservation) => (
                <Badge key={reservation.giftName} variant="secondary">
                    {reservation.giftName} × {reservation.quantity}
                </Badge>
            ))}
        </div>
    );
}

function GuestEditDialog({
    eventId,
    guest,
    onClose,
}: {
    eventId: number;
    guest: Guest | null;
    onClose: () => void;
}) {
    return (
        <Dialog
            open={guest !== null}
            onOpenChange={(open) => !open && onClose()}
        >
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Editar convidado</DialogTitle>
                    <DialogDescription>
                        Corrija os dados e a situação de presença sem alterar as
                        reservas ativas.
                    </DialogDescription>
                </DialogHeader>
                {guest && (
                    <GuestEditForm
                        key={guest.id}
                        eventId={eventId}
                        guest={guest}
                        onClose={onClose}
                    />
                )}
            </DialogContent>
        </Dialog>
    );
}

type GuestEditFormData = {
    name: string;
    phone: string;
    status: GuestStatus;
    companions_count: string;
};

function GuestEditForm({
    eventId,
    guest,
    onClose,
}: {
    eventId: number;
    guest: Guest;
    onClose: () => void;
}) {
    const form = useForm<GuestEditFormData>({
        name: guest.name,
        phone: guest.phone,
        status: guest.status,
        companions_count: String(guest.companionsCount),
    });

    const submit = (submitEvent: React.FormEvent<HTMLFormElement>) => {
        submitEvent.preventDefault();
        form.submit(
            EventGuestController.update({
                event: eventId,
                guest: guest.id,
            }),
            {
                preserveScroll: true,
                onSuccess: () => {
                    toast.success('Convidado atualizado.');
                    onClose();
                },
            },
        );
    };

    return (
        <form onSubmit={submit} className="grid gap-4 sm:grid-cols-2">
            <div className="grid gap-2 sm:col-span-2">
                <Label htmlFor={`name-${guest.id}`}>Nome</Label>
                <Input
                    id={`name-${guest.id}`}
                    value={form.data.name}
                    onChange={(inputEvent) =>
                        form.setData('name', inputEvent.target.value)
                    }
                    required
                    autoFocus
                />
                <InputError message={form.errors.name} />
            </div>
            <div className="grid gap-2">
                <Label htmlFor={`phone-${guest.id}`}>Telefone</Label>
                <Input
                    id={`phone-${guest.id}`}
                    value={form.data.phone}
                    onChange={(inputEvent) =>
                        form.setData('phone', inputEvent.target.value)
                    }
                    required
                />
                <InputError message={form.errors.phone} />
            </div>
            <div className="grid gap-2">
                <Label htmlFor={`status-${guest.id}`}>Presença</Label>
                <select
                    id={`status-${guest.id}`}
                    value={form.data.status}
                    onChange={(inputEvent) =>
                        form.setData(
                            'status',
                            inputEvent.target.value as GuestStatus,
                        )
                    }
                    className="border-input focus-visible:border-ring focus-visible:ring-ring/35 bg-card h-11 rounded-xl border px-3 text-sm shadow-xs outline-none focus-visible:ring-3"
                >
                    <option value="unanswered">Sem resposta</option>
                    <option value="confirmed">Confirmado</option>
                    <option value="declined">Não irá</option>
                </select>
                <InputError message={form.errors.status} />
            </div>
            <div className="grid gap-2">
                <Label htmlFor={`companions-${guest.id}`}>Acompanhantes</Label>
                <Input
                    id={`companions-${guest.id}`}
                    type="number"
                    min={0}
                    max={100}
                    value={form.data.companions_count}
                    onChange={(inputEvent) =>
                        form.setData(
                            'companions_count',
                            inputEvent.target.value,
                        )
                    }
                    required
                />
                <InputError message={form.errors.companions_count} />
            </div>
            <DialogFooter className="sm:col-span-2">
                <Button
                    type="button"
                    variant="outline"
                    disabled={form.processing}
                    onClick={onClose}
                >
                    Cancelar
                </Button>
                <Button type="submit" disabled={form.processing}>
                    {form.processing ? 'Salvando...' : 'Salvar correção'}
                </Button>
            </DialogFooter>
        </form>
    );
}

EventGuests.layout = {
    breadcrumbs: [{ title: 'Eventos', href: eventsIndex() }],
};
