<?php

namespace Database\Factories;

use App\Models\AuditLog;
use App\Models\Event;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<AuditLog>
 */
class AuditLogFactory extends Factory
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
            'actor_type' => 'guest',
            'actor_id' => null,
            'action' => 'test.action',
            'summary' => [],
        ];
    }
}
