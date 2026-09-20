<?php

use App\Models\Event;
use App\Models\Gift;
use App\Models\User;

test('organizers manage only gifts from their own event', function () {
    $organizer = User::factory()->create();
    $event = Event::factory()->for($organizer)->create();

    $this->actingAs($organizer)->post(route('events.gifts.store', $event), [
        'name' => 'Jogo de panelas',
        'description' => 'Fundo triplo',
        'purchase_url' => 'https://example.com/panelas',
        'quantity_total' => 2,
    ])->assertRedirect();

    $gift = Gift::query()->sole();
    expect($gift->event_id)->toBe($event->id)
        ->and($gift->quantity_reserved)->toBe(0);

    $otherOrganizer = User::factory()->create();
    $this->actingAs($otherOrganizer)->patch(
        route('events.gifts.update', [$event, $gift]),
        ['name' => 'Alterado', 'quantity_total' => 2],
    )->assertForbidden();
    expect($gift->refresh()->name)->toBe('Jogo de panelas');
});

test('total quantity cannot be reduced below reserved units', function () {
    $organizer = User::factory()->create();
    $event = Event::factory()->for($organizer)->create();
    $gift = Gift::factory()->for($event)->create([
        'quantity_total' => 5,
        'quantity_reserved' => 3,
    ]);

    $this->actingAs($organizer)->patch(route('events.gifts.update', [$event, $gift]), [
        'name' => $gift->name,
        'quantity_total' => 2,
    ])->assertSessionHasErrors('quantity_total');

    expect($gift->refresh()->quantity_total)->toBe(5);
});

test('gift validation keeps the submitted values for the create modal', function () {
    $organizer = User::factory()->create();
    $event = Event::factory()->for($organizer)->create();

    $this->actingAs($organizer)->from(route('events.gifts.index', $event))->post(
        route('events.gifts.store', $event),
        [
            'name' => 'Presente ainda preenchido',
            'description' => 'Descrição preservada no modal',
            'purchase_url' => 'endereço inválido',
            'quantity_total' => 0,
        ],
    )->assertRedirect(route('events.gifts.index', $event))
        ->assertSessionHasErrors(['purchase_url', 'quantity_total'])
        ->assertSessionHasInput('name', 'Presente ainda preenchido')
        ->assertSessionHasInput('description', 'Descrição preservada no modal');

    $this->assertDatabaseEmpty('gifts');
});

test('archiving preserves gifts and their reservation history', function () {
    $organizer = User::factory()->create();
    $event = Event::factory()->for($organizer)->create();
    $gift = Gift::factory()->for($event)->create();

    $this->actingAs($organizer)
        ->delete(route('events.gifts.destroy', [$event, $gift]))
        ->assertRedirect();

    expect($gift->refresh()->archived_at)->not->toBeNull();
});
