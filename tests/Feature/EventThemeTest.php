<?php

use App\EventSectionType;
use App\EventType;
use App\Models\Event;
use App\Models\EventGuest;
use App\Models\EventSection;
use App\Models\EventTheme;
use App\Models\Gift;
use App\Models\User;
use App\Support\EventThemeCatalog;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Inertia\Testing\AssertableInertia as Assert;

function themeAppearancePayload(array $overrides = []): array
{
    return [
        'background_color' => '#FAF7F2',
        'surface_color' => '#FFFFFF',
        'text_color' => '#3E352E',
        'accent_color' => '#88715B',
        'border_color' => '#DFD4C7',
        'show_confirmed_guests' => false,
        'banner_position' => 'center',
        'sections' => collect(EventSectionType::cases())->map(fn (EventSectionType $type, int $position): array => [
            'type' => $type->value,
            'enabled' => $type->enabledByDefault(),
            'position' => $position,
        ])->all(),
        'palette_items' => [],
        ...$overrides,
    ];
}

test('every event type exposes four functional visual themes', function (EventType $type) {
    $themes = app(EventThemeCatalog::class)->forType($type);

    expect($themes)->toHaveCount(4)
        ->and(collect($themes)->pluck('key')->unique())->toHaveCount(4)
        ->and(collect($themes)->pluck('coverLayout')->unique()->count())->toBeGreaterThan(1)
        ->and(collect($themes)->pluck('decorationStyle')->unique()->count())->toBeGreaterThan(1);
})->with(EventType::cases());

test('event creation applies a theme from the selected category', function () {
    $organizer = User::factory()->create();

    $this->actingAs($organizer)->post(route('events.store'), [
        'title' => 'Nossa casa',
        'type' => EventType::Housewarming->value,
        'theme_key' => 'housewarming-sage',
        'timezone' => 'America/Sao_Paulo',
    ])->assertRedirect();

    $event = Event::query()->sole();
    expect($event->theme()->sole()->template_key)->toBe('housewarming-sage');
    expect($event->theme()->sole()->title_font)->toBe('organic')
        ->and($event->theme()->sole()->body_font)->toBe('organic');
});

test('event creation rejects a theme from another category', function () {
    $organizer = User::factory()->create();

    $this->actingAs($organizer)->post(route('events.store'), [
        'title' => 'Nosso casamento',
        'type' => EventType::Wedding->value,
        'theme_key' => 'birthday-retro',
        'timezone' => 'America/Sao_Paulo',
    ])->assertSessionHasErrors('theme_key');

    $this->assertDatabaseEmpty('events');
});

test('applying a theme preserves operational data and section configuration', function () {
    Storage::fake('public');
    $organizer = User::factory()->create();
    $event = Event::factory()->for($organizer)->create([
        'type' => EventType::Wedding,
        'show_confirmed_guests' => true,
    ]);
    $gift = Gift::factory()->for($event)->create();
    $guest = EventGuest::factory()->for($event)->confirmed()->create();
    EventSection::factory()->for($event)->create([
        'type' => EventSectionType::Rsvp,
        'enabled' => true,
        'position' => 0,
    ]);
    $bannerPath = "events/{$event->id}/banners/banner.jpg";
    $backgroundPath = "events/{$event->id}/backgrounds/background.jpg";
    Storage::disk('public')->put($bannerPath, 'banner');
    Storage::disk('public')->put($backgroundPath, 'background');
    EventTheme::factory()->for($event)->create([
        'template_key' => 'wedding-classic',
        'banner_path' => $bannerPath,
        'background_path' => $backgroundPath,
    ]);

    $this->actingAs($organizer)->post(route('events.appearance.theme.update', $event), [
        'theme_key' => 'wedding-boho',
    ])->assertRedirect()->assertSessionHas('success');

    expect($event->theme()->sole()->template_key)->toBe('wedding-boho')
        ->and($event->theme()->sole()->banner_path)->toBeNull()
        ->and($event->theme()->sole()->background_path)->toBeNull();
    $this->assertModelExists($gift);
    $this->assertModelExists($guest);
    $this->assertDatabaseHas('event_sections', [
        'event_id' => $event->id,
        'type' => EventSectionType::Rsvp->value,
        'enabled' => true,
        'position' => 0,
    ]);
    expect($event->refresh()->show_confirmed_guests)->toBeTrue();
    Storage::disk('public')->assertMissing($bannerPath);
    Storage::disk('public')->assertMissing($backgroundPath);

    $this->get(route('events.appearance.edit', $event))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->where('event.theme.templateKey', 'wedding-boho')
            ->where('event.theme.backgroundColor', '#F4EADF')
            ->where('event.theme.textColor', '#44362D')
            ->where('event.theme.titleFont', 'organic')
            ->where('event.theme.bodyFont', 'organic')
        );
});

test('confirmed guest names are sent only when the internal option and rsvp section are enabled', function () {
    $event = Event::factory()->published()->create();
    EventGuest::factory()->for($event)->confirmed()->create(['name' => 'Ana Confirmada']);
    EventGuest::factory()->for($event)->create(['name' => 'Pessoa sem resposta']);

    $this->get(route('public.events.show', $event->slug))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->missing('event.confirmedGuestNames')
        );

    $event->update(['show_confirmed_guests' => true]);

    $this->get(route('public.events.show', $event->slug))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->where('event.confirmedGuestNames', ['Ana Confirmada'])
            ->missing('event.guests')
        );

    EventSection::factory()->for($event)->create([
        'type' => EventSectionType::Rsvp,
        'enabled' => false,
        'position' => 7,
    ]);

    $this->get(route('public.events.show', $event->slug))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->where('event.showConfirmedGuests', true)
            ->missing('event.confirmedGuestNames')
        );
});

test('background image settings are independent from the banner', function () {
    Storage::fake('public');
    $organizer = User::factory()->create();
    $event = Event::factory()->for($organizer)->create();
    $keptBannerPath = "events/{$event->id}/banners/kept-banner.jpg";
    EventTheme::factory()->for($event)->create(['banner_path' => $keptBannerPath]);
    Storage::disk('public')->put($keptBannerPath, 'banner');

    $this->actingAs($organizer)->post(route('events.appearance.update', $event), themeAppearancePayload([
        'background' => UploadedFile::fake()->image('texture.jpg', 1200, 1200),
        'background_fill' => 'repeat',
        'background_position' => 'top',
        'background_overlay' => 'dark',
        'background_overlay_opacity' => 35,
    ]))->assertRedirect()->assertSessionHas('success');

    $theme = $event->theme()->sole();
    expect($theme->banner_path)->toBe($keptBannerPath)
        ->and($theme->background_path)->not->toBeNull()
        ->and($theme->background_fill)->toBe('repeat')
        ->and($theme->background_overlay_opacity)->toBe(35);
    Storage::disk('public')->assertExists($keptBannerPath);
    Storage::disk('public')->assertExists($theme->background_path);

    $backgroundPath = $theme->background_path;
    $this->post(route('events.appearance.update', $event), themeAppearancePayload([
        'remove_background' => true,
    ]))->assertRedirect()->assertSessionHas('success');

    expect($theme->refresh()->background_path)->toBeNull()
        ->and($theme->banner_path)->toBe($keptBannerPath);
    Storage::disk('public')->assertMissing($backgroundPath);
    Storage::disk('public')->assertExists($keptBannerPath);
});
