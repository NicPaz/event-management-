<?php

namespace App\Http\Controllers;

use App\Models\Event;
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
            ->get(['id', 'title', 'type', 'status', 'slug', 'starts_at', 'timezone'])
            ->map(fn (Event $event): array => $this->eventData($event));

        return Inertia::render('dashboard/events/index', [
            'events' => $events,
        ]);
    }

    public function show(Event $event): Response
    {
        Gate::authorize('view', $event);

        return Inertia::render('dashboard/events/show', [
            'event' => $this->eventData($event),
        ]);
    }

    /**
     * @return array{id: int, title: string, type: string, status: string, slug: string|null, startsAt: string|null, timezone: string}
     */
    private function eventData(Event $event): array
    {
        return [
            'id' => $event->id,
            'title' => $event->title,
            'type' => $event->type->value,
            'status' => $event->status->value,
            'slug' => $event->slug,
            'startsAt' => $event->starts_at?->toIso8601String(),
            'timezone' => $event->timezone,
        ];
    }
}
