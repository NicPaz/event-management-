<?php

namespace App\Actions\Events;

use App\Models\Event;
use App\Support\EventAssetStorage;
use App\Support\EventThemeCatalog;
use Illuminate\Support\Facades\DB;

class ApplyEventTheme
{
    public function __construct(
        private EventThemeCatalog $catalog,
        private EventAssetStorage $assets,
    ) {}

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
                'title_font' => $preset['titleFont'],
                'body_font' => $preset['bodyFont'],
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

        $this->assets->deleteIfOwnedAndUnreferenced($event, $oldBannerPath);
        $this->assets->deleteIfOwnedAndUnreferenced($event, $oldBackgroundPath);
    }
}
