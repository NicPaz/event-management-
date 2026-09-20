<?php

use App\Models\User;
use App\UserRole;
use Illuminate\Support\Facades\Hash;

test('the command creates an administrator with a hidden password prompt', function () {
    $this->artisan('celebra:create-admin', [
        '--name' => 'Admin Celebra',
        '--email' => 'ADMIN@EXAMPLE.COM',
    ])
        ->expectsQuestion('Senha', 'password')
        ->expectsQuestion('Confirme a senha', 'password')
        ->expectsOutputToContain('Conta administradora criada.')
        ->assertSuccessful();

    $administrator = User::query()->where('email', 'admin@example.com')->sole();

    expect($administrator->role)->toBe(UserRole::Administrator)
        ->and(Hash::check('password', $administrator->password))->toBeTrue();
});

test('the command refuses a duplicate email without changing the account', function () {
    $organizer = User::factory()->create(['email' => 'existing@example.com']);

    $this->artisan('celebra:create-admin', [
        '--name' => 'Admin Celebra',
        '--email' => 'existing@example.com',
    ])
        ->expectsQuestion('Senha', 'password')
        ->expectsQuestion('Confirme a senha', 'password')
        ->assertFailed();

    expect($organizer->refresh()->role)->toBe(UserRole::Organizer);
});
