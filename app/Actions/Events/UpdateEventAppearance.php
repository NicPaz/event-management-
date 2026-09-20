<?php

namespace App\Actions\Events;

use App\Models\Event;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;
use InvalidArgumentException;
use RuntimeException;
use Throwable;

class UpdateEventAppearance
{
    /**
     * @param  array<string, mixed>  $attributes
     */
    public function handle(
        Event $event,
        array $attributes,
        ?UploadedFile $banner,
        ?UploadedFile $background,
    ): void {
        $event->loadMissing('theme');
        $oldBannerPath = $event->theme?->banner_path;
        $oldBackgroundPath = $event->theme?->background_path;
        $newBannerPath = $banner?->store("events/{$event->id}/banners", 'public');
        $newBackgroundPath = $background?->store("events/{$event->id}/backgrounds", 'public');

        if ($newBannerPath === false || $newBackgroundPath === false) {
            Storage::disk('public')->delete(array_filter([$newBannerPath, $newBackgroundPath]));

            throw new RuntimeException('Não foi possível armazenar uma das imagens do evento.');
        }

        try {
            DB::transaction(function () use ($event, $attributes, $newBannerPath, $newBackgroundPath): void {
                $themeAttributes = [
                    'background_color' => strtoupper((string) $attributes['background_color']),
                    'surface_color' => strtoupper((string) $attributes['surface_color']),
                    'text_color' => strtoupper((string) $attributes['text_color']),
                    'accent_color' => strtoupper((string) $attributes['accent_color']),
                    'border_color' => strtoupper((string) $attributes['border_color']),
                    'banner_position' => $attributes['banner_position'],
                    'background_fill' => $attributes['background_fill'],
                    'background_position' => $attributes['background_position'],
                    'background_overlay' => $attributes['background_overlay'],
                    'background_overlay_opacity' => $attributes['background_overlay_opacity'],
                ];

                if ($newBannerPath !== null) {
                    $themeAttributes['banner_path'] = $newBannerPath;
                } elseif ((bool) ($attributes['remove_banner'] ?? false)) {
                    $themeAttributes['banner_path'] = null;
                }

                if ($newBackgroundPath !== null) {
                    $themeAttributes['background_path'] = $newBackgroundPath;
                } elseif ((bool) ($attributes['remove_background'] ?? false)) {
                    $themeAttributes['background_path'] = null;
                }

                $event->theme()->updateOrCreate([], $themeAttributes);

                $event->sections()->delete();
                $event->sections()->createMany($this->sectionRecords($attributes['sections'] ?? null));

                $event->paletteItems()->delete();
                $event->paletteItems()->createMany($this->paletteRecords($attributes['palette_items'] ?? null));
            });
        } catch (Throwable $exception) {
            Storage::disk('public')->delete(array_filter([$newBannerPath, $newBackgroundPath]));

            throw $exception;
        }

        $bannerWasReplaced = $newBannerPath !== null;
        $bannerWasRemoved = (bool) ($attributes['remove_banner'] ?? false);

        if ($oldBannerPath !== null && ($bannerWasReplaced || $bannerWasRemoved)) {
            Storage::disk('public')->delete($oldBannerPath);
        }

        $backgroundWasReplaced = $newBackgroundPath !== null;
        $backgroundWasRemoved = (bool) ($attributes['remove_background'] ?? false);

        if ($oldBackgroundPath !== null && ($backgroundWasReplaced || $backgroundWasRemoved)) {
            Storage::disk('public')->delete($oldBackgroundPath);
        }
    }

    /**
     * @return list<array{type: string, enabled: bool, position: int}>
     */
    private function sectionRecords(mixed $sections): array
    {
        if (! is_array($sections)) {
            throw new InvalidArgumentException('As seções do evento devem ser uma lista.');
        }

        $records = [];

        foreach ($sections as $section) {
            if (! is_array($section)) {
                throw new InvalidArgumentException('Cada seção do evento deve ser uma lista de atributos.');
            }

            $records[] = [
                'type' => (string) ($section['type'] ?? ''),
                'enabled' => (bool) ($section['enabled'] ?? false),
                'position' => (int) ($section['position'] ?? 0),
            ];
        }

        return $records;
    }

    /**
     * @return list<array{label: string, color_hex: string|null, material: string|null, position: int}>
     */
    private function paletteRecords(mixed $items): array
    {
        if (! is_array($items)) {
            throw new InvalidArgumentException('A paleta do evento deve ser uma lista.');
        }

        $records = [];

        foreach ($items as $item) {
            if (! is_array($item)) {
                throw new InvalidArgumentException('Cada item da paleta deve ser uma lista de atributos.');
            }

            $records[] = [
                'label' => trim((string) ($item['label'] ?? '')),
                'color_hex' => filled($item['color_hex'] ?? null)
                    ? strtoupper((string) $item['color_hex'])
                    : null,
                'material' => filled($item['material'] ?? null)
                    ? trim((string) $item['material'])
                    : null,
                'position' => (int) ($item['position'] ?? 0),
            ];
        }

        return $records;
    }
}
