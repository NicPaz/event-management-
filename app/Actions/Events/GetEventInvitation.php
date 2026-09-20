<?php

namespace App\Actions\Events;

use App\EventSectionType;
use App\Models\Event;
use App\Models\EventSection;
use App\Models\EventTheme;
use Illuminate\Support\Facades\Storage;

class GetEventInvitation
{
    /**
     * @return array<string, mixed>
     */
    public function handle(Event $event): array
    {
        $event->loadMissing(['theme', 'sections', 'paletteItems', 'gifts']);
        $theme = $event->theme ?? new EventTheme;
        $storedSections = $event->sections->keyBy(fn ($section): string => $section->type->value);
        $sections = collect(EventSectionType::cases())
            ->map(function (EventSectionType $type, int $defaultPosition) use ($storedSections): array {
                if (! $storedSections->has($type->value)) {
                    return [
                        'type' => $type->value,
                        'label' => $type->label(),
                        'enabled' => true,
                        'position' => $defaultPosition,
                    ];
                }

                $section = $storedSections->get($type->value);

                if (! $section instanceof EventSection) {
                    throw new \LogicException('A seção esperada do evento não foi encontrada.');
                }

                return [
                    'type' => $type->value,
                    'label' => $type->label(),
                    'enabled' => $section->enabled,
                    'position' => $section->position,
                ];
            })
            ->sortBy('position')
            ->values()
            ->all();

        $mapUrl = null;

        if ($event->latitude !== null && $event->longitude !== null) {
            $mapUrl = 'https://www.openstreetmap.org/?'.http_build_query([
                'mlat' => $event->latitude,
                'mlon' => $event->longitude,
                'zoom' => 16,
            ]).'#map=16/'.$event->latitude.'/'.$event->longitude;
        } elseif (filled($event->address)) {
            $mapUrl = 'https://www.openstreetmap.org/search?'.http_build_query(['query' => $event->address]);
        }

        return [
            'id' => $event->id,
            'title' => $event->title,
            'slug' => $event->slug,
            'type' => $event->type->value,
            'status' => $event->status->value,
            'startsAt' => $event->starts_at?->toIso8601String(),
            'timezone' => $event->timezone,
            'venueName' => $event->venue_name,
            'address' => $event->address,
            'welcomeText' => $event->welcome_text,
            'instructions' => $event->instructions,
            'mapUrl' => $mapUrl,
            'isReadOnly' => $event->status->value === 'closed',
            'theme' => [
                'backgroundColor' => $theme->background_color,
                'surfaceColor' => $theme->surface_color,
                'textColor' => $theme->text_color,
                'accentColor' => $theme->accent_color,
                'borderColor' => $theme->border_color,
                'bannerUrl' => $theme->banner_path === null
                    ? null
                    : Storage::disk('public')->url($theme->banner_path),
                'bannerPosition' => $theme->banner_position,
            ],
            'sections' => $sections,
            'paletteItems' => $event->paletteItems
                ->map(fn ($item): array => [
                    'label' => $item->label,
                    'colorHex' => $item->color_hex,
                    'material' => $item->material,
                    'position' => $item->position,
                ])
                ->values()
                ->all(),
            'gifts' => $event->gifts
                ->whereNull('archived_at')
                ->map(fn ($gift): array => [
                    'id' => $gift->id,
                    'name' => $gift->name,
                    'description' => $gift->description,
                    'imageUrl' => $gift->image_path === null ? null : Storage::disk('public')->url($gift->image_path),
                    'purchaseUrl' => $gift->purchase_url,
                    'quantityTotal' => $gift->quantity_total,
                    'quantityReserved' => $gift->quantity_reserved,
                    'quantityAvailable' => $gift->quantity_total - $gift->quantity_reserved,
                ])
                ->values()
                ->all(),
        ];
    }
}
