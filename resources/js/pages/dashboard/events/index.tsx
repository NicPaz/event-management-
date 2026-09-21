import { Head, Link } from '@inertiajs/react';
import { CalendarDays, Eye, Palette, Pencil, Settings } from 'lucide-react';
import EventAppearanceController from '@/actions/App/Http/Controllers/EventAppearanceController';
import { preview } from '@/actions/App/Http/Controllers/PublicEventController';
import { EmptyState } from '@/components/celebre/empty-state';
import { PageHeader } from '@/components/celebre/page-header';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { create, edit, index, show } from '@/routes/events';

type EventSummary = {
    id: number;
    title: string;
    type: string;
    status: 'draft' | 'published' | 'closed';
    slug: string | null;
    startsAt: string | null;
    timezone: string;
    bannerUrl: string | null;
};

const statusLabels: Record<EventSummary['status'], string> = {
    draft: 'Rascunho',
    published: 'Publicado',
    closed: 'Encerrado',
};

const typeLabels: Record<string, string> = {
    housewarming: 'Chá de casa nova',
    kitchen_tea: 'Chá de panela',
    wedding: 'Casamento',
    birthday: 'Aniversário',
    other: 'Outro evento',
};

export default function EventsIndex({ events }: { events: EventSummary[] }) {
    return (
        <>
            <Head title="Meus eventos" />

            <div className="flex flex-1 flex-col gap-6 p-4 md:p-6">
                <PageHeader
                    eyebrow="Organização"
                    title="Meus eventos"
                    description="Crie, publique e acompanhe todas as suas celebrações."
                    actions={
                        <Button asChild>
                            <Link href={create()}>Criar evento</Link>
                        </Button>
                    }
                />

                {events.length === 0 ? (
                    <EmptyState
                        icon={CalendarDays}
                        title="Você ainda não criou eventos"
                        description="Crie seu primeiro convite e personalize cada detalhe da celebração."
                        action={
                            <Button asChild>
                                <Link href={create()}>
                                    Criar meu primeiro evento
                                </Link>
                            </Button>
                        }
                    />
                ) : (
                    <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
                        {events.map((event) => (
                            <EventCard key={event.id} event={event} />
                        ))}
                    </div>
                )}
            </div>
        </>
    );
}

EventsIndex.layout = {
    breadcrumbs: [{ title: 'Meus eventos', href: index() }],
};

function EventCard({ event }: { event: EventSummary }) {
    const formattedDate = event.startsAt
        ? new Intl.DateTimeFormat('pt-BR', {
              dateStyle: 'medium',
              timeStyle: 'short',
              timeZone: event.timezone,
          }).format(new Date(event.startsAt))
        : 'Data ainda não definida';

    return (
        <article className="group relative isolate min-w-0 pb-2">
            {event.bannerUrl && (
                <img
                    src={event.bannerUrl}
                    alt=""
                    aria-hidden="true"
                    className="pointer-events-none absolute inset-x-4 top-5 -z-10 h-[calc(100%-1.25rem)] w-[calc(100%-2rem)] rounded-[20px] object-cover opacity-30 blur-2xl transition-opacity duration-300 group-hover:opacity-45 motion-reduce:transition-none"
                />
            )}
            <div className="bg-primary relative flex min-h-80 overflow-hidden rounded-[20px] border shadow-sm transition duration-300 group-hover:-translate-y-1 group-hover:shadow-lg motion-reduce:transform-none motion-reduce:transition-none">
                {event.bannerUrl ? (
                    <img
                        src={event.bannerUrl}
                        alt=""
                        className="absolute inset-0 size-full object-cover"
                    />
                ) : (
                    <div
                        aria-hidden="true"
                        className="bg-primary absolute inset-0 overflow-hidden"
                    >
                        <div className="bg-brand-orange/35 absolute -top-12 -right-10 size-48 rounded-full" />
                        <div className="bg-brand-yellow/35 absolute -bottom-16 -left-12 size-56 rounded-full" />
                        <img
                            src="/images/brand/celebre-simbolo.png"
                            alt=""
                            className="absolute top-1/2 left-1/2 w-28 -translate-x-1/2 -translate-y-1/2 opacity-25"
                        />
                    </div>
                )}
                <div className="absolute inset-0 bg-black/50" />

                <div className="relative z-10 flex min-w-0 flex-1 flex-col justify-between gap-8 p-5 text-white">
                    <div className="flex flex-wrap items-start justify-between gap-2">
                        <div className="flex flex-wrap gap-2">
                            <span className="rounded-full border border-white/25 bg-black/25 px-3 py-1 text-xs font-medium backdrop-blur-sm">
                                {typeLabels[event.type] ?? event.type}
                            </span>
                            <Badge className="text-foreground border-white/25 bg-white/90 hover:bg-white">
                                {statusLabels[event.status]}
                            </Badge>
                        </div>
                        <span className="rounded-full bg-black/30 px-3 py-1 text-xs font-medium backdrop-blur-sm">
                            {formattedDate}
                        </span>
                    </div>

                    <div className="grid min-w-0 gap-5">
                        <h2 className="font-display text-3xl leading-tight text-balance drop-shadow-sm">
                            {event.title}
                        </h2>
                        <div className="grid grid-cols-2 gap-2">
                            <Button
                                asChild
                                size="sm"
                                className="text-primary bg-white hover:bg-white/90"
                            >
                                <Link href={show(event.id)} prefetch>
                                    <Settings /> Gerenciar
                                </Link>
                            </Button>
                            <Button
                                asChild
                                size="sm"
                                variant="secondary"
                                className="bg-white/15 text-white hover:bg-white/25"
                            >
                                <Link href={edit(event.id)}>
                                    <Pencil /> Editar
                                </Link>
                            </Button>
                            <Button
                                asChild
                                size="sm"
                                variant="secondary"
                                className="bg-white/15 text-white hover:bg-white/25"
                            >
                                <Link
                                    href={EventAppearanceController.edit(
                                        event.id,
                                    )}
                                >
                                    <Palette /> Personalizar
                                </Link>
                            </Button>
                            <Button
                                asChild
                                size="sm"
                                variant="secondary"
                                className="bg-white/15 text-white hover:bg-white/25"
                            >
                                <Link href={preview(event.id)}>
                                    <Eye /> Ver convite
                                </Link>
                            </Button>
                        </div>
                    </div>
                </div>
            </div>
        </article>
    );
}
