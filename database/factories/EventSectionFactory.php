<?php

namespace Database\Factories;

use App\EventSectionType;
use App\Models\Event;
use App\Models\EventSection;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<EventSection>
 */
class EventSectionFactory extends Factory
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
            'type' => fake()->randomElement(EventSectionType::cases()),
            'enabled' => true,
            'position' => fake()->numberBetween(0, count(EventSectionType::cases()) - 1),
        ];
    }
}
