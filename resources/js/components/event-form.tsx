import { useMemo, useState } from 'react';
import { Form } from '@inertiajs/react';
import EventController from '@/actions/App/Http/Controllers/EventController';
import InputError from '@/components/input-error';
import ThemePreview from '@/components/theme-preview';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import type { EventDetails, EventThemeOption, EventTypeOption } from '@/types';

type EventFormProps = {
    action:
        | ReturnType<typeof EventController.store>
        | ReturnType<typeof EventController.update>;
    event?: EventDetails;
    eventTypes: EventTypeOption[];
    themeOptions?: EventThemeOption[];
    submitLabel: string;
};

export default function EventForm({
    action,
    event,
    eventTypes,
    themeOptions = [],
    submitLabel,
}: EventFormProps) {
    const [eventType, setEventType] = useState(event?.type ?? 'housewarming');
    const availableThemes = useMemo(
        () => themeOptions.filter((theme) => theme.type === eventType),
        [eventType, themeOptions],
    );
    const [themeKey, setThemeKey] = useState(
        () => themeOptions.find((theme) => theme.type === eventType)?.key ?? '',
    );
    const [previewTheme, setPreviewTheme] = useState<EventThemeOption | null>(
        null,
    );

    const changeEventType = (type: string) => {
        setEventType(type);
        setThemeKey(
            themeOptions.find((theme) => theme.type === type)?.key ?? '',
        );
    };

    return (
        <>
            <Form action={action} options={{ preserveScroll: true }}>
                {({ errors, processing }) => (
                    <div className="grid gap-6">
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
                                    value={eventType}
                                    onChange={(inputEvent) =>
                                        changeEventType(inputEvent.target.value)
                                    }
                                    className="border-input focus-visible:border-ring focus-visible:ring-ring/50 h-9 rounded-md border bg-transparent px-3 text-sm shadow-xs outline-none focus-visible:ring-3"
                                >
                                    {eventTypes.map((type) => (
                                        <option
                                            key={type.value}
                                            value={type.value}
                                        >
                                            {type.label}
                                        </option>
                                    ))}
                                </select>
                                <InputError message={errors.type} />
                            </div>

                            {!event && (
                                <div className="grid gap-4 md:col-span-2">
                                    <div>
                                        <Label>Escolha o tema</Label>
                                        <p className="text-muted-foreground mt-1 text-sm">
                                            O tema define composição,
                                            tipografia, cartões, botões e
                                            elementos decorativos. Você poderá
                                            personalizá-lo depois.
                                        </p>
                                    </div>
                                    <input
                                        type="hidden"
                                        name="theme_key"
                                        value={themeKey}
                                    />
                                    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                                        {availableThemes.map((theme) => (
                                            <ThemePreview
                                                key={theme.key}
                                                theme={theme}
                                                selected={
                                                    theme.key === themeKey
                                                }
                                                onSelect={() =>
                                                    setThemeKey(theme.key)
                                                }
                                                onPreview={() =>
                                                    setPreviewTheme(theme)
                                                }
                                            />
                                        ))}
                                    </div>
                                    <InputError message={errors.theme_key} />
                                </div>
                            )}

                            <div className="grid gap-2">
                                <Label htmlFor="starts_at">
                                    Data e horário
                                </Label>
                                <Input
                                    id="starts_at"
                                    name="starts_at"
                                    type="datetime-local"
                                    defaultValue={event?.startsAtLocal ?? ''}
                                />
                                <InputError message={errors.starts_at} />
                            </div>

                            <div className="grid gap-2">
                                <Label htmlFor="timezone">Fuso horário</Label>
                                <Input
                                    id="timezone"
                                    name="timezone"
                                    defaultValue={
                                        event?.timezone ?? 'America/Sao_Paulo'
                                    }
                                    required
                                />
                                <InputError message={errors.timezone} />
                            </div>

                            <div className="grid gap-2">
                                <Label htmlFor="venue_name">
                                    Nome do local
                                </Label>
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

                            <div className="grid gap-2">
                                <Label htmlFor="latitude">
                                    Latitude (opcional)
                                </Label>
                                <Input
                                    id="latitude"
                                    name="latitude"
                                    type="number"
                                    step="any"
                                    defaultValue={event?.latitude ?? ''}
                                />
                                <InputError message={errors.latitude} />
                            </div>

                            <div className="grid gap-2">
                                <Label htmlFor="longitude">
                                    Longitude (opcional)
                                </Label>
                                <Input
                                    id="longitude"
                                    name="longitude"
                                    type="number"
                                    step="any"
                                    defaultValue={event?.longitude ?? ''}
                                />
                                <InputError message={errors.longitude} />
                            </div>

                            <div className="grid gap-2 md:col-span-2">
                                <Label htmlFor="welcome_text">
                                    Mensagem de boas-vindas
                                </Label>
                                <textarea
                                    id="welcome_text"
                                    name="welcome_text"
                                    defaultValue={event?.welcomeText ?? ''}
                                    rows={4}
                                    maxLength={5000}
                                    className="border-input focus-visible:border-ring focus-visible:ring-ring/50 rounded-md border bg-transparent px-3 py-2 text-sm shadow-xs outline-none focus-visible:ring-3"
                                />
                                <InputError message={errors.welcome_text} />
                            </div>

                            <div className="grid gap-2 md:col-span-2">
                                <Label htmlFor="instructions">
                                    Orientações
                                </Label>
                                <textarea
                                    id="instructions"
                                    name="instructions"
                                    defaultValue={event?.instructions ?? ''}
                                    rows={4}
                                    maxLength={5000}
                                    className="border-input focus-visible:border-ring focus-visible:ring-ring/50 rounded-md border bg-transparent px-3 py-2 text-sm shadow-xs outline-none focus-visible:ring-3"
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
            <Dialog
                open={previewTheme !== null}
                onOpenChange={(open) => !open && setPreviewTheme(null)}
            >
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>{previewTheme?.name}</DialogTitle>
                        <DialogDescription>
                            Esta prévia usa os mesmos tokens visuais aplicados
                            ao convite.
                        </DialogDescription>
                    </DialogHeader>
                    {previewTheme && <ThemePreview theme={previewTheme} />}
                </DialogContent>
            </Dialog>
        </>
    );
}
