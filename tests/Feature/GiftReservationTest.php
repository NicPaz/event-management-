<?php

use App\Actions\Gifts\CancelGiftReservation;
use App\Actions\Gifts\ReserveGift;
use App\GiftReservationStatus;
use App\Models\Event;
use App\Models\EventGuest;
use App\Models\Gift;
use App\Models\GiftReservation;
use Illuminate\Validation\ValidationException;

test('final quantities are idempotent and keep the gift counter synchronized', function () {
    $event = Event::factory()->published()->create();
    $guest = EventGuest::factory()->for($event)->create();
    $gift = Gift::factory()->for($event)->create(['quantity_total' => 5]);
    $reserve = app(ReserveGift::class);

    $reserve->handle($guest, $gift, 2);
    $reserve->handle($guest, $gift, 2);
    $reserve->handle($guest, $gift, 4);

    $reservation = GiftReservation::query()->sole();
    expect($reservation->quantity)->toBe(4)
        ->and($reservation->status)->toBe(GiftReservationStatus::Active)
        ->and($gift->refresh()->quantity_reserved)->toBe(4);
});

test('reservation beyond availability rolls back every change', function () {
    $event = Event::factory()->published()->create();
    $guest = EventGuest::factory()->for($event)->create();
    $gift = Gift::factory()->for($event)->create(['quantity_total' => 1]);

    app(ReserveGift::class)->handle($guest, $gift, 1);

    expect(fn () => app(ReserveGift::class)->handle($guest, $gift, 2))
        ->toThrow(ValidationException::class);
    expect($gift->refresh()->quantity_reserved)->toBe(1)
        ->and(GiftReservation::query()->sole()->quantity)->toBe(1);
});

test('guests cannot reserve a gift from another event', function () {
    $guest = EventGuest::factory()->for(Event::factory()->published())->create();
    $gift = Gift::factory()->for(Event::factory()->published())->create();

    expect(fn () => app(ReserveGift::class)->handle($guest, $gift, 1))
        ->toThrow(ValidationException::class);

    expect($gift->refresh()->quantity_reserved)->toBe(0);
    $this->assertDatabaseEmpty('gift_reservations');
});

test('repeated cancellation releases units only once', function () {
    $event = Event::factory()->published()->create();
    $guest = EventGuest::factory()->for($event)->create();
    $gift = Gift::factory()->for($event)->create(['quantity_total' => 3]);
    app(ReserveGift::class)->handle($guest, $gift, 2);

    app(CancelGiftReservation::class)->handle($guest, $gift);
    app(CancelGiftReservation::class)->handle($guest, $gift);

    $reservation = GiftReservation::query()->sole();
    expect($gift->refresh()->quantity_reserved)->toBe(0)
        ->and($reservation->refresh()->quantity)->toBe(0)
        ->and($reservation->status)->toBe(GiftReservationStatus::Cancelled);
});
