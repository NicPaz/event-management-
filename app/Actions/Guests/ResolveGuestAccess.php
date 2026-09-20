<?php

namespace App\Actions\Guests;

use App\Models\Event;
use App\Models\EventGuest;
use Illuminate\Http\Request;

class ResolveGuestAccess
{
    public function handle(Request $request, Event $event): ?EventGuest
    {
        $sessionKey = "guest_access.{$event->id}";
        $access = $request->session()->get($sessionKey);

        if (! is_array($access)) {
            return null;
        }

        $guestId = $access['guest_id'] ?? null;
        $sessionVersion = $access['session_version'] ?? null;

        if (! is_numeric($guestId) || ! is_numeric($sessionVersion)) {
            $request->session()->forget($sessionKey);

            return null;
        }

        $guest = $event->guests()->find((int) $guestId);

        if ($guest === null || $guest->session_version !== (int) $sessionVersion) {
            $request->session()->forget($sessionKey);

            return null;
        }

        return $guest;
    }

    public function forget(Request $request, Event $event): void
    {
        $request->session()->forget("guest_access.{$event->id}");
        $request->session()->regenerate();
    }
}
