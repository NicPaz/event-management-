<?php

namespace App\Models;

use Database\Factories\EventPaletteItemFactory;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

/**
 * @property int $id
 * @property int $event_id
 * @property string $label
 * @property string|null $color_hex
 * @property string|null $material
 * @property int $position
 */
#[Fillable(['label', 'color_hex', 'material', 'position'])]
class EventPaletteItem extends Model
{
    /** @use HasFactory<EventPaletteItemFactory> */
    use HasFactory;

    /** @return BelongsTo<Event, $this> */
    public function event(): BelongsTo
    {
        return $this->belongsTo(Event::class);
    }
}
