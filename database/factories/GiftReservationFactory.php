<?php

namespace Database\Factories;

use App\GiftReservationStatus;
use App\Models\EventGuest;
use App\Models\Gift;
use App\Models\GiftReservation;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<GiftReservation>
 */
class GiftReservationFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'event_guest_id' => EventGuest::factory(),
            'gift_id' => Gift::factory(),
            'quantity' => 1,
            'status' => GiftReservationStatus::Active,
        ];
    }
}
