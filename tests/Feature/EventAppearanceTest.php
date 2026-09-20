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
        ->where('event.theme.bannerUrl', null)
        ->has('event.sections', 8)
        ->where('event.sections.0.type', 'cover')
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

    $response->assertRedirect()->assertSessionHas('success');
    $this->assertDatabaseHas('event_themes', [
        'event_id' => $event->id,
        'accent_color' => '#6B4F3A',
    ]);
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
        ->where('event.theme.accentColor', '#6B4F3A')
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
    Storage::disk('public')->put('events/old-banner.jpg', 'old banner');
    EventTheme::factory()->for($event)->create([
        'banner_path' => 'events/old-banner.jpg',
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
    Storage::disk('public')->assertMissing('events/old-banner.jpg');

    $this->post(
        route('events.appearance.update', $event),
        validAppearancePayload(['remove_banner' => true]),
    )->assertRedirect();

    Storage::disk('public')->assertMissing($theme->banner_path);
    expect($theme->refresh()->banner_path)->toBeNull();
});
