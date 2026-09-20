<?php

namespace App\Http\Controllers;

use App\Actions\Events\GetEventInvitation;
use App\Actions\Guests\ResolveGuestAccess;
use App\Models\Event;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Gate;
use Inertia\Inertia;
use Inertia\Response;

class PublicEventController extends Controller
{
    public function __invoke(
        Request $request,
        Event $event,
        ResolveGuestAccess $access,
        GetEventInvitation $invitation,
    ): Response {
        abort_unless($event->isPubliclyAvailable(), 404);

        $canCustomize = $request->user()?->can('update', $event) ?? false;
        $guest = $canCustomize ? null : $access->handle($request, $event);
        $guestData = $guest === null ? null : [
            'name' => $guest->name,
            'reservations' => $guest->giftReservations()
                ->where('status', 'active')
                ->pluck('quantity', 'gift_id')
                ->all(),
        ];

        return $this->render(
            $event,
            false,
            $canCustomize,
            ! $canCustomize,
            $guestData,
            $invitation,
        );
    }

    public function preview(Event $event, GetEventInvitation $invitation): Response
    {
        Gate::authorize('view', $event);

        return $this->render($event, true, true, false, null, $invitation);
    }

    /** @param array{name: string, reservations: array<int, int>}|null $guest */
    private function render(
        Event $event,
        bool $preview,
        bool $canCustomize,
        bool $showGuestActions,
        ?array $guest,
        GetEventInvitation $invitation,
    ): Response {
        return Inertia::render('events/show', [
            'event' => $invitation->handle($event),
            'preview' => $preview,
            'canCustomize' => $canCustomize,
            'showGuestActions' => $showGuestActions,
            'guest' => $guest,
        ]);
    }
}
