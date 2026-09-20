<?php

use App\Models\User;
use App\UserRole;
use Laravel\Fortify\Features;

beforeEach(function () {
    $this->skipUnlessFortifyHas(Features::registration());
});

test('registration screen can be rendered', function () {
    $response = $this->get(route('register'));

    $response->assertOk();
});

test('new users can register', function () {
    $response = $this->post(route('register.store'), [
        'name' => 'Test User',
        'email' => 'test@example.com',
        'password' => 'password',
        'password_confirmation' => 'password',
    ]);

    $this->assertAuthenticated();
    $response->assertRedirect(route('dashboard', absolute: false));
    expect(User::query()->where('email', 'test@example.com')->sole()->role)->toBe(UserRole::Organizer);
});

test('registration cannot elevate the account role', function () {
    $response = $this->post(route('register.store'), [
        'name' => 'Test User',
        'email' => 'organizer@example.com',
        'password' => 'password',
        'password_confirmation' => 'password',
        'role' => UserRole::Administrator->value,
    ]);

    $response->assertRedirect(route('dashboard', absolute: false));
    $this->assertDatabaseHas('users', [
        'email' => 'organizer@example.com',
        'role' => UserRole::Organizer->value,
    ]);
});
