import { Form, Head, Link } from '@inertiajs/react';
import ClosedEventController from '@/actions/App/Http/Controllers/ClosedEventController';
import EventAppearanceController from '@/actions/App/Http/Controllers/EventAppearanceController';
import GiftController from '@/actions/App/Http/Controllers/GiftController';
import EventController from '@/actions/App/Http/Controllers/EventController';
import PublicEventController from '@/actions/App/Http/Controllers/PublicEventController';
import PublishedEventController from '@/actions/App/Http/Controllers/PublishedEventController';
import EventForm from '@/components/event-form';
import { EventCreationProgress } from '@/components/event-creation-progress';
import { PageHeader } from '@/components/celebre/page-header';
import InputError from '@/components/input-error';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import { index } from '@/routes/events';
import { show as publicEvent } from '@/routes/public/events';
import type { EventDetails, EventTypeOption } from '@/types';

const statusLabels = {
    draft: 'Rascunho',
    published: 'Publicado',
    closed: 'Encerrado',
};

export default function EditEvent({
    event,
    eventTypes,
    creationFlow = false,
}: {
    event: EventDetails;
    eventTypes: EventTypeOption[];
    creationFlow?: boolean;
}) {
    if (creationFlow) {
        return (
            <>
                <Head title={`Informações — ${event.title}`} />
                <div className="flex flex-1 flex-col gap-6 p-4 md:p-6">
                    <PageHeader
                        eyebrow="Criação do evento"
                        title="Informações do evento"
                        description="Revise os dados salvos e continue a criação sem gerar outro evento."
                        actions={
                            <Button asChild variant="ghost">
                                <Link href={index()}>Sair do fluxo</Link>
                            </Button>
                        }
                    />

                    <EventCreationProgress currentStep={1} />

                    <Card>
                        <CardContent className="pt-6">
                            <EventForm
                                action={EventController.update(event.id, {
                                    query: { creation: 1 },
                                })}
                                event={event}
                                eventTypes={eventTypes}
                                submitLabel="Continuar"
                            />
                        </CardContent>
                    </Card>
                </div>
            </>
        );
    }

    return (
        <>
            <Head title={`Editar ${event.title}`} />
            <div className="flex flex-1 flex-col gap-6 p-4 md:p-6">
                <PageHeader
                    eyebrow="Configuração"
                    title={event.title}
                    description="Gerencie informações e o estado de publicação."
                    actions={
                        <Badge variant="outline">
                            {statusLabels[event.status]}
                        </Badge>
                    }
                />

                <Card>
                    <CardHeader>
                        <CardTitle>Informações</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <EventForm
                            action={EventController.update(event.id)}
                            event={event}
                            eventTypes={eventTypes}
                            submitLabel="Salvar alterações"
                        />
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>Lista de presentes</CardTitle>
                        <CardDescription>
                            Cadastre itens, quantidades, imagens e links
                            externos.
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <Button asChild variant="outline">
                            <Link href={GiftController.index(event.id)}>
                                Gerenciar presentes
                            </Link>
                        </Button>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>Aparência e seções</CardTitle>
                        <CardDescription>
                            Configure banner, cores, ordem das seções e paleta
                            da casa.
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <Button asChild variant="outline">
                            <Link
                                href={EventAppearanceController.edit(event.id)}
                            >
                                Personalizar convite
                            </Link>
                        </Button>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>Publicação</CardTitle>
                        <CardDescription>
                            A prévia é privada. O link público só funciona
                            depois da publicação.
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="flex flex-wrap gap-3">
                        <Button asChild variant="outline">
                            <Link
                                href={PublicEventController.preview(event.id)}
                                target="_blank"
                            >
                                Abrir prévia
                            </Link>
                        </Button>

                        {event.status === 'draft' && (
                            <Form
                                action={PublishedEventController.store(
                                    event.id,
                                )}
                            >
                                {({ errors, processing }) => (
                                    <div className="flex flex-col gap-2">
                                        <Button disabled={processing}>
                                            Publicar
                                        </Button>
                                        <InputError
                                            message={
                                                errors.starts_at ??
                                                errors.venue_name ??
                                                errors.address ??
                                                errors.suspended_at
                                            }
                                        />
                                    </div>
                                )}
                            </Form>
                        )}

                        {event.status === 'published' && (
                            <>
                                {event.slug && (
                                    <Button asChild>
                                        <Link
                                            href={publicEvent(event.slug)}
                                            target="_blank"
                                        >
                                            Abrir página pública
                                        </Link>
                                    </Button>
                                )}
                                <Form
                                    action={ClosedEventController.store(
                                        event.id,
                                    )}
                                >
                                    {({ processing }) => (
                                        <Button
                                            variant="outline"
                                            disabled={processing}
                                        >
                                            Encerrar evento
                                        </Button>
                                    )}
                                </Form>
                            </>
                        )}

                        {event.status === 'closed' && (
                            <Form
                                action={ClosedEventController.destroy(event.id)}
                            >
                                {({ processing }) => (
                                    <Button disabled={processing}>
                                        Reabrir evento
                                    </Button>
                                )}
                            </Form>
                        )}
                    </CardContent>
                </Card>

                <Card className="border-destructive/30">
                    <CardHeader>
                        <CardTitle>Arquivar evento</CardTitle>
                        <CardDescription>
                            O histórico será preservado por exclusão lógica.
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <Form action={EventController.destroy(event.id)}>
                            {({ processing }) => (
                                <Button
                                    variant="destructive"
                                    disabled={processing}
                                >
                                    Arquivar
                                </Button>
                            )}
                        </Form>
                    </CardContent>
                </Card>
            </div>
        </>
    );
}

EditEvent.layout = {
    breadcrumbs: [{ title: 'Meus eventos', href: index() }],
};
