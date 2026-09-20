import { Head } from '@inertiajs/react';
import EventController from '@/actions/App/Http/Controllers/EventController';
import EventForm from '@/components/event-form';
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
                <div className="flex flex-col gap-1">
                    <h1 className="text-2xl font-semibold tracking-tight">
                        Criar evento
                    </h1>
                    <p className="text-muted-foreground text-sm">
                        O evento começa como rascunho e só fica público quando
                        você publicar.
                    </p>
                </div>

                <Card>
                    <CardHeader>
                        <CardTitle>Informações do evento</CardTitle>
                        <CardDescription>
                            Você poderá revisar tudo na prévia antes da
                            publicação.
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <EventForm
                            action={EventController.store()}
                            eventTypes={eventTypes}
                            submitLabel="Criar evento"
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
