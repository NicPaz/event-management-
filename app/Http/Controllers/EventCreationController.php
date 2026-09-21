<?php

namespace App\Http\Controllers;

use App\Actions\Events\GetEventInvitation;
use App\Actions\Events\PublishEvent;
use App\EventStatus;
use App\Http\Requests\FinalizeEventCreationRequest;
use App\Models\Event;
use Illuminate\Http\RedirectResponse;
use Illuminate\Support\Facades\Gate;
use Inertia\Inertia;
use Inertia\Response;

class EventCreationController extends Controller
{
    public function show(Event $event, GetEventInvitation $invitation): Response|RedirectResponse
    {
        Gate::authorize('update', $event);

        if ($event->status !== EventStatus::Draft) {
            return redirect()->route('events.creation.complete', $event);
        }

        return Inertia::render('dashboard/events/finalization', [
            'event' => $invitation->handle($event),
        ]);
    }

    public function store(
        FinalizeEventCreationRequest $request,
        Event $event,
        PublishEvent $publishEvent,
    ): RedirectResponse {
        $decision = $request->string('decision')->toString();

        if ($decision === 'publish') {
            $publishEvent->handle($event);

            return redirect()->route('events.creation.complete', $event)
                ->with('success', 'Seu evento foi publicado!');
        }

        if ($event->status !== EventStatus::Draft) {
            return redirect()->route('events.creation.complete', $event)
                ->with('success', 'Seu evento já está publicado.');
        }

        return redirect()->route('events.creation.complete', $event)
            ->with('success', 'Evento salvo como privado.');
    }

    public function complete(Event $event): Response
    {
        Gate::authorize('view', $event);

        $isPublished = in_array($event->status, [EventStatus::Published, EventStatus::Closed], true);

        return Inertia::render('dashboard/events/creation-complete', [
            'event' => [
                'id' => $event->id,
                'title' => $event->title,
                'isPublished' => $isPublished,
                'publicUrl' => $isPublished && $event->slug !== null
                    ? route('public.events.show', $event->slug)
                    : null,
            ],
        ]);
    }
}
