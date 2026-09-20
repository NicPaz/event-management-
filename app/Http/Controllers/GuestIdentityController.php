<?php

namespace App\Http\Controllers;

use App\Actions\Gifts\ReserveGift;
use App\Actions\Guests\IdentifyGuest;
use App\Actions\Guests\ResolveGuestAccess;
use App\Http\Requests\IdentifyGuestRequest;
use App\Models\Event;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;

class GuestIdentityController extends Controller
{
    public function store(
        IdentifyGuestRequest $request,
        Event $event,
        IdentifyGuest $identifyGuest,
        ReserveGift $reserveGift,
    ): RedirectResponse {
        abort_unless($event->isPubliclyAvailable(), 404);
        $guest = $identifyGuest->handle(
            $request,
            $event,
            $request->string('name')->toString(),
            $request->string('phone')->toString(),
        );

        if ($request->filled('gift_id')) {
            $gift = $event->gifts()
                ->whereNull('archived_at')
                ->findOrFail($request->integer('gift_id'));
            $currentQuantity = $guest->giftReservations()
                ->whereBelongsTo($gift, 'gift')
                ->where('status', 'active')
                ->value('quantity');
            $reserveGift->handle($guest, $gift, max(1, (int) $currentQuantity));

            return redirect()->route('public.events.show', $event->slug)
                ->with('success', 'Presente reservado.');
        }

        return redirect()->route('public.events.participation', $event->slug)
            ->with('success', 'Identificação concluída.');
    }

    public function destroy(
        Request $request,
        Event $event,
        ResolveGuestAccess $access,
    ): RedirectResponse {
        $access->forget($request, $event);

        return redirect()->route('public.events.participation', $event->slug)
            ->with('success', 'Acesso de convidado encerrado neste navegador.');
    }
}
