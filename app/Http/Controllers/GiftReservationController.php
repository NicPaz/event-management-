<?php

namespace App\Http\Controllers;

use App\Actions\Gifts\CancelGiftReservation;
use App\Actions\Gifts\ReserveGift;
use App\Actions\Guests\ResolveGuestAccess;
use App\Http\Requests\UpdateGiftReservationRequest;
use App\Models\Event;
use App\Models\Gift;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\ValidationException;

class GiftReservationController extends Controller
{
    public function update(
        UpdateGiftReservationRequest $request,
        Event $event,
        Gift $gift,
        ResolveGuestAccess $access,
        ReserveGift $reserveGift,
    ): RedirectResponse {
        abort_unless($event->isPubliclyAvailable() && $gift->event_id === $event->id, 404);
        $guest = $access->handle($request, $event);

        if ($guest === null) {
            throw ValidationException::withMessages(['identity' => 'Identifique-se novamente para reservar presentes.']);
        }

        $reserveGift->handle($guest, $gift, $request->integer('quantity'));

        return back()->with('success', 'Reserva atualizada.');
    }

    public function destroy(
        Request $request,
        Event $event,
        Gift $gift,
        ResolveGuestAccess $access,
        CancelGiftReservation $cancelReservation,
    ): RedirectResponse {
        abort_unless($event->isPubliclyAvailable() && $gift->event_id === $event->id, 404);
        $guest = $access->handle($request, $event);

        if ($guest === null) {
            throw ValidationException::withMessages(['identity' => 'Identifique-se novamente para cancelar a reserva.']);
        }

        $cancelReservation->handle($guest, $gift);

        return back()->with('success', 'Reserva cancelada.');
    }
}
