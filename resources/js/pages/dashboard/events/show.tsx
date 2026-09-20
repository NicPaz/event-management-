import { Head, Link } from '@inertiajs/react';
import { Check, Copy, Palette, Users } from 'lucide-react';
import EventAppearanceController from '@/actions/App/Http/Controllers/EventAppearanceController';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import { useClipboard } from '@/hooks/use-clipboard';
import { edit, index } from '@/routes/events';
import { index as guestsIndex } from '@/routes/events/guests';

type EventDetails = {
    id: number;
    title: string;
    type: string;
    status: 'draft' | 'published' | 'closed';
    slug: string | null;
    publicUrl: string | null;
    startsAt: string | null;
    timezone: string;
};

const statusLabels: Record<EventDetails['status'], string> = {
    draft: 'Rascunho',
    published: 'Publicado',
    closed: 'Encerrado',
};

export default function EventShow({
    event,
    attendanceMetrics,
}: {
    event: EventDetails;
    attendanceMetrics: {
        confirmedGuests: number;
        companions: number;
        expectedTotal: number;
    };
}) {
    const [copiedText, copy] = useClipboard();
    const linkWasCopied =
        event.publicUrl !== null && copiedText === event.publicUrl;

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
                            Acompanhe o evento, compartilhe o convite e
                            personalize a página pública.
                        </p>
                    </div>
                    <div className="flex flex-wrap items-center gap-2">
                        <Badge variant="outline">
                            {statusLabels[event.status]}
                        </Badge>
                        <Button
                            type="button"
                            variant="outline"
                            disabled={event.publicUrl === null}
                            title={
                                event.publicUrl === null
                                    ? 'Publique o evento para liberar o link'
                                    : undefined
                            }
                            onClick={() => {
                                if (event.publicUrl !== null) {
                                    void copy(event.publicUrl);
                                }
                            }}
                        >
                            {linkWasCopied ? <Check /> : <Copy />}
                            {linkWasCopied ? 'Link copiado' : 'Copiar link'}
                        </Button>
                        <Button asChild variant="outline">
                            <Link
                                href={EventAppearanceController.edit(event.id)}
                            >
                                <Palette /> Personalizar
                            </Link>
                        </Button>
                        <Button asChild variant="outline">
                            <Link href={guestsIndex(event.id)}>
                                <Users /> Convidados e reservas
                            </Link>
                        </Button>
                        <Button asChild>
                            <Link href={edit(event.id)}>Editar</Link>
                        </Button>
                    </div>
                </div>

                <Card>
                    <CardHeader>
                        <CardTitle>Informações básicas</CardTitle>
                        <CardDescription>
                            Revise os dados e use a edição para publicar.
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

                <div className="grid gap-4 sm:grid-cols-3">
                    <Card>
                        <CardHeader>
                            <CardDescription>Confirmados</CardDescription>
                            <CardTitle className="text-3xl">
                                {attendanceMetrics.confirmedGuests}
                            </CardTitle>
                        </CardHeader>
                    </Card>
                    <Card>
                        <CardHeader>
                            <CardDescription>Acompanhantes</CardDescription>
                            <CardTitle className="text-3xl">
                                {attendanceMetrics.companions}
                            </CardTitle>
                        </CardHeader>
                    </Card>
                    <Card>
                        <CardHeader>
                            <CardDescription>Total esperado</CardDescription>
                            <CardTitle className="text-3xl">
                                {attendanceMetrics.expectedTotal}
                            </CardTitle>
                        </CardHeader>
                    </Card>
                </div>
            </div>
        </>
    );
}

EventShow.layout = {
    breadcrumbs: [{ title: 'Meus eventos', href: index() }],
};
