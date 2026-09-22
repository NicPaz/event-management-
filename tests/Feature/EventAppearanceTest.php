<?php

use App\EventSectionType;
use App\Models\Event;
use App\Models\EventTheme;
use App\Models\User;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Inertia\Testing\AssertableInertia as Assert;

function validAppearancePayload(array $overrides = []): array
{
    return [
        'background_color' => '#FAF7F2',
        'surface_color' => '#FFFFFF',
        'text_color' => '#3E352E',
        'accent_color' => '#88715B',
        'border_color' => '#DFD4C7',
        'show_confirmed_guests' => false,
        'banner_position' => 'center',
        'remove_banner' => false,
        'sections' => collect(EventSectionType::cases())
            ->map(fn (EventSectionType $type, int $position): array => [
                'type' => $type->value,
                'enabled' => true,
                'position' => $position,
            ])
            ->all(),
        'palette_items' => [
            [
                'label' => 'Inox',
                'color_hex' => '#C0C0C0',
                'material' => 'Aço inoxidável',
                'position' => 0,
            ],
        ],
        ...$overrides,
    ];
}

test('organizers see default appearance for events without customization', function () {
    $organizer = User::factory()->create();
    $event = Event::factory()->for($organizer)->create();

    $response = $this->actingAs($organizer)->get(route('events.appearance.edit', $event));

    $response->assertOk()->assertInertia(fn (Assert $page) => $page
        ->component('dashboard/events/appearance')
        ->where('event.theme.backgroundColor', '#FAF7F2')
        ->where('event.publicUrl', null)
        ->where('event.theme.bannerUrl', null)
        ->where('event.theme.titleFont', 'classic')
        ->where('event.theme.bodyFont', 'modern')
        ->has('fontOptions.titles', 9)
        ->has('fontOptions.body', 8)
        ->where('event.showConfirmedGuests', false)
        ->has('event.sections', 8)
        ->where('event.sections.0.type', 'cover')
        ->where('event.sections.7.type', 'rsvp')
        ->where('event.sections.7.enabled', true)
        ->has('event.paletteItems', 0)
    );
});

test('appearance changes persist and are shared by preview and public page', function () {
    $organizer = User::factory()->create();
    $event = Event::factory()->for($organizer)->published()->create();
    $sections = validAppearancePayload()['sections'];
    [$sections[0], $sections[1]] = [$sections[1], $sections[0]];
    $sections = collect($sections)
        ->map(fn (array $section, int $position): array => [
            ...$section,
            'enabled' => $section['type'] !== EventSectionType::Gifts->value,
            'position' => $position,
        ])
        ->all();

    $response = $this->actingAs($organizer)->post(
        route('events.appearance.update', $event),
        validAppearancePayload([
            'accent_color' => '#6B4F3A',
            'show_confirmed_guests' => true,
            'sections' => $sections,
            'palette_items' => [
                [
                    'label' => 'Bambu',
                    'color_hex' => null,
                    'material' => 'Madeira clara',
                    'position' => 0,
                ],
                [
                    'label' => 'Branco',
                    'color_hex' => '#FFFFFF',
                    'material' => null,
                    'position' => 1,
                ],
            ],
        ]),
    );

    $response->assertRedirect()->assertSessionHas(
        'success',
        'Alterações salvas com sucesso!',
    );
    $this->assertDatabaseHas('event_themes', [
        'event_id' => $event->id,
        'accent_color' => '#6B4F3A',
    ]);
    expect($event->refresh()->show_confirmed_guests)->toBeTrue();
    $this->assertDatabaseHas('event_sections', [
        'event_id' => $event->id,
        'type' => EventSectionType::Gifts->value,
        'enabled' => false,
    ]);
    $this->assertDatabaseHas('event_palette_items', [
        'event_id' => $event->id,
        'label' => 'Bambu',
        'material' => 'Madeira clara',
        'position' => 0,
    ]);

    $assertInvitation = fn (Assert $page) => $page
        ->component('events/show')
        ->where('event.publicUrl', route('public.events.show', $event->slug))
        ->where('event.theme.accentColor', '#6B4F3A')
        ->where('event.showConfirmedGuests', true)
        ->where('event.sections.0.type', EventSectionType::Welcome->value)
        ->where('event.sections.1.type', EventSectionType::Cover->value)
        ->where('event.paletteItems.0.label', 'Bambu');

    $this->get(route('events.preview', $event))
        ->assertOk()
        ->assertInertia($assertInvitation);
    $this->get(route('public.events.show', $event->slug))
        ->assertOk()
        ->assertInertia($assertInvitation);
});

test('inspiration colors are optional and can all be removed', function () {
    $organizer = User::factory()->create();
    $event = Event::factory()->for($organizer)->create();

    $this->actingAs($organizer)->post(
        route('events.appearance.update', $event),
        validAppearancePayload(['palette_items' => []]),
    )->assertRedirect()->assertSessionHas('success');

    $this->assertDatabaseMissing('event_palette_items', [
        'event_id' => $event->id,
    ]);

    $event->paletteItems()->create([
        'label' => 'Bambu',
        'color_hex' => '#D2A679',
        'material' => 'Madeira',
        'position' => 0,
    ]);

    $this->actingAs($organizer)->post(
        route('events.appearance.update', $event),
        collect(validAppearancePayload())->except('palette_items')->all(),
    )->assertRedirect()->assertSessionHas('success');

    $this->assertDatabaseHas('event_palette_items', [
        'event_id' => $event->id,
        'label' => 'Bambu',
    ]);
});

