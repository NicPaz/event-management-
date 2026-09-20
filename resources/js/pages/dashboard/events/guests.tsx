import { Form, Head, Link, router } from '@inertiajs/react';
import { Gift, Search, Users } from 'lucide-react';
import EventGuestController from '@/actions/App/Http/Controllers/EventGuestController';
import InputError from '@/components/input-error';
import { Pagination, type PaginationLink } from '@/components/pagination';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
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
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                        <h1 className="text-2xl font-semibold">Convidados</h1>
                        <p className="text-muted-foreground text-sm">
                            {event?.title ??
                                'Selecione um evento para consultar convidados e reservas.'}
                        </p>
                    </div>
                    {event && (
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
                    )}
                </div>

                {standalone && events.length > 0 && (
                    <Card>
                        <CardContent className="grid gap-2 pt-6">
                            <Label htmlFor="selected-event">
                                Evento selecionado
                            </Label>
                            <select
                                id="selected-event"
                                value={event?.id ?? ''}
                                onChange={(inputEvent) => {
                                    const value = inputEvent.target.value;
                                    router.get(
                                        guestsIndex({
                                            query: value
                                                ? { event: Number(value) }
                                                : {},
                                        }).url,
                                    );
                                }}
                                className="border-input h-11 rounded-md border bg-transparent px-3 font-medium"
                            >
                                {events.length > 1 && (
                                    <option value="">
                                        Selecione um evento
                                    </option>
                                )}
                                {events.map((option) => (
                                    <option key={option.id} value={option.id}>
                                        {option.title}
                                    </option>
                                ))}
                            </select>
                        </CardContent>
                    </Card>
                )}

                {standalone && events.length === 0 && (
                    <div className="grid justify-items-center gap-4 rounded-xl border border-dashed p-10 text-center">
                        <p className="text-muted-foreground">
                            Você ainda não possui eventos.
                        </p>
                        <Button asChild>
                            <Link href={create()}>
                                Criar meu primeiro evento
                            </Link>
                        </Button>
                    </div>
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

                        <div className="grid gap-4 xl:grid-cols-2">
                            {guests.data.map((guest) => (
                                <GuestCard
                                    key={guest.id}
                                    eventId={event.id}
                                    guest={guest}
                                />
                            ))}
                        </div>
                        {guests.data.length === 0 && (
                            <div className="text-muted-foreground flex flex-col items-center gap-3 rounded-xl border border-dashed p-10 text-center">
                                <Users className="size-8" />
                                <p>
                                    {filters.search
                                        ? 'Nenhum convidado encontrado para esta busca.'
                                        : 'Nenhum convidado identificado ainda.'}
                                </p>
                            </div>
                        )}
                        <Pagination links={guests.links} />
                    </>
                )}
            </div>
        </>
    );
}

function GuestCard({ eventId, guest }: { eventId: number; guest: Guest }) {
    return (
        <Card>
            <CardHeader className="flex-row items-start justify-between gap-3">
                <div className="min-w-0">
                    <CardTitle className="truncate text-lg">
                        {guest.name}
                    </CardTitle>
                    <p className="text-muted-foreground text-sm">
                        {guest.phone}
                    </p>
                </div>
                <Badge variant="outline">{statusLabels[guest.status]}</Badge>
            </CardHeader>
            <CardContent className="grid gap-5">
                <div>
                    <p className="mb-2 flex items-center gap-2 text-sm font-medium">
                        <Gift className="size-4" /> Reservas ativas
                    </p>
                    {guest.reservations.length > 0 ? (
                        <div className="flex flex-wrap gap-2">
                            {guest.reservations.map((reservation) => (
                                <Badge
                                    key={reservation.giftName}
                                    variant="secondary"
                                >
                                    {reservation.giftName} ×{' '}
                                    {reservation.quantity}
                                </Badge>
                            ))}
                        </div>
                    ) : (
                        <p className="text-muted-foreground text-sm">
                            Nenhum presente reservado.
                        </p>
                    )}
                </div>
                <Form
                    action={EventGuestController.update({
                        event: eventId,
                        guest: guest.id,
                    })}
                    errorBag={`guest-${guest.id}`}
                    options={{ preserveScroll: true }}
                >
                    {({ errors, processing }) => (
                        <div className="grid gap-4 sm:grid-cols-2">
                            <div className="grid gap-2 sm:col-span-2">
                                <Label htmlFor={`name-${guest.id}`}>Nome</Label>
                                <Input
                                    id={`name-${guest.id}`}
                                    name="name"
                                    defaultValue={guest.name}
                                    required
                                />
                                <InputError message={errors.name} />
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor={`phone-${guest.id}`}>
                                    Telefone
                                </Label>
                                <Input
                                    id={`phone-${guest.id}`}
                                    name="phone"
                                    defaultValue={guest.phone}
                                    required
                                />
                                <InputError message={errors.phone} />
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor={`status-${guest.id}`}>
                                    Presença
                                </Label>
                                <select
                                    id={`status-${guest.id}`}
                                    name="status"
                                    defaultValue={guest.status}
                                    className="border-input h-9 rounded-md border bg-transparent px-3 text-sm"
                                >
                                    <option value="unanswered">
                                        Sem resposta
                                    </option>
                                    <option value="confirmed">
                                        Confirmado
                                    </option>
                                    <option value="declined">Não irá</option>
                                </select>
                                <InputError message={errors.status} />
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor={`companions-${guest.id}`}>
                                    Acompanhantes
                                </Label>
                                <Input
                                    id={`companions-${guest.id}`}
                                    name="companions_count"
                                    type="number"
                                    min={0}
                                    max={100}
                                    defaultValue={guest.companionsCount}
                                    required
                                />
                                <InputError message={errors.companions_count} />
                            </div>
                            <div className="self-end">
                                <Button disabled={processing}>
                                    {processing
                                        ? 'Salvando...'
                                        : 'Salvar correção'}
                                </Button>
                            </div>
                        </div>
                    )}
                </Form>
            </CardContent>
        </Card>
    );
}

EventGuests.layout = {
    breadcrumbs: [{ title: 'Eventos', href: eventsIndex() }],
};
