<?php

namespace App\Actions\Events;

use App\EventStatus;
use App\Models\Event;
use Carbon\CarbonImmutable;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Str;
use Illuminate\Validation\ValidationException;

class PublishEvent
{
    public function handle(Event $event): Event
    {
        if ($event->status === EventStatus::Closed) {
            throw ValidationException::withMessages([
                'event' => 'Reabra o evento antes de publicá-lo novamente.',
            ]);
        }

        Validator::make([
            'starts_at' => $event->starts_at,
            'venue_name' => $event->venue_name,
            'address' => $event->address,
            'suspended_at' => $event->suspended_at,
        ], [
            'starts_at' => ['required'],
            'venue_name' => ['required', 'string'],
            'address' => ['required', 'string'],
            'suspended_at' => ['prohibited'],
        ], [
            'starts_at.required' => 'Defina a data e o horário antes de publicar.',
            'venue_name.required' => 'Informe o nome do local antes de publicar.',
            'address.required' => 'Informe o endereço antes de publicar.',
            'suspended_at.prohibited' => 'Um evento suspenso não pode ser publicado.',
        ])->validate();

        if ($event->slug === null) {
            $baseSlug = Str::slug($event->title) ?: 'evento';
            $event->slug = $baseSlug.'-'.$event->getKey();
        }

        $event->status = EventStatus::Published;
        $event->published_at ??= CarbonImmutable::now();
        $event->save();

        return $event;
    }
}
