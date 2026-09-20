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
                        'enabled' => $type->enabledByDefault(),
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

        $activeGifts = $event->gifts->whereNull('archived_at');
        $orderedGifts = $activeGifts
            ->filter(fn ($gift): bool => $gift->quantity_reserved < $gift->quantity_total)
            ->concat($activeGifts->filter(fn ($gift): bool => $gift->quantity_reserved >= $gift->quantity_total));

        $invitation = [
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
            'showConfirmedGuests' => $event->show_confirmed_guests,
            'theme' => [
                'templateKey' => $theme->template_key,
                'backgroundColor' => $theme->background_color,
                'surfaceColor' => $theme->surface_color,
                'textColor' => $theme->text_color,
                'accentColor' => $theme->accent_color,
                'borderColor' => $theme->border_color,
                'bannerUrl' => $theme->banner_path === null
                    ? null
                    : Storage::disk('public')->url($theme->banner_path),
                'bannerPosition' => $theme->banner_position,
                'fontPair' => $theme->font_pair,
                'titleFont' => $theme->title_font,
                'bodyFont' => $theme->body_font,
                'coverLayout' => $theme->cover_layout,
                'cardStyle' => $theme->card_style,
                'buttonStyle' => $theme->button_style,
                'decorationStyle' => $theme->decoration_style,
                'backgroundUrl' => $theme->background_path === null
                    ? null
                    : Storage::disk('public')->url($theme->background_path),
                'backgroundFill' => $theme->background_fill,
                'backgroundPosition' => $theme->background_position,
                'backgroundOverlay' => $theme->background_overlay,
                'backgroundOverlayOpacity' => $theme->background_overlay_opacity,
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
            'gifts' => $orderedGifts
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

        $rsvpSection = collect($sections)->firstWhere('type', EventSectionType::Rsvp->value);

        if ($event->show_confirmed_guests
            && is_array($rsvpSection)
            && $rsvpSection['enabled'] === true) {
            $invitation['confirmedGuestNames'] = $event->guests()
                ->where('rsvp_status', 'confirmed')
                ->orderBy('name')
                ->pluck('name')
                ->all();
        }

        return $invitation;
    }
}
