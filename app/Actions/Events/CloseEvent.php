<?php

namespace App\Actions\Events;

use App\EventStatus;
use App\Models\Event;
use Illuminate\Validation\ValidationException;

class CloseEvent
{
    public function handle(Event $event): Event
    {
        if ($event->status !== EventStatus::Published) {
            throw ValidationException::withMessages([
                'event' => 'Somente um evento publicado pode ser encerrado.',
            ]);
        }

        $event->status = EventStatus::Closed;
        $event->rsvp_open = false;
        $event->reservations_open = false;
        $event->save();

        return $event;
    }
}
