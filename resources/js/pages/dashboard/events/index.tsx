import { Head, Link } from '@inertiajs/react';
import { CalendarDays } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import { index, show } from '@/routes/events';

type EventSummary = {
    id: number;
    title: string;
    type: string;
    status: 'draft' | 'published' | 'closed';
    slug: string | null;
    startsAt: string | null;
    timezone: string;
};

const statusLabels: Record<EventSummary['status'], string> = {
    draft: 'Rascunho',
    published: 'Publicado',
    closed: 'Encerrado',
};

export default function EventsIndex({ events }: { events: EventSummary[] }) {
    return (
        <>
            <Head title="Meus eventos" />

            <div className="flex flex-1 flex-col gap-6 p-4 md:p-6">
                <div className="flex flex-col gap-1">
                    <h1 className="text-2xl font-semibold tracking-tight">
                        Meus eventos
                    </h1>
                    <p className="text-muted-foreground text-sm">
                        Cada conta acessa somente os eventos que organiza.
                    </p>
                </div>

                {events.length === 0 ? (
                    <Card className="border-dashed">
                        <CardContent className="flex min-h-56 flex-col items-center justify-center gap-3 text-center">
                            <CalendarDays className="text-muted-foreground size-10" />
                            <div className="flex flex-col gap-1">
                                <p className="font-medium">
                                    Você ainda não criou eventos
                                </p>
                                <p className="text-muted-foreground text-sm">
                                    O cadastro de eventos será habilitado no
                                    próximo incremento.
                                </p>
                            </div>
                        </CardContent>
                    </Card>
                ) : (
                    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                        {events.map((event) => (
                            <Link key={event.id} href={show(event.id)} prefetch>
                                <Card className="hover:border-primary/40 h-full transition-colors">
                                    <CardHeader>
                                        <div className="flex items-start justify-between gap-3">
                                            <CardTitle>{event.title}</CardTitle>
                                            <Badge variant="outline">
                                                {statusLabels[event.status]}
                                            </Badge>
                                        </div>
                                        <CardDescription>
                                            {event.startsAt
                                                ? new Intl.DateTimeFormat(
                                                      'pt-BR',
                                                      {
                                                          dateStyle: 'long',
                                                          timeStyle: 'short',
                                                          timeZone:
                                                              event.timezone,
                                                      },
                                                  ).format(
                                                      new Date(event.startsAt),
                                                  )
                                                : 'Data ainda não definida'}
                                        </CardDescription>
                                    </CardHeader>
                                </Card>
                            </Link>
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
