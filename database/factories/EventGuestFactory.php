<?php

namespace Database\Factories;

use App\Models\Event;
use App\Models\EventGuest;
use App\RsvpStatus;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<EventGuest>
 */
class EventGuestFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'event_id' => Event::factory(),
            'name' => fake()->name(),
            'name_normalized' => fn (array $attributes): string => str($attributes['name'])->ascii()->lower()->squish()->toString(),
            'phone_normalized' => '55'.fake()->numerify('##9########'),
            'rsvp_status' => RsvpStatus::Unanswered,
            'companions_count' => 0,
            'session_version' => 1,
        ];
    }

    public function confirmed(int $companions = 0): static
    {
        return $this->state(fn (): array => [
            'rsvp_status' => RsvpStatus::Confirmed,
            'companions_count' => $companions,
            'confirmed_at' => now(),
            'cancelled_at' => null,
        ]);
    }
}
