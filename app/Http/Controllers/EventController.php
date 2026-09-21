<?php

namespace App\Http\Controllers;

use App\Actions\Events\ApplyEventTheme;
use App\EventStatus;
use App\EventType;
use App\Http\Requests\StoreEventRequest;
use App\Http\Requests\UpdateEventRequest;
use App\Models\Event;
use App\RsvpStatus;
use Carbon\CarbonImmutable;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Gate;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;
use Inertia\Response;

class EventController extends Controller
{
    public function index(Request $request): Response
    {
        Gate::authorize('viewAny', Event::class);

        $events = $request->user()
            ->events()
            ->with('theme')
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

    public function store(StoreEventRequest $request, ApplyEventTheme $applyTheme): RedirectResponse
    {
        $event = DB::transaction(function () use ($request, $applyTheme): Event {
            $event = $request->user()->events()->create($this->eventAttributes($request));
            $applyTheme->handle($event, $request->string('theme_key')->toString());

            return $event;
        });

        return redirect()->route('events.gifts.index', [
            'event' => $event,
            'creation' => 1,
        ])->with('success', 'Informações salvas. Seu evento continua privado.');
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

    public function edit(Request $request, Event $event): Response
    {
        Gate::authorize('update', $event);

        return Inertia::render('dashboard/events/edit', [
            'event' => $this->eventData($event),
            'eventTypes' => $this->eventTypes(),
            'creationFlow' => $request->boolean('creation'),
        ]);
    }

    public function update(UpdateEventRequest $request, Event $event): RedirectResponse
    {
        $event->update($this->eventAttributes($request, $event));

        if ($request->boolean('creation')) {
            return redirect()->route('events.gifts.index', [
                'event' => $event,
                'creation' => 1,
            ])->with('success', 'Informações atualizadas.');
        }

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
            'publicUrl' => $this->publicUrl($event),
            'invitationUrl' => $this->invitationUrl($event),
            'startsAt' => $event->starts_at?->toIso8601String(),
            'startsAtLocal' => $event->starts_at?->setTimezone($event->timezone)->format('Y-m-d\TH:i'),
            'timezone' => $event->timezone,
            'venueName' => $event->venue_name,
            'address' => $event->address,
            'latitude' => $event->latitude === null ? null : (float) $event->latitude,
            'longitude' => $event->longitude === null ? null : (float) $event->longitude,
            'welcomeText' => $event->welcome_text,
            'instructions' => $event->instructions,
            'bannerUrl' => $event->theme?->banner_path === null
                ? null
                : Storage::disk('public')->url($event->theme->banner_path),
            'rsvpOpen' => $event->rsvp_open,
            'reservationsOpen' => $event->reservations_open,
        ];
    }

    /**
     * @return array<string, mixed>
     */
    private function eventAttributes(StoreEventRequest $request, ?Event $event = null): array
    {
        $attributes = $request->safe()->only([
            'title',
            'type',
            'starts_at',
            'venue_name',
            'address',
            'welcome_text',
            'instructions',
        ]);
        $timezone = $event === null
            ? config('app.event_timezone', 'America/Sao_Paulo')
            : $event->timezone;

        $attributes['starts_at'] = filled($attributes['starts_at'] ?? null)
            ? CarbonImmutable::parse($attributes['starts_at'], $timezone)->utc()
            : null;

        if ($event === null) {
            $attributes['timezone'] = $timezone;
        }

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

    private function publicUrl(Event $event): ?string
    {
        if ($event->slug === null
            || ! in_array($event->status, [EventStatus::Published, EventStatus::Closed], true)
            || $event->suspended_at !== null) {
            return null;
        }

        return route('public.events.show', $event->slug);
    }

    private function invitationUrl(Event $event): string
    {
        return $this->publicUrl($event) ?? route('events.preview', $event);
    }
}
