import { useRef } from 'react';
import { Form } from '@inertiajs/react';
import EventController from '@/actions/App/Http/Controllers/EventController';
import InputError from '@/components/input-error';
import { UnsavedChangesGuard } from '@/components/unsaved-changes-guard';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import type { EventDetails, EventTypeOption } from '@/types';

type EventFormProps = {
    action:
        | ReturnType<typeof EventController.store>
        | ReturnType<typeof EventController.update>;
    event?: EventDetails;
    eventTypes: EventTypeOption[];
    submitLabel: string;
};

export default function EventForm({
    action,
    event,
    eventTypes,
    submitLabel,
}: EventFormProps) {
    const submitting = useRef(false);

    return (
        <Form
            action={action}
            setDefaultsOnSuccess
            onSubmitCapture={() => {
                submitting.current = true;
            }}
            onFinish={() => {
                submitting.current = false;
            }}
            options={{
                preserveScroll: true,
            }}
        >
            {({ errors, isDirty, processing }) => (
                <div className="grid gap-6">
                    <UnsavedChangesGuard
                        when={isDirty && !processing}
                        bypassRef={submitting}
                    />
                    <div className="grid gap-5 md:grid-cols-2">
                        <div className="grid gap-2 md:col-span-2">
                            <Label htmlFor="title">Nome do evento</Label>
                            <Input
                                id="title"
                                name="title"
                                defaultValue={event?.title}
                                maxLength={120}
                                required
                            />
                            <InputError message={errors.title} />
                        </div>

                        <div className="grid gap-2">
                            <Label htmlFor="type">Tipo</Label>
                            <select
                                id="type"
                                name="type"
                                defaultValue={event?.type ?? 'housewarming'}
                                className="border-input focus-visible:border-ring focus-visible:ring-ring/35 bg-card h-11 rounded-xl border px-3 text-sm shadow-xs outline-none focus-visible:ring-3"
                            >
                                {eventTypes.map((type) => (
                                    <option key={type.value} value={type.value}>
                                        {type.label}
                                    </option>
                                ))}
                            </select>
                            <InputError message={errors.type} />
                        </div>

                        <div className="grid gap-2">
                            <Label htmlFor="starts_at">Data e horário</Label>
                            <Input
                                id="starts_at"
                                name="starts_at"
                                type="datetime-local"
                                defaultValue={event?.startsAtLocal ?? ''}
                            />
                            <InputError message={errors.starts_at} />
                        </div>

                        <div className="grid gap-2">
                            <Label htmlFor="venue_name">Nome do local</Label>
                            <Input
                                id="venue_name"
                                name="venue_name"
                                defaultValue={event?.venueName ?? ''}
                            />
                            <InputError message={errors.venue_name} />
                        </div>

                        <div className="grid gap-2 md:col-span-2">
                            <Label htmlFor="address">Endereço</Label>
                            <Input
                                id="address"
                                name="address"
                                defaultValue={event?.address ?? ''}
                            />
                            <InputError message={errors.address} />
                        </div>

                        <div className="grid gap-2 md:col-span-2">
                            <Label htmlFor="welcome_text">
                                Mensagem de boas-vindas
                            </Label>
                            <Textarea
                                id="welcome_text"
                                name="welcome_text"
                                defaultValue={event?.welcomeText ?? ''}
                                rows={4}
                                maxLength={5000}
                            />
                            <InputError message={errors.welcome_text} />
                        </div>

                        <div className="grid gap-2 md:col-span-2">
                            <Label htmlFor="instructions">Orientações</Label>
                            <Textarea
                                id="instructions"
                                name="instructions"
                                defaultValue={event?.instructions ?? ''}
                                rows={4}
                                maxLength={5000}
                            />
                            <InputError message={errors.instructions} />
                        </div>
                    </div>

                    <div>
                        <Button disabled={processing}>
                            {processing ? 'Salvando...' : submitLabel}
                        </Button>
                    </div>
                </div>
            )}
        </Form>
    );
}
