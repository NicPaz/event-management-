import { Form, Head, Link } from '@inertiajs/react';
import { CalendarDays, Search } from 'lucide-react';
import SuspendedEventController from '@/actions/App/Http/Controllers/Admin/SuspendedEventController';
import { EmptyState } from '@/components/celebre/empty-state';
import { PageHeader } from '@/components/celebre/page-header';
import { Pagination, type PaginationLink } from '@/components/pagination';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { dashboard as adminDashboard } from '@/routes/admin';
import { index as adminEventsIndex } from '@/routes/admin/events';

type AdminEvent = {
    id: number;
    title: string;
    status: 'draft' | 'published' | 'closed';
    suspended: boolean;
    organizer: { name: string; email: string; suspended: boolean };
    createdAt: string | null;
};

const statusLabels: Record<AdminEvent['status'], string> = {
    draft: 'Rascunho',
    published: 'Publicado',
    closed: 'Encerrado',
};

export default function AdminEvents({
    events,
    filters,
}: {
    events: { data: AdminEvent[]; links: PaginationLink[]; total: number };
    filters: { search: string };
}) {
    return (
        <>
            <Head title="Eventos da plataforma" />
            <div className="flex flex-1 flex-col gap-6 p-4 md:p-6">
                <PageHeader
                    eyebrow="Administração"
                    title="Eventos da plataforma"
                    description="Consulte eventos e suspenda páginas públicas quando necessário."
                />

                <Card>
                    <CardContent className="pt-6">
                        <Form
                            action={adminEventsIndex()}
                            options={{ preserveState: true, replace: true }}
                            className="flex flex-col gap-3 sm:flex-row"
                        >
                            <div className="relative flex-1">
                                <Search className="text-muted-foreground absolute top-1/2 left-3 size-4 -translate-y-1/2" />
                                <Input
                                    name="search"
                                    defaultValue={filters.search}
                                    placeholder="Buscar evento ou organizador"
                                    className="pl-9"
                                />
                            </div>
                            <Button>Buscar</Button>
                            {filters.search && (
                                <Button asChild variant="outline">
                                    <Link href={adminEventsIndex()}>
                                        Limpar
                                    </Link>
                                </Button>
                            )}
                        </Form>
                    </CardContent>
                </Card>

                <div className="grid gap-4 lg:grid-cols-2">
                    {events.data.map((event) => (
                        <Card key={event.id} className="min-w-0">
                            <CardHeader className="flex-col items-start justify-between gap-3 sm:flex-row">
                                <div className="min-w-0">
                                    <CardTitle className="text-lg break-words">
                                        {event.title}
                                    </CardTitle>
                                    <p className="text-muted-foreground text-sm break-words">
                                        {event.organizer.name} ·{' '}
                                        {event.organizer.email}
                                    </p>
                                </div>
                                <div className="flex shrink-0 flex-col items-start gap-2 sm:items-end">
                                    <Badge variant="outline">
                                        {statusLabels[event.status]}
                                    </Badge>
                                    {(event.suspended ||
                                        event.organizer.suspended) && (
                                        <Badge variant="destructive">
                                            {event.suspended
                                                ? 'Evento suspenso'
                                                : 'Conta suspensa'}
                                        </Badge>
                                    )}
                                </div>
                            </CardHeader>
                            <CardContent className="flex justify-start sm:justify-end">
                                <Form
                                    action={
                                        event.suspended
                                            ? SuspendedEventController.destroy(
                                                  event.id,
                                              )
                                            : SuspendedEventController.store(
                                                  event.id,
                                              )
                                    }
                                    options={{ preserveScroll: true }}
                                >
                                    {({ processing }) => (
                                        <Button
                                            className="w-full sm:w-auto"
                                            variant={
                                                event.suspended
                                                    ? 'outline'
                                                    : 'destructive'
                                            }
                                            disabled={processing}
                                        >
                                            {event.suspended
                                                ? 'Reativar evento'
                                                : 'Suspender evento'}
                                        </Button>
                                    )}
                                </Form>
                            </CardContent>
                        </Card>
                    ))}
                </div>

                {events.data.length === 0 && (
                    <EmptyState
                        icon={CalendarDays}
                        title="Nenhum evento encontrado"
                        description="Ajuste a busca para encontrar outro evento."
                    />
                )}

                <Pagination links={events.links} />
            </div>
        </>
    );
}

AdminEvents.layout = {
    breadcrumbs: [
        { title: 'Administração', href: adminDashboard() },
        { title: 'Eventos', href: adminEventsIndex() },
    ],
};
