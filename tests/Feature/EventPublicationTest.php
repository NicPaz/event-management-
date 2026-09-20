<?php

use App\EventStatus;
use App\Models\Event;
use App\Models\User;
use Inertia\Testing\AssertableInertia as Assert;

test('draft events are private but owners can preview them', function () {
    $organizer = User::factory()->create();
    $event = Event::factory()->for($organizer)->create(['slug' => 'evento-privado']);

    $this->get(route('public.events.show', $event->slug))->assertNotFound();

    $this->actingAs($organizer)
        ->get(route('events.preview', $event))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->component('events/show')
            ->where('preview', true)
            ->where('canCustomize', true)
            ->where('showGuestActions', false)
            ->where('event.title', $event->title)
        );
});

test('another organizer cannot preview or publish an event', function () {
    $organizer = User::factory()->create();
    $event = Event::factory()->for(User::factory())->create();

    $this->actingAs($organizer)->get(route('events.preview', $event))->assertForbidden();
    $this->post(route('events.publication.store', $event))->assertForbidden();
    expect($event->refresh()->status)->toBe(EventStatus::Draft);
});

test('publication requires date venue and address', function () {
    $organizer = User::factory()->create();
    $event = Event::factory()->for($organizer)->create([
        'starts_at' => null,
        'venue_name' => null,
        'address' => null,
    ]);

    $response = $this->actingAs($organizer)->post(route('events.publication.store', $event));

    $response->assertSessionHasErrors(['starts_at', 'venue_name', 'address']);
    expect($event->refresh()->status)->toBe(EventStatus::Draft)
        ->and($event->slug)->toBeNull();
});

test('published events receive a stable slug and become public', function () {
    $organizer = User::factory()->create();
    $event = Event::factory()->for($organizer)->create(['title' => 'Celebração da Ana']);

    $this->actingAs($organizer)
        ->post(route('events.publication.store', $event))
        ->assertRedirect();

    $event->refresh();
    expect($event->status)->toBe(EventStatus::Published)
        ->and($event->slug)->toBe('celebracao-da-ana-'.$event->id)
        ->and($event->published_at)->not->toBeNull();

    $this->app['auth']->logout();

    $this->get(route('public.events.show', $event->slug))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->component('events/show')
            ->where('preview', false)
            ->where('canCustomize', false)
            ->where('showGuestActions', true)
            ->where('event.title', 'Celebração da Ana')
            ->missing('event.user')
            ->missing('event.user_id')
        );

    $this->actingAs($organizer)
        ->get(route('public.events.show', $event->slug))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->where('canCustomize', true)
            ->where('showGuestActions', false)
        );

    $originalSlug = $event->slug;
    $event->title = 'Novo título';
    $event->save();
    $this->post(route('events.publication.store', $event));

    expect($event->refresh()->slug)->toBe($originalSlug);
});

test('closed events remain public in read only mode and can be reopened', function () {
    $organizer = User::factory()->create();
    $event = Event::factory()->for($organizer)->published()->create();

    $this->actingAs($organizer)
        ->post(route('events.closure.store', $event))
        ->assertRedirect();

    $event->refresh();
    expect($event->status)->toBe(EventStatus::Closed)
        ->and($event->rsvp_open)->toBeFalse()
        ->and($event->reservations_open)->toBeFalse();
    $this->get(route('public.events.show', $event->slug))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page->where('event.isReadOnly', true));

    $this->post(route('events.publication.store', $event))
        ->assertSessionHasErrors('event');
    expect($event->refresh()->status)->toBe(EventStatus::Closed);

    $this->delete(route('events.closure.destroy', $event))->assertRedirect();
    expect($event->refresh()->status)->toBe(EventStatus::Published)
        ->and($event->rsvp_open)->toBeTrue()
        ->and($event->reservations_open)->toBeTrue();
});

test('suspended events and organizer accounts are absent from the public page', function () {
    $event = Event::factory()->published()->create(['suspended_at' => now()]);
    $accountEvent = Event::factory()
        ->for(User::factory()->suspended())
        ->published()
        ->create();

    $this->get(route('public.events.show', $event->slug))->assertNotFound();
    $this->get(route('public.events.show', $accountEvent->slug))->assertNotFound();
});
