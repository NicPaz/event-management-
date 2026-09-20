<?php

use App\Models\Event;
use App\Models\User;
use Inertia\Testing\AssertableInertia as Assert;

test('a single event is selected automatically in gifts and guests areas', function () {
    $organizer = User::factory()->create();
    $event = Event::factory()->for($organizer)->create(['title' => 'Evento único']);

    $this->actingAs($organizer)->get(route('gifts.index'))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->component('dashboard/events/gifts')
            ->where('event.id', $event->id)
            ->where('event.title', 'Evento único')
            ->has('events', 1)
        );

    $this->get(route('guests.index'))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->component('dashboard/events/guests')
            ->where('event.id', $event->id)
            ->has('events', 1)
        );
});

test('the selected event is respected across organizer areas', function () {
    $organizer = User::factory()->create();
    Event::factory()->for($organizer)->create(['title' => 'Primeiro']);
    $selected = Event::factory()->for($organizer)->create(['title' => 'Selecionado']);

    $this->actingAs($organizer)->get(route('gifts.index', ['event' => $selected->id]))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page->where('event.id', $selected->id));

    $this->get(route('guests.index', ['event' => $selected->id]))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page->where('event.id', $selected->id));
});

test('organizers cannot select another organizers event by query parameter', function (string $routeName) {
    $organizer = User::factory()->create();
    $otherEvent = Event::factory()->for(User::factory())->create();

    $this->actingAs($organizer)
        ->get(route($routeName, ['event' => $otherEvent->id]))
        ->assertNotFound();
})->with(['gifts.index', 'guests.index']);

test('organizer areas render an empty state without events', function () {
    $organizer = User::factory()->create();

    $this->actingAs($organizer)->get(route('gifts.index'))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->where('event', null)
            ->has('events', 0)
            ->has('gifts', 0)
        );
});
