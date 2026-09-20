<?php

namespace Database\Factories;

use App\Models\Event;
use App\Models\EventPaletteItem;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<EventPaletteItem>
 */
class EventPaletteItemFactory extends Factory
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
            'label' => fake()->randomElement(['Branco', 'Preto', 'Inox', 'Bambu']),
            'color_hex' => fake()->hexColor(),
            'material' => null,
            'position' => fake()->numberBetween(0, 10),
        ];
    }
}
