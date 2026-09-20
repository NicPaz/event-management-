<?php

namespace Database\Factories;

use App\EventStatus;
use App\EventType;
use App\Models\Event;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<Event>
 */
class EventFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'user_id' => User::factory(),
            'title' => fake()->sentence(3),
            'type' => fake()->randomElement(EventType::cases()),
            'slug' => null,
            'starts_at' => fake()->dateTimeBetween('+1 week', '+1 year'),
            'timezone' => 'America/Sao_Paulo',
            'venue_name' => fake()->company(),
            'address' => fake()->address(),
            'welcome_text' => fake()->paragraph(),
            'instructions' => fake()->paragraph(),
            'status' => EventStatus::Draft,
            'rsvp_open' => true,
            'show_confirmed_guests' => false,
            'reservations_open' => true,
        ];
    }

    public function published(): static
    {
        return $this->state(fn (array $attributes) => [
            'slug' => fake()->unique()->slug(3),
            'status' => EventStatus::Published,
            'published_at' => now(),
        ]);
    }

    public function closed(): static
    {
        return $this->state(fn (array $attributes) => [
            'status' => EventStatus::Closed,
            'rsvp_open' => false,
            'reservations_open' => false,
        ]);
    }
}
