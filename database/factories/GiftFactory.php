<?php

namespace Database\Factories;

use App\Models\Event;
use App\Models\Gift;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<Gift>
 */
class GiftFactory extends Factory
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
            'name' => fake()->words(3, true),
            'description' => fake()->sentence(),
            'purchase_url' => fake()->url(),
            'quantity_total' => 3,
            'quantity_reserved' => 0,
            'position' => 0,
        ];
    }
}
