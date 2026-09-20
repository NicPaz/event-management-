<?php

namespace App\Actions\Guests;

use App\EventStatus;
use App\Models\Event;
use App\Models\EventGuest;
use Illuminate\Http\Request;
use Illuminate\Validation\ValidationException;

class IdentifyGuest
{
    public function __construct(private NormalizeGuestIdentity $normalizer) {}

    public function handle(Request $request, Event $event, string $name, string $phone): EventGuest
    {
        $normalizedName = $this->normalizer->name($name);
        $normalizedPhone = $this->normalizer->phone($phone);

        if ($normalizedPhone === null) {
            throw ValidationException::withMessages([
                'phone' => 'Informe um telefone brasileiro válido com DDD.',
            ]);
        }

        $guest = $event->guests()->where('phone_normalized', $normalizedPhone)->first();

        if ($guest !== null && ! hash_equals($guest->name_normalized, $normalizedName)) {
            throw ValidationException::withMessages([
                'identity' => 'Não foi possível confirmar os dados. Confira nome e telefone ou fale com a organização.',
            ]);
        }

        if ($guest === null) {
            if ($event->status !== EventStatus::Published) {
                throw ValidationException::withMessages([
                    'identity' => 'Este evento está disponível somente para consulta.',
                ]);
            }

            $guest = $event->guests()->create([
                'name' => Str($name)->squish()->toString(),
                'name_normalized' => $normalizedName,
                'phone_normalized' => $normalizedPhone,
            ]);
        }

        $request->session()->put("guest_access.{$event->id}", [
            'guest_id' => $guest->id,
            'session_version' => $guest->session_version,
        ]);
        $request->session()->regenerate();

        return $guest;
    }
}
