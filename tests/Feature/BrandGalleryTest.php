<?php

use App\Models\User;
use Inertia\Testing\AssertableInertia as Assert;

test('guests must authenticate to view the brand gallery', function () {
    $this->get(route('brand.gallery'))->assertRedirect(route('login'));
});

test('organizers cannot view the brand gallery outside local development', function () {
    $organizer = User::factory()->create();

    $this->actingAs($organizer)
        ->get(route('brand.gallery'))
        ->assertForbidden();
});

test('administrators can view the brand gallery', function () {
    $administrator = User::factory()->administrator()->create();

    $this->actingAs($administrator)
        ->get(route('brand.gallery'))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->component('brand-gallery')
        );
});