test('typography is validated persisted and shared by invitation and participation', function () {
    $organizer = User::factory()->create();
    $event = Event::factory()->for($organizer)->published()->create();

    $this->actingAs($organizer)->post(
        route('events.appearance.update', $event),
        validAppearancePayload([
            'title_font' => 'handwritten',
            'body_font' => 'organic',
        ]),
    )->assertRedirect()->assertSessionHas('success');

    $this->assertDatabaseHas('event_themes', [
        'event_id' => $event->id,
        'title_font' => 'handwritten',
        'body_font' => 'organic',
    ]);

    $assertTypography = fn (Assert $page) => $page
        ->where('event.theme.titleFont', 'handwritten')
        ->where('event.theme.bodyFont', 'organic');

    $this->get(route('public.events.show', $event->slug))
        ->assertOk()
        ->assertInertia($assertTypography);

    $this->get(route('public.events.participation', $event->slug))
        ->assertOk()
        ->assertInertia($assertTypography);

    $this->post(
        route('events.appearance.update', $event),
        validAppearancePayload([
            'title_font' => 'url(https://example.com/font.woff2)',
            'body_font' => 'handwritten',
        ]),
    )->assertSessionHasErrors(['title_font', 'body_font']);
});

test('organizers cannot change another organizers appearance', function () {
    $organizer = User::factory()->create();
    $otherEvent = Event::factory()->for(User::factory())->create();

    $response = $this->actingAs($organizer)->post(
        route('events.appearance.update', $otherEvent),
        validAppearancePayload(['accent_color' => '#6B4F3A']),
    );

    $response->assertForbidden();
    $this->assertDatabaseMissing('event_themes', ['event_id' => $otherEvent->id]);
});

test('appearance validates contrast section completeness and banner type', function () {
    $organizer = User::factory()->create();
    $event = Event::factory()->for($organizer)->create();
    $sections = validAppearancePayload()['sections'];
    array_pop($sections);

    $response = $this->actingAs($organizer)->post(
        route('events.appearance.update', $event),
        validAppearancePayload([
            'text_color' => '#FFFFFF',
            'sections' => $sections,
            'banner' => UploadedFile::fake()->create('banner.svg', 10, 'image/svg+xml'),
        ]),
    );

    $response->assertSessionHasErrors(['text_color', 'sections', 'banner']);
    $this->assertDatabaseMissing('event_themes', ['event_id' => $event->id]);
});

test('banner uploads replace and remove the previous file', function () {
    Storage::fake('public');
    $organizer = User::factory()->create();
    $event = Event::factory()->for($organizer)->create();
    $oldBannerPath = "events/{$event->id}/banners/old-banner.jpg";
    $keptBackgroundPath = "events/{$event->id}/backgrounds/kept-background.jpg";
    Storage::disk('public')->put($oldBannerPath, 'old banner');
    Storage::disk('public')->put($keptBackgroundPath, 'background');
    EventTheme::factory()->for($event)->create([
        'banner_path' => $oldBannerPath,
        'background_path' => $keptBackgroundPath,
    ]);

    $this->actingAs($organizer)->post(
        route('events.appearance.update', $event),
        validAppearancePayload([
            'banner' => UploadedFile::fake()->image('new-banner.jpg', 1600, 900)->size(500),
        ]),
    )->assertRedirect();

    $theme = $event->theme()->sole();
    expect($theme->banner_path)->not->toBeNull();
    Storage::disk('public')->assertExists($theme->banner_path);
    Storage::disk('public')->assertMissing($oldBannerPath);

    $this->post(
        route('events.appearance.update', $event),
        validAppearancePayload(['remove_banner' => true]),
    )->assertRedirect();

    Storage::disk('public')->assertMissing($theme->banner_path);
    expect($theme->refresh()->banner_path)->toBeNull()
        ->and($theme->background_path)->toBe($keptBackgroundPath);
    Storage::disk('public')->assertExists($keptBackgroundPath);
});

test('removing appearance does not delete an asset referenced by another event', function () {
    Storage::fake('public');
    $organizer = User::factory()->create();
    $event = Event::factory()->for($organizer)->create();
    $otherEvent = Event::factory()->for($organizer)->create();
    $sharedPath = "events/{$event->id}/backgrounds/shared-texture.jpg";
    Storage::disk('public')->put($sharedPath, 'shared background');
    EventTheme::factory()->for($event)->create(['background_path' => $sharedPath]);
    EventTheme::factory()->for($otherEvent)->create(['background_path' => $sharedPath]);

    $this->actingAs($organizer)->post(
        route('events.appearance.update', $event),
        validAppearancePayload(['remove_background' => true]),
    )->assertRedirect();

    expect($event->theme()->sole()->background_path)->toBeNull()
        ->and($otherEvent->theme()->sole()->background_path)->toBe($sharedPath);
    Storage::disk('public')->assertExists($sharedPath);
});
