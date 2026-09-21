<?php

use App\EventStatus;
use App\Models\Event;
use App\Models\Gift;
use App\Models\User;
use Inertia\Testing\AssertableInertia as Assert;

function creationEventPayload(array $overrides = []): array
{
    return [
        'title' => 'Chá da Marina',
        'type' => 'kitchen_tea',
        'starts_at' => '2026-11-15T16:00',
        'venue_name' => 'Salão de festas do condomínio',
        'address' => 'Rua das Acácias, 120',
        'welcome_text' => 'Vamos celebrar juntos.',
        'instructions' => 'Use a entrada social.',
        ...$overrides,
    ];
}

test('organizers complete the creation flow without duplicating the draft', function () {
    $organizer = User::factory()->create();

    $response = $this->actingAs($organizer)->post(
        route('events.store'),
        creationEventPayload(),
    );

    $event = Event::query()->sole();
    $response->assertRedirect(route('events.gifts.index', [
        'event' => $event,
        'creation' => 1,
    ]));
    expect($event->status)->toBe(EventStatus::Draft)
        ->and($event->theme()->exists())->toBeTrue();

    $this->get(route('events.gifts.index', ['event' => $event, 'creation' => 1]))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->component('dashboard/events/gifts')
            ->where('creationFlow', true)
            ->where('event.id', $event->id)
            ->has('gifts', 0)
        );

    $this->post(route('events.gifts.store', $event), [
        'name' => 'Jogo de taças',
        'quantity_total' => 1,
    ])->assertRedirect();

    $this->get(route('events.appearance.edit', ['event' => $event, 'creation' => 1]))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->component('dashboard/events/appearance')
            ->where('creationFlow', true)
            ->where('event.venueName', 'Salão de festas do condomínio')
            ->has('event.gifts', 1)
        );

    $this->get(route('events.creation.show', $event))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->component('dashboard/events/finalization')
            ->where('event.id', $event->id)
            ->where('event.venueName', 'Salão de festas do condomínio')
            ->has('event.gifts', 1)
        );

    $this->post(route('events.creation.store', $event), [
        'decision' => 'private',
    ])->assertRedirectToRoute('events.creation.complete', $event);

    expect(Event::query()->count())->toBe(1)
        ->and(Gift::query()->sole()->event_id)->toBe($event->id)
        ->and($event->refresh()->status)->toBe(EventStatus::Draft)
        ->and($event->slug)->toBeNull()
        ->and($event->published_at)->toBeNull();

    $this->get(route('events.creation.complete', $event))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->component('dashboard/events/creation-complete')
            ->where('event.isPublished', false)
            ->where('event.publicUrl', null)
        );
});

test('organizers can return to saved information while creating an event', function () {
    $organizer = User::factory()->create();
    $event = Event::factory()->for($organizer)->create([
        'title' => 'Título salvo',
        'venue_name' => 'Local preservado',
    ]);

    $this->actingAs($organizer)
        ->get(route('events.edit', ['event' => $event, 'creation' => 1]))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->component('dashboard/events/edit')
            ->where('creationFlow', true)
            ->where('event.title', 'Título salvo')
            ->where('event.venueName', 'Local preservado')
        );

    $this->patch(
        route('events.update', ['event' => $event, 'creation' => 1]),
        creationEventPayload(['title' => 'Título atualizado']),
    )->assertRedirect(route('events.gifts.index', [
        'event' => $event,
        'creation' => 1,
    ]));

    expect(Event::query()->count())->toBe(1)
        ->and($event->refresh()->title)->toBe('Título atualizado');
});

test('publishing from finalization makes the saved event public', function () {
    $organizer = User::factory()->create();
    $event = Event::factory()->for($organizer)->create([
        'title' => 'Celebração pública',
        'venue_name' => 'Espaço Celebre',
    ]);

    $this->actingAs($organizer)
        ->post(route('events.creation.store', $event), ['decision' => 'publish'])
        ->assertRedirectToRoute('events.creation.complete', $event)
        ->assertSessionHas('success', 'Seu evento foi publicado!');

    $event->refresh();
    expect($event->status)->toBe(EventStatus::Published)
        ->and($event->slug)->not->toBeNull()
        ->and($event->published_at)->not->toBeNull();

    $this->get(route('events.creation.complete', $event))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->where('event.isPublished', true)
            ->where('event.publicUrl', route('public.events.show', $event->slug))
        );

    $this->app['auth']->logout();
    $this->get(route('public.events.show', $event->slug))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->where('event.venueName', 'Espaço Celebre')
        );
});

test('keeping private never unpublishes an existing event', function () {
    $organizer = User::factory()->create();
    $event = Event::factory()->for($organizer)->published()->create();
    $publishedAt = $event->published_at;

    $this->actingAs($organizer)
        ->post(route('events.creation.store', $event), ['decision' => 'private'])
        ->assertRedirectToRoute('events.creation.complete', $event);

    expect($event->refresh()->status)->toBe(EventStatus::Published)
        ->and($event->published_at?->equalTo($publishedAt))->toBeTrue();
});

test('creation finalization rejects invalid decisions and other organizers', function () {
    $organizer = User::factory()->create();
    $event = Event::factory()->for($organizer)->create();

    $this->actingAs($organizer)
        ->post(route('events.creation.store', $event), ['decision' => 'unpublish'])
        ->assertSessionHasErrors('decision');
    expect($event->refresh()->status)->toBe(EventStatus::Draft);

    $otherOrganizer = User::factory()->create();
    $this->actingAs($otherOrganizer)
        ->get(route('events.creation.show', $event))
        ->assertForbidden();
    $this->post(route('events.creation.store', $event), ['decision' => 'publish'])
        ->assertForbidden();
    $this->get(route('events.creation.complete', $event))->assertForbidden();
    expect($event->refresh()->status)->toBe(EventStatus::Draft);
});

test('event list returns the private preview or public invitation destination from backend state', function () {
    $organizer = User::factory()->create();
    $draft = Event::factory()->for($organizer)->create(['slug' => 'rascunho-antigo']);
    $published = Event::factory()->for($organizer)->published()->create();

    $this->actingAs($organizer)
        ->get(route('events.index'))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->where('events.0.id', $published->id)
            ->where('events.0.invitationUrl', route('public.events.show', $published->slug))
            ->where('events.1.id', $draft->id)
            ->where('events.1.publicUrl', null)
            ->where('events.1.invitationUrl', route('events.preview', $draft))
        );

    $this->get(route('public.events.show', $draft->slug))->assertNotFound();
});
