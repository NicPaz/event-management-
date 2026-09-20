<?php

namespace App\Http\Controllers;

use App\Actions\Guests\NormalizeGuestIdentity;
use App\GiftReservationStatus;
use App\Models\Event;
use App\Models\EventGuest;
use App\Models\GiftReservation;
use App\RsvpStatus;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Database\Eloquent\Relations\Relation;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Gate;
use Inertia\Inertia;
use Inertia\Response;

class OrganizerGuestController extends Controller
{
    public function __invoke(Request $request, NormalizeGuestIdentity $normalizer): Response
    {
        Gate::authorize('viewAny', Event::class);
        $events = $request->user()->events()->orderByDesc('id')->get(['id', 'title']);
        $event = $this->selectedEvent($request, $events);
        $search = str($request->string('search')->toString())->squish()->limit(120)->toString();

        if ($event === null) {
            return Inertia::render('dashboard/events/guests', [
                'event' => null,
                'events' => $events,
                'guests' => ['data' => [], 'links' => [], 'total' => 0],
                'filters' => ['search' => $search],
                'metrics' => $this->emptyMetrics(),
                'standalone' => true,
            ]);
        }

        $normalizedName = $normalizer->name($search);
        $phoneDigits = preg_replace('/\D+/', '', $search) ?? '';
        $guests = $event->guests()
            ->with(['giftReservations' => function (Relation $query): void {
                $query->where('status', GiftReservationStatus::Active)->with('gift');
            }])
            ->when($search !== '', function (Builder $query) use ($normalizedName, $phoneDigits): void {
                $query->where(function (Builder $query) use ($normalizedName, $phoneDigits): void {
                    $query->where('name_normalized', 'like', "%{$normalizedName}%");

                    if ($phoneDigits !== '') {
                        $query->orWhere('phone_normalized', 'like', "%{$phoneDigits}%");
                    }
                });
            })
            ->latest('id')
            ->paginate(15)
            ->withQueryString()
            ->through(fn (EventGuest $guest): array => $this->guestData($guest));

        $attendance = $event->guests()->toBase()
            ->selectRaw('COUNT(CASE WHEN rsvp_status = ? THEN 1 END) as confirmed_guests', [RsvpStatus::Confirmed->value])
            ->selectRaw('COUNT(CASE WHEN rsvp_status = ? THEN 1 END) as declined_guests', [RsvpStatus::Declined->value])
            ->selectRaw('COALESCE(SUM(CASE WHEN rsvp_status = ? THEN companions_count ELSE 0 END), 0) as companions', [RsvpStatus::Confirmed->value])
            ->first();
        $confirmedGuests = (int) $attendance->confirmed_guests;
        $companions = (int) $attendance->companions;

        return Inertia::render('dashboard/events/guests', [
            'event' => ['id' => $event->id, 'title' => $event->title],
            'events' => $events,
            'guests' => $guests,
            'filters' => ['search' => $search],
            'metrics' => [
                'confirmedGuests' => $confirmedGuests,
                'companions' => $companions,
                'expectedTotal' => $confirmedGuests + $companions,
                'declinedGuests' => (int) $attendance->declined_guests,
                'reservedUnits' => GiftReservation::query()
                    ->whereHas('guest', fn (Builder $query): Builder => $query->where('event_id', $event->id))
                    ->where('status', GiftReservationStatus::Active)
                    ->sum('quantity'),
            ],
            'standalone' => true,
        ]);
    }

    /** @param Collection<int, Event> $events */
    private function selectedEvent(Request $request, Collection $events): ?Event
    {
        if ($events->isEmpty()) {
            abort_if($request->filled('event'), 404);

            return null;
        }

        $selectedId = $request->filled('event')
            ? $request->integer('event')
            : ($events->count() === 1 ? $events->first()->id : null);

        if ($selectedId === null) {
            return null;
        }

        $event = $events->firstWhere('id', $selectedId);
        abort_if($event === null, 404);

        return $event;
    }

    /** @return array<string, int|string|array<int, array<string, int|string>>> */
    private function guestData(EventGuest $guest): array
    {
        return [
            'id' => $guest->id,
            'name' => $guest->name,
            'phone' => $this->formatPhone($guest->phone_normalized),
            'status' => $guest->rsvp_status->value,
            'companionsCount' => $guest->companions_count,
            'reservations' => $guest->giftReservations->map(fn (GiftReservation $reservation): array => [
                'giftName' => $reservation->gift->name,
                'quantity' => $reservation->quantity,
            ])->values()->all(),
        ];
    }

    /** @return array<string, int> */
    private function emptyMetrics(): array
    {
        return ['confirmedGuests' => 0, 'companions' => 0, 'expectedTotal' => 0, 'declinedGuests' => 0, 'reservedUnits' => 0];
    }

    private function formatPhone(string $phone): string
    {
        $national = str_starts_with($phone, '55') ? substr($phone, 2) : $phone;

        return strlen($national) === 11
            ? sprintf('(%s) %s-%s', substr($national, 0, 2), substr($national, 2, 5), substr($national, 7))
            : sprintf('(%s) %s-%s', substr($national, 0, 2), substr($national, 2, 4), substr($national, 6));
    }
}
