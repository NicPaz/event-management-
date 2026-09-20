<?php

namespace App\Http\Controllers;

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
    ): RedirectResponse {
        abort_unless($event->isPubliclyAvailable(), 404);
        $identifyGuest->handle(
            $request,
            $event,
            $request->string('name')->toString(),
            $request->string('phone')->toString(),
        );

        return redirect()->route('public.events.participation', $event)
            ->with('success', 'Identificação concluída.');
    }

    public function destroy(
        Request $request,
        Event $event,
        ResolveGuestAccess $access,
    ): RedirectResponse {
        $access->forget($request, $event);

        return redirect()->route('public.events.participation', $event)
            ->with('success', 'Acesso de convidado encerrado neste navegador.');
    }
}
