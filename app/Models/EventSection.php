<?php

namespace App\Models;

use App\EventSectionType;
use Database\Factories\EventSectionFactory;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

/**
 * @property int $id
 * @property int $event_id
 * @property EventSectionType $type
 * @property bool $enabled
 * @property int $position
 */
#[Fillable(['type', 'enabled', 'position'])]
class EventSection extends Model
{
    /** @use HasFactory<EventSectionFactory> */
    use HasFactory;

    /** @return BelongsTo<Event, $this> */
    public function event(): BelongsTo
    {
        return $this->belongsTo(Event::class);
    }

    /** @return array<string, string> */
    protected function casts(): array
    {
        return [
            'type' => EventSectionType::class,
            'enabled' => 'boolean',
        ];
    }
}
