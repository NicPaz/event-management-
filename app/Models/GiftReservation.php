<?php

namespace App\Models;

use App\GiftReservationStatus;
use Carbon\CarbonImmutable;
use Database\Factories\GiftReservationFactory;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

/** @property int $id @property int $event_guest_id @property int $gift_id @property int $quantity @property GiftReservationStatus $status @property CarbonImmutable|null $cancelled_at */
#[Fillable(['quantity', 'status', 'cancelled_at'])]
class GiftReservation extends Model
{
    /** @use HasFactory<GiftReservationFactory> */
    use HasFactory;

    /** @return BelongsTo<EventGuest, $this> */
    public function guest(): BelongsTo
    {
        return $this->belongsTo(EventGuest::class, 'event_guest_id');
    }

    /** @return BelongsTo<Gift, $this> */
    public function gift(): BelongsTo
    {
        return $this->belongsTo(Gift::class);
    }

    /** @return array<string, string> */
    protected function casts(): array
    {
        return ['quantity' => 'integer', 'status' => GiftReservationStatus::class, 'cancelled_at' => 'immutable_datetime'];
    }
}
