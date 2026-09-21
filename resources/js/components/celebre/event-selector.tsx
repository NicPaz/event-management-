import { CalendarDays, ChevronDown } from 'lucide-react';
import { Label } from '@/components/ui/label';

type EventOption = { id: number; title: string };

export function EventSelector({
    events,
    selectedEventId,
    onChange,
}: {
    events: EventOption[];
    selectedEventId: number | null;
    onChange: (eventId: number | null) => void;
}) {
    return (
        <div className="grid gap-2">
            <Label htmlFor="selected-event">Evento selecionado</Label>
            <div className="relative">
                <CalendarDays
                    className="text-primary pointer-events-none absolute top-1/2 left-3.5 size-4 -translate-y-1/2"
                    aria-hidden="true"
                />
                <select
                    id="selected-event"
                    value={selectedEventId ?? ''}
                    onChange={(inputEvent) =>
                        onChange(
                            inputEvent.target.value
                                ? Number(inputEvent.target.value)
                                : null,
                        )
                    }
                    className="border-input focus-visible:border-ring focus-visible:ring-ring/35 bg-card h-11 w-full appearance-none rounded-xl border pr-10 pl-10 text-sm font-semibold shadow-xs outline-none focus-visible:ring-3"
                >
                    {events.length > 1 && (
                        <option value="">Selecione um evento</option>
                    )}
                    {events.map((event) => (
                        <option key={event.id} value={event.id}>
                            {event.title}
                        </option>
                    ))}
                </select>
                <ChevronDown
                    className="text-muted-foreground pointer-events-none absolute top-1/2 right-3.5 size-4 -translate-y-1/2"
                    aria-hidden="true"
                />
            </div>
            {selectedEventId && (
                <p className="text-muted-foreground text-xs">
                    Todas as alterações serão feitas neste evento.
                </p>
            )}
        </div>
    );
}
