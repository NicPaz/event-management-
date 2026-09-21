import { Head, Link } from '@inertiajs/react';
import { CalendarDays } from 'lucide-react';
import { EmptyState } from '@/components/celebre/empty-state';
import { PageHeader } from '@/components/celebre/page-header';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import { create, index, show } from '@/routes/events';

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
