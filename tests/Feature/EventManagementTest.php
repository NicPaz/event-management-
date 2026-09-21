<?php

use App\EventStatus;
use App\Models\Event;
use App\Models\User;
use Inertia\Testing\AssertableInertia as Assert;

function validEventPayload(array $overrides = []): array
{
    return [
        'title' => 'Chá de casa nova',
        'type' => 'housewarming',
        'starts_at' => '2026-12-20T18:30',
        'venue_name' => 'Casa da anfitriã',
        'address' => 'Rua das Flores, 100',
        'welcome_text' => 'Esperamos você!',
        'instructions' => 'Venha com alegria.',
        ...$overrides,
    ];
}

test('organizers can open the event creation screen', function () {
    $organizer = User::factory()->create();

    $response = $this->actingAs($organizer)->get(route('events.create'));

    $response->assertOk()->assertInertia(fn (Assert $page) => $page
        ->component('dashboard/events/create')
        ->has('eventTypes', 5)
    );
});

test('organizers create draft events with local time stored in UTC', function () {
    $organizer = User::factory()->create();

    $response = $this->actingAs($organizer)->post(route('events.store'), validEventPayload());

    $event = Event::query()->sole();
    $response->assertRedirectToRoute('events.edit', $event);
    expect($event->user_id)->toBe($organizer->id)
        ->and($event->status)->toBe(EventStatus::Draft)
        ->and($event->timezone)->toBe('America/Sao_Paulo')
        ->and($event->starts_at?->toDateTimeString())->toBe('2026-12-20 21:30:00')
        ->and($event->slug)->toBeNull();
});

test('event creation ignores protected ownership and publication fields', function () {
    $organizer = User::factory()->create();
    $otherUser = User::factory()->create();

    $this->actingAs($organizer)->post(route('events.store'), validEventPayload([
        'user_id' => $otherUser->id,
        'status' => EventStatus::Published->value,
        'slug' => 'slug-injetado',
        'published_at' => now()->toDateTimeString(),
    ]));

    $event = Event::query()->sole();
    expect($event->user_id)->toBe($organizer->id)
        ->and($event->status)->toBe(EventStatus::Draft)
        ->and($event->slug)->toBeNull()
        ->and($event->published_at)->toBeNull();
});

test('event creation validates required fields without requiring coordinates or timezone', function () {
    $organizer = User::factory()->create();

    $response = $this->actingAs($organizer)->post(route('events.store'), [
        'timezone' => 'Fuso/Inexistente',
        'latitude' => 'inválida',
        'longitude' => 'inválida',
    ]);

    $response->assertSessionHasErrors(['title', 'type'])
        ->assertSessionDoesntHaveErrors(['timezone', 'latitude', 'longitude']);
    $this->assertDatabaseEmpty('events');
});

test('organizers cannot update another organizers event', function () {
    $organizer = User::factory()->create();
    $otherEvent = Event::factory()->for(User::factory())->create();

    $response = $this->actingAs($organizer)->patch(
        route('events.update', $otherEvent),
        validEventPayload(['title' => 'Tentativa de alteração']),
    );

    $response->assertForbidden();
    expect($otherEvent->refresh()->title)->not->toBe('Tentativa de alteração');
});

test('organizers can update and archive their own event', function () {
    $organizer = User::factory()->create();
    $event = Event::factory()->for($organizer)->create([
        'timezone' => 'America/Manaus',
        'latitude' => '-3.1190280',
        'longitude' => '-60.0217310',
    ]);

    $updateResponse = $this->actingAs($organizer)->patch(
        route('events.update', $event),
        validEventPayload(['title' => 'Evento atualizado']),
    );

    $updateResponse->assertRedirect();
    $event->refresh();
    expect($event)
        ->title->toBe('Evento atualizado')
        ->timezone->toBe('America/Manaus');
    expect((float) $event->latitude)->toBe(-3.119028)
        ->and((float) $event->longitude)->toBe(-60.021731);
    expect($event->starts_at?->toDateTimeString())->toBe('2026-12-20 22:30:00');

    $deleteResponse = $this->delete(route('events.destroy', $event));

    $deleteResponse->assertRedirectToRoute('events.index');
    $this->assertSoftDeleted($event);
});
