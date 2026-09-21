<?php

use App\GiftReservationStatus;
use App\Models\AuditLog;
use App\Models\Event;
use App\Models\EventGuest;
use App\Models\Gift;
use App\Models\GiftReservation;
use App\Models\User;
use App\RsvpStatus;
use Inertia\Testing\AssertableInertia as Assert;

test('organizers see attendance totals and active reservations for their event', function () {
    $organizer = User::factory()->create();
    $event = Event::factory()->for($organizer)->create();
    $confirmedGuest = EventGuest::factory()->for($event)->confirmed(2)->create([
        'name' => 'Ana Presente',
        'name_normalized' => 'ana presente',
        'phone_normalized' => '5511999999999',
    ]);
    EventGuest::factory()->for($event)->create(['rsvp_status' => RsvpStatus::Declined]);
    $gift = Gift::factory()->for($event)->create(['name' => 'Cafeteira']);
    GiftReservation::factory()->for($confirmedGuest, 'guest')->for($gift)->create(['quantity' => 2]);

    $response = $this->actingAs($organizer)->get(route('events.guests.index', $event));

    $response->assertOk()->assertInertia(fn (Assert $page) => $page
        ->component('dashboard/events/guests')
        ->where('event.id', $event->id)
        ->where('metrics.confirmedGuests', 1)
        ->where('metrics.companions', 2)
        ->where('metrics.expectedTotal', 3)
        ->where('metrics.declinedGuests', 1)
        ->where('metrics.reservedUnits', 2)
        ->has('guests.data', 2)
        ->where('guests.data.1.name', 'Ana Presente')
        ->where('guests.data.1.reservations.0.giftName', 'Cafeteira')
    );
});

test('guest search is limited to the organizers event and ignores cancelled reservations', function () {
    $organizer = User::factory()->create();
    $event = Event::factory()->for($organizer)->create();
    $guest = EventGuest::factory()->for($event)->create([
        'name' => 'Beatriz Souza',
        'name_normalized' => 'beatriz souza',
        'phone_normalized' => '5511987654321',
    ]);
    $gift = Gift::factory()->for($event)->create();
    GiftReservation::factory()->for($guest, 'guest')->for($gift)->create([
        'status' => GiftReservationStatus::Cancelled,
        'cancelled_at' => now(),
    ]);
    EventGuest::factory()->for(Event::factory())->create([
        'name' => 'Beatriz Privada',
        'name_normalized' => 'beatriz privada',
    ]);

    $response = $this->actingAs($organizer)->get(route('events.guests.index', [
        'event' => $event,
        'search' => '98765',
    ]));

    $response->assertOk()->assertInertia(fn (Assert $page) => $page
        ->has('guests.data', 1)
        ->where('guests.data.0.name', 'Beatriz Souza')
        ->has('guests.data.0.reservations', 0)
    );
});

test('organizers can correct a guest and identity changes revoke old guest sessions', function () {
    $organizer = User::factory()->create();
    $event = Event::factory()->for($organizer)->create();
    $guest = EventGuest::factory()->for($event)->create([
        'name' => 'Nome Antigo',
        'name_normalized' => 'nome antigo',
        'phone_normalized' => '5511999999999',
        'session_version' => 3,
    ]);
    $gift = Gift::factory()->for($event)->create(['name' => 'Presente preservado']);
    $reservation = GiftReservation::factory()->for($guest, 'guest')->for($gift)->create();

    $response = $this->actingAs($organizer)->patch(route('events.guests.update', [$event, $guest]), [
        'name' => 'Nome Corrigido',
        'phone' => '(11) 98888-7777',
        'status' => RsvpStatus::Confirmed->value,
        'companions_count' => 2,
    ]);

    $response->assertRedirect();
    expect($guest->refresh())
        ->name->toBe('Nome Corrigido')
        ->phone_normalized->toBe('5511988887777')
        ->rsvp_status->toBe(RsvpStatus::Confirmed)
        ->companions_count->toBe(2)
        ->session_version->toBe(4)
        ->confirmed_at->not->toBeNull();
    expect(AuditLog::query()->where('action', 'organizer.guest_updated')->where('subject_id', $guest->id)->exists())->toBeTrue();
    expect($reservation->refresh()->event_guest_id)->toBe($guest->id);

    $this->get(route('events.guests.index', $event))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->where('metrics.confirmedGuests', 1)
            ->where('metrics.companions', 2)
            ->where('metrics.expectedTotal', 3)
            ->where('guests.data.0.id', $guest->id)
            ->where('guests.data.0.name', 'Nome Corrigido')
            ->where('guests.data.0.status', RsvpStatus::Confirmed->value)
            ->where('guests.data.0.companionsCount', 2)
            ->where('guests.data.0.reservations.0.giftName', 'Presente preservado')
        );
});

test('organizers cannot view or update guests from another event', function () {
    $organizer = User::factory()->create();
    $event = Event::factory()->for($organizer)->create();
    $otherEvent = Event::factory()->create();
    $otherGuest = EventGuest::factory()->for($otherEvent)->create();

    $this->actingAs($organizer)->get(route('events.guests.index', $otherEvent))->assertForbidden();
    $this->patch(route('events.guests.update', [$event, $otherGuest]), [
        'name' => 'Tentativa',
        'phone' => '(11) 99999-9999',
        'status' => RsvpStatus::Confirmed->value,
        'companions_count' => 0,
    ])->assertNotFound();
});

test('guest corrections reject a phone already used in the event', function () {
    $organizer = User::factory()->create();
    $event = Event::factory()->for($organizer)->create();
    $guest = EventGuest::factory()->for($event)->create(['phone_normalized' => '5511999999999']);
    EventGuest::factory()->for($event)->create(['phone_normalized' => '5511988887777']);

    $this->actingAs($organizer)->patch(route('events.guests.update', [$event, $guest]), [
        'name' => $guest->name,
        'phone' => '(11) 98888-7777',
        'status' => RsvpStatus::Unanswered->value,
        'companions_count' => 0,
    ])->assertSessionHasErrors('phone');

    expect($guest->refresh()->phone_normalized)->toBe('5511999999999');
});
