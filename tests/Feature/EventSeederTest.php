<?php

use App\Models\Event;
use App\Models\User;
use Database\Seeders\EventSeeder;

test('the local demo seeder creates complete isolated and idempotent events for existing organizers', function () {
    $firstOrganizer = User::factory()->create();
    $secondOrganizer = User::factory()->create();
    User::factory()->administrator()->create();

    $this->artisan('db:seed', ['--class' => EventSeeder::class])->assertSuccessful();
    $this->artisan('db:seed', ['--class' => EventSeeder::class])->assertSuccessful();

    expect(Event::query()->count())->toBe(2)
        ->and($firstOrganizer->events()->count())->toBe(1)
        ->and($secondOrganizer->events()->count())->toBe(1);

    $event = $firstOrganizer->events()->with(['theme', 'paletteItems', 'guests', 'gifts'])->sole();

    expect($event->slug)->toBe("demonstracao-{$firstOrganizer->id}")
        ->and($event->theme)->not->toBeNull()
        ->and($event->paletteItems)->toHaveCount(3)
        ->and($event->guests)->toHaveCount(3)
        ->and($event->gifts)->toHaveCount(3)
        ->and($event->gifts->sum('quantity_reserved'))->toBe(1);
});
