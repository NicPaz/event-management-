<?php

namespace App\Models;

use App\EventStatus;
use App\EventType;
use Carbon\CarbonImmutable;
use Database\Factories\EventFactory;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\HasOne;
use Illuminate\Database\Eloquent\SoftDeletes;

/**
 * @property int $id
 * @property int $user_id
 * @property string $title
 * @property EventType $type
 * @property string|null $slug
 * @property CarbonImmutable|null $starts_at
 * @property string $timezone
 * @property EventStatus $status
 * @property bool $rsvp_open
 * @property bool $reservations_open
 * @property CarbonImmutable|null $published_at
 * @property CarbonImmutable|null $suspended_at
 * @property CarbonImmutable|null $deleted_at
 */
#[Fillable([
    'title',
    'type',
    'starts_at',
    'timezone',
    'venue_name',
    'address',
    'latitude',
    'longitude',
    'welcome_text',
    'instructions',
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

    /** @return HasOne<EventTheme, $this> */
    public function theme(): HasOne
    {
        return $this->hasOne(EventTheme::class);
    }

    /** @return HasMany<EventSection, $this> */
    public function sections(): HasMany
    {
        return $this->hasMany(EventSection::class)->orderBy('position');
    }

    /** @return HasMany<EventPaletteItem, $this> */
    public function paletteItems(): HasMany
    {
        return $this->hasMany(EventPaletteItem::class)->orderBy('position');
    }

    /** @return HasMany<EventGuest, $this> */
    public function guests(): HasMany
    {
        return $this->hasMany(EventGuest::class);
    }

    /** @return HasMany<Gift, $this> */
    public function gifts(): HasMany
    {
        return $this->hasMany(Gift::class)->orderBy('position')->orderBy('id');
    }

    /** @return HasMany<AuditLog, $this> */
    public function auditLogs(): HasMany
    {
        return $this->hasMany(AuditLog::class);
    }

    public function isPubliclyAvailable(): bool
    {
        return in_array($this->status, [EventStatus::Published, EventStatus::Closed], true)
            && $this->suspended_at === null
            && $this->user()->whereNull('suspended_at')->exists();
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
