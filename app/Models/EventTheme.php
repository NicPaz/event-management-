<?php

namespace App\Models;

use Database\Factories\EventThemeFactory;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

/**
 * @property int $id
 * @property int $event_id
 * @property string $template_key
 * @property string $background_color
 * @property string $surface_color
 * @property string $text_color
 * @property string $accent_color
 * @property string $border_color
 * @property string $font_pair
 * @property string|null $banner_path
 * @property string $banner_position
 */
#[Fillable([
    'template_key',
    'background_color',
    'surface_color',
    'text_color',
    'accent_color',
    'border_color',
    'font_pair',
    'banner_path',
    'banner_position',
])]
class EventTheme extends Model
{
    /** @use HasFactory<EventThemeFactory> */
    use HasFactory;

    /** @var array<string, string> */
    protected $attributes = [
        'template_key' => 'neutral',
        'background_color' => '#FAF7F2',
        'surface_color' => '#FFFFFF',
        'text_color' => '#3E352E',
        'accent_color' => '#88715B',
        'border_color' => '#DFD4C7',
        'font_pair' => 'classic',
        'banner_position' => 'center',
    ];

    /**
     * @return BelongsTo<Event, $this>
     */
    public function event(): BelongsTo
    {
        return $this->belongsTo(Event::class);
    }
}
