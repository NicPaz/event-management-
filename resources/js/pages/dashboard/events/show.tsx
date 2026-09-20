import { Head } from '@inertiajs/react';
import { Badge } from '@/components/ui/badge';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import { index } from '@/routes/events';

type EventDetails = {
    id: number;
    title: string;
    type: string;
    status: 'draft' | 'published' | 'closed';
    slug: string | null;
    startsAt: string | null;
    timezone: string;
};

const statusLabels: Record<EventDetails['status'], string> = {
    draft: 'Rascunho',
    published: 'Publicado',
    closed: 'Encerrado',
};

export default function EventShow({ event }: { event: EventDetails }) {
    return (
        <>
            <Head title={event.title} />

            <div className="flex flex-1 flex-col gap-6 p-4 md:p-6">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <div className="flex flex-col gap-1">
                        <h1 className="text-2xl font-semibold tracking-tight">
                            {event.title}
                        </h1>
                        <p className="text-muted-foreground text-sm">
                            Estrutura inicial protegida pela política do evento.
                        </p>
                    </div>
                    <Badge variant="outline">
                        {statusLabels[event.status]}
                    </Badge>
                </div>

                <Card>
                    <CardHeader>
                        <CardTitle>Informações básicas</CardTitle>
                        <CardDescription>
                            Os formulários de edição e publicação entram na
                            Etapa 2.
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <dl className="grid gap-4 text-sm sm:grid-cols-2">
                            <div className="flex flex-col gap-1">
                                <dt className="text-muted-foreground">Data</dt>
                                <dd className="font-medium">
                                    {event.startsAt
                                        ? new Intl.DateTimeFormat('pt-BR', {
                                              dateStyle: 'long',
                                              timeStyle: 'short',
                                              timeZone: event.timezone,
                                          }).format(new Date(event.startsAt))
                                        : 'Não definida'}
                                </dd>
                            </div>
                            <div className="flex flex-col gap-1">
                                <dt className="text-muted-foreground">
                                    Fuso horário
                                </dt>
                                <dd className="font-medium">
                                    {event.timezone}
                                </dd>
                            </div>
                        </dl>
                    </CardContent>
                </Card>
            </div>
        </>
    );
}

EventShow.layout = {
    breadcrumbs: [{ title: 'Meus eventos', href: index() }],
};
