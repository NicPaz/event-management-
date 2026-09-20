<?php

namespace App\Http\Controllers;

use App\Actions\Events\GetEventInvitation;
use App\Models\Event;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Gate;
use Inertia\Inertia;
use Inertia\Response;

class PublicEventController extends Controller
{
    public function __invoke(Request $request, Event $event, GetEventInvitation $invitation): Response
    {
        abort_unless($event->isPubliclyAvailable(), 404);

        $canCustomize = $request->user()?->can('update', $event) ?? false;

        return $this->render($event, false, $canCustomize, ! $canCustomize, $invitation);
    }

    public function preview(Event $event, GetEventInvitation $invitation): Response
    {
        Gate::authorize('view', $event);

        return $this->render($event, true, true, false, $invitation);
    }

    private function render(
        Event $event,
        bool $preview,
        bool $canCustomize,
        bool $showGuestActions,
        GetEventInvitation $invitation,
    ): Response {
        return Inertia::render('events/show', [
            'event' => $invitation->handle($event),
            'preview' => $preview,
            'canCustomize' => $canCustomize,
            'showGuestActions' => $showGuestActions,
        ]);
    }
}
