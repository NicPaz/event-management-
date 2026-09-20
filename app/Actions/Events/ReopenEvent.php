<?php

namespace App\Actions\Events;

use App\EventStatus;
use App\Models\Event;
use Illuminate\Validation\ValidationException;

class ReopenEvent
{
    public function handle(Event $event): Event
    {
        if ($event->status !== EventStatus::Closed || $event->suspended_at !== null) {
            throw ValidationException::withMessages([
                'event' => 'Este evento não pode ser reaberto.',
            ]);
        }

        $event->status = EventStatus::Published;
        $event->rsvp_open = true;
        $event->reservations_open = true;
        $event->save();

        return $event;
    }
}
