import { Head } from '@inertiajs/react';
import EventController from '@/actions/App/Http/Controllers/EventController';
import EventForm from '@/components/event-form';
import { EventCreationProgress } from '@/components/event-creation-progress';
import { PageHeader } from '@/components/celebre/page-header';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import { create, index } from '@/routes/events';
import type { EventTypeOption } from '@/types';

export default function CreateEvent({
    eventTypes,
}: {
    eventTypes: EventTypeOption[];
}) {
    return (
        <>
            <Head title="Criar evento" />
            <div className="flex flex-1 flex-col gap-6 p-4 md:p-6">
                <PageHeader
                    eyebrow="Novo convite"
                    title="Criar evento"
                    description="O evento começa como rascunho e só fica público quando você publicar."
                />

                <EventCreationProgress currentStep={1} />

                <Card>
                    <CardHeader>
                        <CardTitle>Informações do evento</CardTitle>
                        <CardDescription>
                            Preencha os dados principais. Ao continuar, o evento
                            será salvo como rascunho privado.
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <EventForm
                            action={EventController.store()}
                            eventTypes={eventTypes}
                            submitLabel="Continuar"
                        />
                    </CardContent>
                </Card>
            </div>
        </>
    );
}

CreateEvent.layout = {
    breadcrumbs: [
        { title: 'Meus eventos', href: index() },
        { title: 'Criar', href: create() },
    ],
};
