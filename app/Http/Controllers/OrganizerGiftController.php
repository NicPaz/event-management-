<?php

namespace App\Http\Controllers;

use App\GiftReservationStatus;
use App\Models\Event;
use App\Models\Gift;
use App\Models\GiftReservation;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Gate;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;
use Inertia\Response;

class OrganizerGiftController extends Controller
{
    public function __invoke(Request $request): Response
    {
        Gate::authorize('viewAny', Event::class);
        $events = $request->user()->events()->orderByDesc('id')->get(['id', 'title']);
        $event = $this->selectedEvent($request, $events);

        $gifts = $event?->gifts()
            ->whereNull('archived_at')
            ->with(['reservations' => function ($query): void {
                $query->where('status', GiftReservationStatus::Active)->with('guest:id,name');
            }])
            ->get()
            ->map(fn (Gift $gift): array => [
                'id' => $gift->id,
                'name' => $gift->name,
                'description' => $gift->description,
                'priceCents' => $gift->price_cents,
                'purchaseUrl' => $gift->purchase_url,
                'imageUrl' => $gift->image_path === null ? null : Storage::disk('public')->url($gift->image_path),
                'quantityTotal' => $gift->quantity_total,
                'quantityReserved' => $gift->quantity_reserved,
                'quantityAvailable' => $gift->quantity_total - $gift->quantity_reserved,
                'archived' => $gift->archived_at !== null,
                'reservations' => $gift->reservations->map(fn (GiftReservation $reservation): array => [
                    'guestName' => $reservation->guest->name,
                    'quantity' => $reservation->quantity,
                ])->values()->all(),
            ]) ?? collect();

        return Inertia::render('dashboard/events/gifts', [
            'event' => $event === null ? null : ['id' => $event->id, 'title' => $event->title],
            'events' => $events,
            'gifts' => $gifts,
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
}
