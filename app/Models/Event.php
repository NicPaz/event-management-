<?php

namespace App\Models;

use App\EventStatus;
use App\EventType;
use Database\Factories\EventFactory;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Support\Carbon;

/**
 * @property int $id
 * @property int $user_id
 * @property string $title
 * @property EventType $type
 * @property string|null $slug
 * @property Carbon|null $starts_at
 * @property string $timezone
 * @property EventStatus $status
 * @property bool $rsvp_open
 * @property bool $reservations_open
 * @property Carbon|null $published_at
 * @property Carbon|null $suspended_at
 * @property Carbon|null $deleted_at
 */
#[Fillable([
    'title',
    'type',
    'slug',
    'starts_at',
    'timezone',
    'venue_name',
    'address',
    'latitude',
    'longitude',
    'welcome_text',
    'instructions',
    'status',
    'rsvp_open',
    'reservations_open',
    'published_at',
    'suspended_at',
])]
class Event extends Model
{
    /** @use HasFactory<EventFactory> */
    use HasFactory, SoftDeletes;

    /**
     * @return BelongsTo<User, $this>
     */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    /**
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'type' => EventType::class,
            'starts_at' => 'immutable_datetime',
            'status' => EventStatus::class,
            'rsvp_open' => 'boolean',
            'reservations_open' => 'boolean',
            'published_at' => 'immutable_datetime',
            'suspended_at' => 'immutable_datetime',
        ];
    }
}
