<?php

namespace App\Http\Controllers;

use App\EventType;
use App\Http\Requests\StoreEventRequest;
use App\Http\Requests\UpdateEventRequest;
use App\Models\Event;
use App\RsvpStatus;
use Carbon\CarbonImmutable;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Gate;
use Inertia\Inertia;
use Inertia\Response;

class EventController extends Controller
{
    public function index(Request $request): Response
    {
        Gate::authorize('viewAny', Event::class);

        $events = $request->user()
            ->events()
            ->latest('id')
            ->get()
            ->map(fn (Event $event): array => $this->eventData($event));

        return Inertia::render('dashboard/events/index', [
            'events' => $events,
        ]);
    }

    public function create(): Response
    {
        Gate::authorize('create', Event::class);

        return Inertia::render('dashboard/events/create', [
            'eventTypes' => $this->eventTypes(),
        ]);
    }

    public function store(StoreEventRequest $request): RedirectResponse
    {
        $event = $request->user()->events()->create($this->eventAttributes($request));

        return redirect()->route('events.edit', $event)->with('success', 'Evento criado.');
    }

    public function show(Event $event): Response
    {
        Gate::authorize('view', $event);
        $metrics = $event->guests()
            ->toBase()
            ->selectRaw(
                'COUNT(CASE WHEN rsvp_status = ? THEN 1 END) as confirmed_guests',
                [RsvpStatus::Confirmed->value],
            )
            ->selectRaw(
                'COALESCE(SUM(CASE WHEN rsvp_status = ? THEN companions_count ELSE 0 END), 0) as companions',
                [RsvpStatus::Confirmed->value],
            )
            ->first();
        $confirmedGuests = (int) $metrics->confirmed_guests;
        $companions = (int) $metrics->companions;

        return Inertia::render('dashboard/events/show', [
            'event' => $this->eventData($event),
            'attendanceMetrics' => [
                'confirmedGuests' => $confirmedGuests,
                'companions' => $companions,
                'expectedTotal' => $confirmedGuests + $companions,
            ],
        ]);
    }

    public function edit(Event $event): Response
    {
        Gate::authorize('update', $event);

        return Inertia::render('dashboard/events/edit', [
            'event' => $this->eventData($event),
            'eventTypes' => $this->eventTypes(),
        ]);
    }

    public function update(UpdateEventRequest $request, Event $event): RedirectResponse
    {
        $event->update($this->eventAttributes($request));

        return back()->with('success', 'Evento atualizado.');
    }

    public function destroy(Event $event): RedirectResponse
    {
        Gate::authorize('delete', $event);
        $event->delete();

        return redirect()->route('events.index')->with('success', 'Evento arquivado.');
    }

    /**
     * @return array<string, bool|float|int|string|null>
     */
    private function eventData(Event $event): array
    {
        return [
            'id' => $event->id,
            'title' => $event->title,
            'type' => $event->type->value,
            'status' => $event->status->value,
            'slug' => $event->slug,
            'publicUrl' => $event->slug === null ? null : route('public.events.show', $event->slug),
            'startsAt' => $event->starts_at?->toIso8601String(),
            'startsAtLocal' => $event->starts_at?->setTimezone($event->timezone)->format('Y-m-d\TH:i'),
            'timezone' => $event->timezone,
            'venueName' => $event->venue_name,
            'address' => $event->address,
            'latitude' => $event->latitude === null ? null : (float) $event->latitude,
            'longitude' => $event->longitude === null ? null : (float) $event->longitude,
            'welcomeText' => $event->welcome_text,
            'instructions' => $event->instructions,
            'rsvpOpen' => $event->rsvp_open,
            'reservationsOpen' => $event->reservations_open,
        ];
    }

    /**
     * @return array<string, mixed>
     */
    private function eventAttributes(StoreEventRequest $request): array
    {
        $attributes = $request->safe()->only([
            'title',
            'type',
            'starts_at',
            'timezone',
            'venue_name',
            'address',
            'latitude',
            'longitude',
            'welcome_text',
            'instructions',
        ]);

        $attributes['starts_at'] = filled($attributes['starts_at'] ?? null)
            ? CarbonImmutable::parse($attributes['starts_at'], $attributes['timezone'])->utc()
            : null;

        return $attributes;
    }

    /**
     * @return list<array{label: string, value: string}>
     */
    private function eventTypes(): array
    {
        $labels = [
            EventType::Housewarming->value => 'Chá de casa nova',
            EventType::Wedding->value => 'Casamento',
            EventType::Birthday->value => 'Aniversário',
            EventType::KitchenTea->value => 'Chá de panela',
            EventType::Other->value => 'Outro',
        ];

        return array_map(
            fn (EventType $type): array => ['value' => $type->value, 'label' => $labels[$type->value]],
            EventType::cases(),
        );
    }
}
