<?php

namespace Database\Factories;

use App\Models\Event;
use App\Models\EventTheme;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<EventTheme>
 */
class EventThemeFactory extends Factory
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
            'template_key' => 'neutral',
            'background_color' => '#FAF7F2',
            'surface_color' => '#FFFFFF',
            'text_color' => '#3E352E',
            'accent_color' => '#88715B',
            'border_color' => '#DFD4C7',
            'font_pair' => 'classic',
            'banner_path' => null,
            'banner_position' => 'center',
        ];
    }
}
