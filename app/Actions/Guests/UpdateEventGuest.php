<?php

namespace App\Actions\Guests;

use App\Models\AuditLog;
use App\Models\EventGuest;
use App\Models\User;
use App\RsvpStatus;
use Illuminate\Support\Facades\DB;

class UpdateEventGuest
{
    public function __construct(private NormalizeGuestIdentity $normalizer) {}

    public function handle(EventGuest $guest, User $actor, string $name, string $phone, RsvpStatus $status, int $companionsCount): void
    {
        DB::transaction(function () use ($guest, $actor, $name, $phone, $status, $companionsCount): void {
            $normalizedName = $this->normalizer->name($name);
            $normalizedPhone = $this->normalizer->phone($phone);
            $identityChanged = $guest->name_normalized !== $normalizedName || $guest->phone_normalized !== $normalizedPhone;
            $companionsCount = $status === RsvpStatus::Confirmed ? $companionsCount : 0;

            $guest->forceFill([
                'name' => str($name)->squish()->toString(),
                'name_normalized' => $normalizedName,
                'phone_normalized' => $normalizedPhone,
                'rsvp_status' => $status,
                'companions_count' => $companionsCount,
                'confirmed_at' => $status === RsvpStatus::Confirmed ? ($guest->confirmed_at ?? now()) : null,
                'cancelled_at' => $status === RsvpStatus::Declined ? ($guest->cancelled_at ?? now()) : null,
                'session_version' => $identityChanged ? $guest->session_version + 1 : $guest->session_version,
            ])->save();

            AuditLog::query()->create([
                'event_id' => $guest->event_id,
                'actor_type' => 'user',
                'actor_id' => $actor->id,
                'action' => 'organizer.guest_updated',
                'subject_type' => EventGuest::class,
                'subject_id' => $guest->id,
                'summary' => [
                    'status' => $status->value,
                    'companions_count' => $companionsCount,
                    'identity_changed' => $identityChanged,
                ],
            ]);
        });
    }
}
