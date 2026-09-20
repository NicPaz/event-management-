<?php

namespace App\Actions\Gifts;

use App\GiftReservationStatus;
use App\Models\AuditLog;
use App\Models\EventGuest;
use App\Models\Gift;
use App\Models\GiftReservation;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;

class UpdateGiftReservation
{
    public function handle(EventGuest $guest, Gift $gift, int $finalQuantity): GiftReservation
    {
        if ($finalQuantity < 0) {
            throw ValidationException::withMessages(['quantity' => 'A quantidade não pode ser negativa.']);
        }

        return Cache::lock("gift-reservation:{$gift->id}", 10)->block(
            5,
            fn (): GiftReservation => DB::transaction(
                fn (): GiftReservation => $this->updateInsideTransaction($guest, $gift, $finalQuantity),
                attempts: 5,
            ),
        );
    }

    private function updateInsideTransaction(EventGuest $guest, Gift $gift, int $finalQuantity): GiftReservation
    {
        $lockedGift = Gift::query()->lockForUpdate()->findOrFail($gift->id);

        if ($lockedGift->event_id !== $guest->event_id) {
            throw ValidationException::withMessages(['gift' => 'Este presente não pertence ao evento acessado.']);
        }

        $reservation = GiftReservation::query()
            ->whereBelongsTo($guest, 'guest')
            ->whereBelongsTo($lockedGift, 'gift')
            ->lockForUpdate()
            ->first();
        $currentQuantity = $reservation !== null && $reservation->cancelled_at === null
            ? $reservation->quantity
            : 0;
        $difference = $finalQuantity - $currentQuantity;

        if ($difference > 0) {
            if (! $lockedGift->event->isPubliclyAvailable()
                || ! $lockedGift->event->reservations_open
                || $lockedGift->archived_at !== null) {
                throw ValidationException::withMessages(['quantity' => 'Este presente não aceita novas reservas.']);
            }

            $affected = Gift::query()
                ->whereKey($lockedGift->id)
                ->whereRaw('quantity_total - quantity_reserved >= ?', [$difference])
                ->increment('quantity_reserved', $difference);

            if ($affected !== 1) {
                throw ValidationException::withMessages(['quantity' => 'A quantidade solicitada não está mais disponível.']);
            }
        } elseif ($difference < 0) {
            Gift::query()->whereKey($lockedGift->id)->decrement('quantity_reserved', abs($difference));
        }

        if ($reservation === null) {
            $reservation = new GiftReservation;
            $reservation->guest()->associate($guest);
            $reservation->gift()->associate($lockedGift);
        }

        $reservation->fill([
            'quantity' => $finalQuantity,
            'status' => $finalQuantity > 0 ? GiftReservationStatus::Active : GiftReservationStatus::Cancelled,
            'cancelled_at' => $finalQuantity > 0 ? null : now(),
        ])->save();

        AuditLog::query()->create([
            'event_id' => $guest->event_id,
            'actor_type' => 'guest',
            'actor_id' => $guest->id,
            'action' => $finalQuantity > 0 ? 'gift.reservation_updated' : 'gift.reservation_cancelled',
            'subject_type' => Gift::class,
            'subject_id' => $lockedGift->id,
            'summary' => ['previous_quantity' => $currentQuantity, 'final_quantity' => $finalQuantity],
        ]);

        return $reservation;
    }
}
