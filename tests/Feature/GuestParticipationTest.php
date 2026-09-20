<?php

use App\Actions\Gifts\ReserveGift;
use App\Models\AuditLog;
use App\Models\Event;
use App\Models\EventGuest;
use App\Models\Gift;
use App\Models\GiftReservation;
use App\RsvpStatus;
use Illuminate\Testing\TestResponse;
use Inertia\Testing\AssertableInertia as Assert;

function identifyGuest(Event $event, array $overrides = []): TestResponse
{
    return test()->post(route('public.events.identity.store', $event), [
        'name' => 'João da Silva',
        'phone' => '(11) 99999-1234',
        ...$overrides,
    ]);
}

test('first identification creates one guest and grants event scoped session access', function () {
    $event = Event::factory()->published()->create();

    $response = identifyGuest($event);

    $guest = EventGuest::query()->sole();
    $response->assertRedirectToRoute('public.events.participation', $event)
        ->assertSessionHas("guest_access.{$event->id}.guest_id", $guest->id);
    expect($guest->name)->toBe('João da Silva')
        ->and($guest->name_normalized)->toBe('joao da silva')
        ->and($guest->phone_normalized)->toBe('5511999991234')
        ->and($guest->rsvp_status)->toBe(RsvpStatus::Unanswered);

    $this->get(route('public.events.participation', $event))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->component('events/participation')
            ->where('guest.name', 'João da Silva')
            ->missing('guest.phone')
            ->missing('guest.phone_normalized')
        );

    $this->get(route('public.events.show', $event->slug))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->where('guest.name', 'João da Silva')
            ->where('guest.reservations', [])
        );
});

test('identifying from a gift reserves it and returns to the event page', function () {
    $event = Event::factory()->published()->create();
    $gift = Gift::factory()->for($event)->create(['quantity_total' => 2]);

    $response = identifyGuest($event, ['gift_id' => $gift->id]);

    $guest = EventGuest::query()->sole();
    $reservation = GiftReservation::query()->sole();
    $response->assertRedirectToRoute('public.events.show', $event->slug)
        ->assertSessionHas("guest_access.{$event->id}.guest_id", $guest->id);
    expect($reservation->event_guest_id)->toBe($guest->id)
        ->and($reservation->gift_id)->toBe($gift->id)
        ->and($reservation->quantity)->toBe(1)
        ->and($gift->refresh()->quantity_reserved)->toBe(1);

    $this->get(route('public.events.show', $event->slug))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->where("guest.reservations.{$gift->id}", 1)
        );
});

test('gift identification rejects a gift from another event', function () {
    $event = Event::factory()->published()->create();
    $otherGift = Gift::factory()->for(Event::factory()->published())->create();

    identifyGuest($event, ['gift_id' => $otherGift->id])
        ->assertSessionHasErrors('gift_id');

    $this->assertDatabaseEmpty('event_guests');
    $this->assertDatabaseEmpty('gift_reservations');
});

test('an identified guest reserves directly from the event page', function () {
    $event = Event::factory()->published()->create();
    $gift = Gift::factory()->for($event)->create(['quantity_total' => 2]);
    identifyGuest($event)->assertRedirect();

    $this->from(route('public.events.show', $event->slug))
        ->patch(route('public.events.gifts.reservation.update', [$event->slug, $gift]), [
            'quantity' => 1,
        ])
        ->assertRedirect(route('public.events.show', $event->slug));

    expect(GiftReservation::query()->sole()->quantity)->toBe(1)
        ->and($gift->refresh()->quantity_reserved)->toBe(1);
});

test('reserving during a new identification keeps an existing larger quantity', function () {
    $event = Event::factory()->published()->create();
    $gift = Gift::factory()->for($event)->create(['quantity_total' => 4]);
    identifyGuest($event)->assertRedirect();
    $guest = EventGuest::query()->sole();
    app(ReserveGift::class)->handle($guest, $gift, 2);
    $this->delete(route('public.events.identity.destroy', $event))->assertRedirect();

    identifyGuest($event, ['gift_id' => $gift->id])->assertRedirectToRoute(
        'public.events.show',
        $event->slug,
    );

    expect(GiftReservation::query()->sole()->quantity)->toBe(2)
        ->and($gift->refresh()->quantity_reserved)->toBe(2);
});

test('a reservation request without guest identification is rejected', function () {
    $event = Event::factory()->published()->create();
    $gift = Gift::factory()->for($event)->create();

    $this->patch(route('public.events.gifts.reservation.update', [$event->slug, $gift]), [
        'quantity' => 1,
    ])->assertSessionHasErrors('identity');

    $this->assertDatabaseEmpty('gift_reservations');
    expect($gift->refresh()->quantity_reserved)->toBe(0);
});

test('returning with equivalent name and phone format reuses the guest', function () {
    $event = Event::factory()->published()->create();
    identifyGuest($event)->assertRedirect();
    $this->delete(route('public.events.identity.destroy', $event))->assertRedirect();

    identifyGuest($event, [
        'name' => '  JOAO   DA SILVA ',
        'phone' => '+55 11 99999-1234',
    ])->assertRedirect()->assertSessionDoesntHaveErrors();

    expect(EventGuest::query()->count())->toBe(1);
});

test('different name for an existing phone does not grant access or create a duplicate', function () {
    $event = Event::factory()->published()->create();
    identifyGuest($event)->assertRedirect();
    $this->delete(route('public.events.identity.destroy', $event))->assertRedirect();

    $response = identifyGuest($event, ['name' => 'Outra Pessoa']);

    $response->assertSessionHasErrors('identity')
        ->assertSessionMissing("guest_access.{$event->id}");
    expect(EventGuest::query()->count())->toBe(1);
});

