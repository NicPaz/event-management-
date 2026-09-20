<?php

use App\EventStatus;
use App\Models\AuditLog;
use App\Models\Event;
use App\Models\User;
use Inertia\Testing\AssertableInertia as Assert;

test('organizers are forbidden from the administration area', function () {
    $organizer = User::factory()->create();

    $response = $this->actingAs($organizer)->get(route('admin.dashboard'));

    $response->assertForbidden();
});

test('administrators can view global metrics', function () {
    $administrator = User::factory()->administrator()->create();
    User::factory()->count(2)->create();
    Event::factory()->create();
    Event::factory()->published()->create();
    Event::factory()->create(['status' => EventStatus::Closed]);

    $response = $this->actingAs($administrator)->get(route('admin.dashboard'));

    $response->assertOk()->assertInertia(fn (Assert $page) => $page
        ->component('admin/dashboard')
        ->where('metrics.organizers', 5)
        ->where('metrics.events', 3)
        ->where('metrics.publishedEvents', 1)
        ->where('metrics.suspendedUsers', 0)
    );
});

test('suspended administrators are logged out before authorization', function () {
    $administrator = User::factory()->administrator()->suspended()->create();

    $response = $this->actingAs($administrator)->get(route('admin.dashboard'));

    $response->assertRedirect(route('login'));
    $this->assertGuest();
});

test('administrators can search organizers without exposing administrator accounts', function () {
    $administrator = User::factory()->administrator()->create(['name' => 'Admin Oculto']);
    $organizer = User::factory()->create(['name' => 'Organizadora Maria', 'email' => 'maria@example.com']);
    Event::factory()->count(2)->for($organizer)->create();

    $response = $this->actingAs($administrator)->get(route('admin.users.index', ['search' => 'Maria']));

    $response->assertOk()->assertInertia(fn (Assert $page) => $page
        ->component('admin/users')
        ->has('users.data', 1)
        ->where('users.data.0.id', $organizer->id)
        ->where('users.data.0.eventsCount', 2)
    );
});

test('administrators can suspend and reactivate organizer accounts', function () {
    $administrator = User::factory()->administrator()->create();
    $organizer = User::factory()->create();

    $this->actingAs($administrator)
        ->post(route('admin.users.suspension.store', $organizer))
        ->assertRedirect();

    expect($organizer->refresh()->suspended_at)->not->toBeNull();
    expect(AuditLog::query()->where('action', 'admin.user_suspended')->where('subject_id', $organizer->id)->exists())->toBeTrue();

    $this->actingAs($organizer)->get(route('dashboard'))->assertRedirect(route('login'));

    $this->actingAs($administrator)
        ->delete(route('admin.users.suspension.destroy', $organizer))
        ->assertRedirect();

    expect($organizer->refresh()->suspended_at)->toBeNull();
});

test('administrators cannot suspend another administrator', function () {
    $administrator = User::factory()->administrator()->create();
    $otherAdministrator = User::factory()->administrator()->create();

    $this->actingAs($administrator)
        ->post(route('admin.users.suspension.store', $otherAdministrator))
        ->assertNotFound();

    expect($otherAdministrator->refresh()->suspended_at)->toBeNull();
});

test('administrators can search suspend and reactivate public events', function () {
    $administrator = User::factory()->administrator()->create();
    $event = Event::factory()->published()->create(['title' => 'Casamento de Ana']);

    $this->actingAs($administrator)
        ->get(route('admin.events.index', ['search' => 'Casamento']))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->component('admin/events')
            ->has('events.data', 1)
            ->where('events.data.0.id', $event->id)
        );

    $this->post(route('admin.events.suspension.store', $event))->assertRedirect();
    expect($event->refresh()->suspended_at)->not->toBeNull();
    $this->get(route('public.events.show', $event->slug))->assertNotFound();

    $this->actingAs($administrator)
        ->delete(route('admin.events.suspension.destroy', $event))
        ->assertRedirect();
    expect($event->refresh()->suspended_at)->toBeNull();
    $this->get(route('public.events.show', $event->slug))->assertOk();
});
