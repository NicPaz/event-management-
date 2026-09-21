import { useRef } from 'react';
import { Head, Link, useForm } from '@inertiajs/react';
import { ArrowLeft, Eye, LockKeyhole, Send } from 'lucide-react';
import EventAppearanceController from '@/actions/App/Http/Controllers/EventAppearanceController';
import EventCreationController from '@/actions/App/Http/Controllers/EventCreationController';
import PublicEventController from '@/actions/App/Http/Controllers/PublicEventController';
import { EventCreationProgress } from '@/components/event-creation-progress';
import InputError from '@/components/input-error';
import { PageHeader } from '@/components/celebre/page-header';
import { Button } from '@/components/ui/button';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import { index } from '@/routes/events';
import type { EventInvitation } from '@/types';

const typeLabels: Record<string, string> = {
    housewarming: 'Chá de casa nova',
    kitchen_tea: 'Chá de panela',
    wedding: 'Casamento',
    birthday: 'Aniversário',
    other: 'Outro evento',
};

export default function EventFinalization({
    event,
}: {
    event: EventInvitation;
}) {
    const submitting = useRef(false);
    const form = useForm<{ decision: 'publish' | 'private' }>({
        decision: 'private',
    });

    const finish = (decision: 'publish' | 'private') => {
        if (submitting.current || form.processing) {
            return;
        }

        submitting.current = true;
        form.transform(() => ({ decision }));
        form.post(EventCreationController.store(event.id).url, {
            onFinish: () => {
                submitting.current = false;
            },
        });
    };

    const formattedDate = event.startsAt
        ? new Intl.DateTimeFormat('pt-BR', {
              dateStyle: 'long',
              timeStyle: 'short',
              timeZone: event.timezone,
          }).format(new Date(event.startsAt))
        : 'Não definida';

    return (
        <>
            <Head title={`Finalizar — ${event.title}`} />
            <div className="flex flex-1 flex-col gap-6 p-4 md:p-6">
                <PageHeader
                    eyebrow="Criação do evento"
                    title="Finalização"
                    description="Revise o evento e escolha quando o convite ficará disponível para os convidados."
                />

                <EventCreationProgress currentStep={4} />

                <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(20rem,0.8fr)]">
                    <Card>
                        <CardHeader>
                            <CardTitle>Resumo do evento</CardTitle>
                            <CardDescription>
                                Estes dados já estão salvos no rascunho.
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <dl className="grid gap-5 text-sm sm:grid-cols-2">
                                <Summary label="Nome" value={event.title} />
                                <Summary
                                    label="Tipo"
                                    value={typeLabels[event.type] ?? event.type}
                                />
                                <Summary
                                    label="Data e horário"
                                    value={formattedDate}
                                />
                                <Summary
                                    label="Presentes"
                                    value={`${event.gifts.length} cadastrado(s)`}
                                />
                                <Summary
                                    label="Nome do local"
                                    value={event.venueName ?? 'Não informado'}
                                />
                                <Summary
                                    label="Endereço"
                                    value={event.address ?? 'Não informado'}
                                />
                            </dl>

                            <div className="mt-6 flex flex-wrap gap-3">
                                <Button asChild variant="outline">
                                    <Link
                                        href={EventAppearanceController.edit(
                                            event.id,
                                            { query: { creation: 1 } },
                                        )}
                                    >
                                        <ArrowLeft /> Voltar
                                    </Link>
                                </Button>
                                <Button asChild variant="outline">
                                    <Link
                                        href={PublicEventController.preview(
                                            event.id,
                                        )}
                                        target="_blank"
                                    >
                                        <Eye /> Ver prévia
                                    </Link>
                                </Button>
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle>Como deseja concluir?</CardTitle>
                            <CardDescription>
                                A publicação só acontece depois da sua escolha
                                explícita e da confirmação do servidor.
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="grid gap-4">
                            <div className="rounded-xl border p-4">
                                <div className="flex items-start gap-3">
                                    <Send className="text-primary mt-0.5 size-5" />
                                    <div>
                                        <h2 className="font-semibold">
                                            Publicar agora
                                        </h2>
                                        <p className="text-muted-foreground mt-1 text-sm">
                                            Disponibiliza imediatamente o
                                            convite na página pública.
                                        </p>
                                    </div>
                                </div>
                                <Button
                                    type="button"
                                    className="mt-4 w-full"
                                    disabled={form.processing}
                                    onClick={() => finish('publish')}
                                >
                                    {form.processing
                                        ? 'Finalizando...'
                                        : 'Publicar agora'}
                                </Button>
                            </div>

                            <div className="rounded-xl border p-4">
                                <div className="flex items-start gap-3">
                                    <LockKeyhole className="text-primary mt-0.5 size-5" />
                                    <div>
                                        <h2 className="font-semibold">
                                            Manter privado
                                        </h2>
                                        <p className="text-muted-foreground mt-1 text-sm">
                                            Mantém o rascunho acessível somente
                                            na prévia do organizador. Você
                                            poderá publicá-lo depois pelo
                                            painel.
                                        </p>
                                    </div>
                                </div>
                                <Button
                                    type="button"
                                    variant="outline"
                                    className="mt-4 w-full"
                                    disabled={form.processing}
                                    onClick={() => finish('private')}
                                >
                                    {form.processing
                                        ? 'Finalizando...'
                                        : 'Manter privado'}
                                </Button>
                            </div>

                            <InputError message={form.errors.decision} />
                        </CardContent>
                    </Card>
                </div>
            </div>
        </>
    );
}

function Summary({ label, value }: { label: string; value: string }) {
    return (
        <div className="grid gap-1">
            <dt className="text-muted-foreground">{label}</dt>
            <dd className="font-medium">{value}</dd>
        </div>
    );
}

EventFinalization.layout = {
    breadcrumbs: [{ title: 'Meus eventos', href: index() }],
};