test('guest access from one event is not inherited by another event', function () {
    $firstEvent = Event::factory()->published()->create();
    $secondEvent = Event::factory()->published()->create();
    identifyGuest($firstEvent)->assertRedirect();

    $this->get(route('public.events.participation', $secondEvent))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page->where('guest', null));
    $this->assertDatabaseMissing('event_guests', ['event_id' => $secondEvent->id]);
});

test('confirming again updates the same participation and organizer metrics', function () {
    $event = Event::factory()->published()->create();
    identifyGuest($event)->assertRedirect();

    $this->patch(route('public.events.attendance.update', $event), [
        'status' => 'confirmed',
        'companions_count' => 1,
    ])->assertRedirectToRoute('public.events.show', $event->slug);
    $this->patch(route('public.events.attendance.update', $event), [
        'status' => 'confirmed',
        'companions_count' => 3,
    ])->assertRedirect();

    $guest = EventGuest::query()->sole();
    expect($guest->rsvp_status)->toBe(RsvpStatus::Confirmed)
        ->and($guest->companions_count)->toBe(3)
        ->and(EventGuest::query()->count())->toBe(1);

    $this->actingAs($event->user)
        ->get(route('events.show', $event))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->where('attendanceMetrics.confirmedGuests', 1)
            ->where('attendanceMetrics.companions', 3)
            ->where('attendanceMetrics.expectedTotal', 4)
        );
});

test('cancelling presence requires and audits the reservation choice', function () {
    $event = Event::factory()->published()->create();
    identifyGuest($event)->assertRedirect();
    $this->patch(route('public.events.attendance.update', $event), [
        'status' => 'confirmed',
        'companions_count' => 2,
    ])->assertRedirect();
    $guest = EventGuest::query()->sole();
    $gift = Gift::factory()->for($event)->create(['quantity_total' => 2]);
    app(ReserveGift::class)->handle($guest, $gift, 1);

    $this->delete(route('public.events.attendance.destroy', $event), [])
        ->assertSessionHasErrors('reservation_handling');
    $this->delete(route('public.events.attendance.destroy', $event), [
        'reservation_handling' => 'cancel',
    ])->assertRedirectToRoute('public.events.show', $event->slug);

    $guest->refresh();
    $audit = AuditLog::query()->where('action', 'guest.rsvp_cancelled')->sole();
    expect($guest->rsvp_status)->toBe(RsvpStatus::Declined)
        ->and($guest->companions_count)->toBe(0)
        ->and($guest->cancelled_at)->not->toBeNull()
        ->and($gift->refresh()->quantity_reserved)->toBe(0)
        ->and($audit->summary)->toBe(['reservation_handling' => 'cancel']);
});

test('declining through the attendance choice requires gift handling and can keep reservations', function () {
    $event = Event::factory()->published()->create();
    identifyGuest($event)->assertRedirect();
    $guest = EventGuest::query()->sole();
    $gift = Gift::factory()->for($event)->create(['quantity_total' => 2]);
    app(ReserveGift::class)->handle($guest, $gift, 1);

    $this->patch(route('public.events.attendance.update', $event), [
        'status' => 'declined',
        'companions_count' => 0,
    ])->assertSessionHasErrors('reservation_handling');

    $this->patch(route('public.events.attendance.update', $event), [
        'status' => 'declined',
        'companions_count' => 0,
        'reservation_handling' => 'keep',
    ])->assertRedirectToRoute('public.events.show', $event->slug);

    $audit = AuditLog::query()->where('action', 'guest.rsvp_cancelled')->sole();
    expect($guest->refresh()->rsvp_status)->toBe(RsvpStatus::Declined)
        ->and($guest->companions_count)->toBe(0)
        ->and($gift->refresh()->quantity_reserved)->toBe(1)
        ->and($audit->summary)->toBe(['reservation_handling' => 'keep']);
});

test('declining through the attendance choice can release gift reservations', function () {
    $event = Event::factory()->published()->create();
    identifyGuest($event)->assertRedirect();
    $guest = EventGuest::query()->sole();
    $gift = Gift::factory()->for($event)->create(['quantity_total' => 2]);
    app(ReserveGift::class)->handle($guest, $gift, 1);

    $this->patch(route('public.events.attendance.update', $event), [
        'status' => 'declined',
        'companions_count' => 0,
        'reservation_handling' => 'cancel',
    ])->assertRedirectToRoute('public.events.show', $event->slug);

    expect($guest->refresh()->rsvp_status)->toBe(RsvpStatus::Declined)
        ->and($gift->refresh()->quantity_reserved)->toBe(0)
        ->and($guest->giftReservations()->where('status', 'active')->exists())->toBeFalse();
});

test('session version changes revoke previous guest access', function () {
    $event = Event::factory()->published()->create();
    identifyGuest($event)->assertRedirect();
    $guest = EventGuest::query()->sole();
    $guest->increment('session_version');

    $this->get(route('public.events.participation', $event))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page->where('guest', null))
        ->assertSessionMissing("guest_access.{$event->id}");
});

test('closed events allow consultation but not new guest identification', function () {
    $event = Event::factory()->published()->closed()->create();

    $this->get(route('public.events.participation', $event))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->where('guest', null)
            ->where('canRespond', false)
        );
    identifyGuest($event)->assertSessionHasErrors('identity');
    $this->assertDatabaseEmpty('event_guests');
});

test('identification rejects invalid brazilian phone numbers', function (string $phone) {
    $event = Event::factory()->published()->create();

    identifyGuest($event, ['phone' => $phone])->assertSessionHasErrors('phone');

    $this->assertDatabaseEmpty('event_guests');
})->with([
    'without DDD' => '99999-1234',
    'invalid DDD' => '(01) 99999-1234',
    'invalid subscriber prefix' => '(11) 19999-1234',
]);
