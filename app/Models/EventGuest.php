<?php

namespace App\Models;

use App\RsvpStatus;
use Carbon\CarbonImmutable;
use Database\Factories\EventGuestFactory;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

/**
 * @property int $id
 * @property int $event_id
 * @property string $name
 * @property string $name_normalized
 * @property string $phone_normalized
 * @property RsvpStatus $rsvp_status
 * @property int $companions_count
 * @property CarbonImmutable|null $confirmed_at
 * @property CarbonImmutable|null $cancelled_at
 * @property int $session_version
 */
#[Fillable([
    'name',
    'name_normalized',
    'phone_normalized',
    'rsvp_status',
    'companions_count',
    'confirmed_at',
    'cancelled_at',
])]
class EventGuest extends Model
{
    /** @use HasFactory<EventGuestFactory> */
    use HasFactory;

    /** @var array<string, int|string> */
    protected $attributes = [
        'rsvp_status' => RsvpStatus::Unanswered->value,
        'companions_count' => 0,
        'session_version' => 1,
    ];

    /** @return BelongsTo<Event, $this> */
    public function event(): BelongsTo
    {
        return $this->belongsTo(Event::class);
    }

    /** @return HasMany<GiftReservation, $this> */
    public function giftReservations(): HasMany
    {
        return $this->hasMany(GiftReservation::class);
    }

    /** @return array<string, string> */
    protected function casts(): array
    {
        return [
            'rsvp_status' => RsvpStatus::class,
            'companions_count' => 'integer',
            'confirmed_at' => 'immutable_datetime',
            'cancelled_at' => 'immutable_datetime',
            'session_version' => 'integer',
        ];
    }
}
