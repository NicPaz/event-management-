<?php

namespace App\Models;

use Carbon\CarbonImmutable;
use Database\Factories\GiftFactory;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

/** @property int $id @property int $event_id @property string $name @property string|null $description @property int|null $price_cents @property string|null $image_path @property string|null $purchase_url @property int $quantity_total @property int $quantity_reserved @property int $position @property CarbonImmutable|null $archived_at */
#[Fillable(['name', 'description', 'price_cents', 'image_path', 'purchase_url', 'quantity_total', 'position', 'archived_at'])]
class Gift extends Model
{
    /** @use HasFactory<GiftFactory> */
    use HasFactory;

    /** @var array<string, int> */
    protected $attributes = ['quantity_reserved' => 0, 'position' => 0];

    /** @return BelongsTo<Event, $this> */
    public function event(): BelongsTo
    {
        return $this->belongsTo(Event::class);
    }

    /** @return HasMany<GiftReservation, $this> */
    public function reservations(): HasMany
    {
        return $this->hasMany(GiftReservation::class);
    }

    /** @return array<string, string> */
    protected function casts(): array
    {
        return ['price_cents' => 'integer', 'quantity_total' => 'integer', 'quantity_reserved' => 'integer', 'position' => 'integer', 'archived_at' => 'immutable_datetime'];
    }
}
