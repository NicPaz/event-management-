<?php

use App\EventStatus;
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
