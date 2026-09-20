<?php

namespace App\Actions\Events;

use App\Models\Event;
use App\Support\EventThemeCatalog;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;

class ApplyEventTheme
{
    public function __construct(private EventThemeCatalog $catalog) {}

    public function handle(Event $event, string $themeKey): void
    {
        $preset = $this->catalog->preset($themeKey);
        $event->loadMissing('theme');
        $oldBannerPath = $event->theme?->banner_path;
        $oldBackgroundPath = $event->theme?->background_path;

        DB::transaction(function () use ($event, $preset, $themeKey): void {
            $event->theme()->updateOrCreate([], [
                'template_key' => $themeKey,
                'background_color' => $preset['backgroundColor'],
                'surface_color' => $preset['surfaceColor'],
                'text_color' => $preset['textColor'],
                'accent_color' => $preset['accentColor'],
                'border_color' => $preset['borderColor'],
                'font_pair' => $preset['fontPair'],
                'cover_layout' => $preset['coverLayout'],
                'card_style' => $preset['cardStyle'],
                'button_style' => $preset['buttonStyle'],
                'decoration_style' => $preset['decorationStyle'],
                'banner_path' => null,
                'banner_position' => 'center',
                'background_path' => null,
                'background_fill' => 'cover',
                'background_position' => 'center',
                'background_overlay' => 'light',
                'background_overlay_opacity' => 20,
            ]);
        });

        Storage::disk('public')->delete(array_filter([$oldBannerPath, $oldBackgroundPath]));
    }
}
