<?php

namespace App\Actions\Guests;

use App\Actions\Gifts\CancelGiftReservation;
use App\Models\AuditLog;
use App\Models\EventGuest;
use App\RsvpStatus;
use Illuminate\Support\Facades\DB;

class UpdateGuestAttendance
{
    public function __construct(private CancelGiftReservation $cancelGiftReservation) {}

    public function confirm(EventGuest $guest, RsvpStatus $status, int $companions): void
    {
        DB::transaction(function () use ($guest, $status, $companions): void {
            $guest->update([
                'rsvp_status' => $status,
                'companions_count' => $status === RsvpStatus::Confirmed ? $companions : 0,
                'confirmed_at' => $status === RsvpStatus::Confirmed ? now() : null,
                'cancelled_at' => $status === RsvpStatus::Declined ? now() : null,
            ]);

            $this->audit($guest, 'guest.rsvp_updated', [
                'status' => $status->value,
                'companions_count' => $status === RsvpStatus::Confirmed ? $companions : 0,
            ]);
        });
    }

    public function cancel(EventGuest $guest, string $reservationHandling): void
    {
        if ($reservationHandling === 'cancel') {
            $guest->giftReservations()
                ->where('status', 'active')
                ->with('gift')
                ->get()
                ->sortBy('gift_id')
                ->each(fn ($reservation) => $this->cancelGiftReservation->handle($guest, $reservation->gift));
        }

        DB::transaction(function () use ($guest, $reservationHandling): void {
            $guest->update([
                'rsvp_status' => RsvpStatus::Declined,
                'companions_count' => 0,
                'confirmed_at' => null,
                'cancelled_at' => now(),
            ]);

            $this->audit($guest, 'guest.rsvp_cancelled', [
                'reservation_handling' => $reservationHandling,
            ]);
        });
    }

    /** @param array<string, bool|int|string> $summary */
    private function audit(EventGuest $guest, string $action, array $summary): void
    {
        AuditLog::query()->create([
            'event_id' => $guest->event_id,
            'actor_type' => 'guest',
            'actor_id' => $guest->id,
            'action' => $action,
            'subject_type' => EventGuest::class,
            'subject_id' => $guest->id,
            'summary' => $summary,
        ]);
    }
}
