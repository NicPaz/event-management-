<?php

namespace App\Http\Controllers;

use App\Actions\Events\GetEventInvitation;
use App\Actions\Guests\ResolveGuestAccess;
use App\Models\Event;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class GuestParticipationController extends Controller
{
    public function __invoke(
        Request $request,
        Event $event,
        ResolveGuestAccess $access,
        GetEventInvitation $invitation,
    ): Response {
        abort_unless($event->isPubliclyAvailable(), 404);
        $guest = $access->handle($request, $event);

        $reservations = $guest?->giftReservations()
            ->with('gift')
            ->where('status', 'active')
            ->get()
            ->mapWithKeys(fn ($reservation): array => [
                $reservation->gift_id => [
                    'giftName' => $reservation->gift->name,
                    'quantity' => $reservation->quantity,
                ],
            ]) ?? collect();

        return Inertia::render('events/participation', [
            'event' => $invitation->handle($event),
            'guest' => $guest === null ? null : [
                'name' => $guest->name,
                'rsvpStatus' => $guest->rsvp_status->value,
                'companionsCount' => $guest->companions_count,
            ],
            'canRespond' => $event->status->value === 'published' && $event->rsvp_open,
            'reservations' => $reservations,
        ]);
    }
}
