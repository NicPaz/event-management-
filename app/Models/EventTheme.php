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
 * @property string $cover_layout
 * @property string $card_style
 * @property string $button_style
 * @property string $decoration_style
 * @property string|null $banner_path
 * @property string $banner_position
 * @property string|null $background_path
 * @property string $background_fill
 * @property string $background_position
 * @property string $background_overlay
 * @property int $background_overlay_opacity
 */
#[Fillable([
    'template_key',
    'background_color',
    'surface_color',
    'text_color',
    'accent_color',
    'border_color',
    'font_pair',
    'cover_layout',
    'card_style',
    'button_style',
    'decoration_style',
    'banner_path',
    'banner_position',
    'background_path',
    'background_fill',
    'background_position',
    'background_overlay',
    'background_overlay_opacity',
])]
class EventTheme extends Model
{
    /** @use HasFactory<EventThemeFactory> */
    use HasFactory;

    /** @var array<string, int|string> */
    protected $attributes = [
        'template_key' => 'neutral',
        'background_color' => '#FAF7F2',
        'surface_color' => '#FFFFFF',
        'text_color' => '#3E352E',
        'accent_color' => '#88715B',
        'border_color' => '#DFD4C7',
        'font_pair' => 'classic',
        'cover_layout' => 'centered',
        'card_style' => 'soft',
        'button_style' => 'rounded',
        'decoration_style' => 'arches',
        'banner_position' => 'center',
        'background_fill' => 'cover',
        'background_position' => 'center',
        'background_overlay' => 'light',
        'background_overlay_opacity' => 20,
    ];

    /**
     * @return BelongsTo<Event, $this>
     */
    public function event(): BelongsTo
    {
        return $this->belongsTo(Event::class);
    }

    /** @return array<string, string> */
    protected function casts(): array
    {
        return ['background_overlay_opacity' => 'integer'];
    }
}
