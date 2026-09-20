<?php

use App\Models\Event;
use App\Models\User;
use Inertia\Testing\AssertableInertia as Assert;

test('guests are redirected when opening the event dashboard', function () {
    $response = $this->get(route('events.index'));

    $response->assertRedirect(route('login'));
});

test('organizers see only their own events', function () {
    $organizer = User::factory()->create();
    $ownEvent = Event::factory()->for($organizer)->create(['title' => 'Meu evento']);
    Event::factory()->for(User::factory())->create(['title' => 'Evento privado']);

    $response = $this->actingAs($organizer)->get(route('events.index'));

    $response->assertOk()->assertInertia(fn (Assert $page) => $page
        ->component('dashboard/events/index')
        ->has('events', 1)
        ->where('events.0.id', $ownEvent->id)
        ->where('events.0.title', 'Meu evento')
    );
});

test('organizers can open their own event', function () {
    $organizer = User::factory()->create();
    $event = Event::factory()->for($organizer)->create();

    $response = $this->actingAs($organizer)->get(route('events.show', $event));

    $response->assertOk()->assertInertia(fn (Assert $page) => $page
        ->component('dashboard/events/show')
        ->where('event.id', $event->id)
    );
});

test('organizers are forbidden from opening another organizers event', function () {
    $organizer = User::factory()->create();
    $otherEvent = Event::factory()->for(User::factory())->create();

    $response = $this->actingAs($organizer)->get(route('events.show', $otherEvent));

    $response->assertForbidden();
});

test('suspended organizers are logged out of protected pages', function () {
    $organizer = User::factory()->suspended()->create();

    $response = $this->actingAs($organizer)->get(route('dashboard'));

    $response
        ->assertRedirect(route('login'))
        ->assertSessionHasErrors('email');
    $this->assertGuest();
});
