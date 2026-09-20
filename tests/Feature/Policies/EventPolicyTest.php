<?php

use App\Models\Event;
use App\Models\User;
use App\Policies\EventPolicy;

test('organizers can create and manage their own events', function () {
    $organizer = User::factory()->create();
    $event = Event::factory()->for($organizer)->create();
    $policy = new EventPolicy;

    expect([
        'viewAny' => $policy->viewAny($organizer),
        'create' => $policy->create($organizer),
        'view' => $policy->view($organizer, $event),
        'update' => $policy->update($organizer, $event),
        'delete' => $policy->delete($organizer, $event),
        'restore' => $policy->restore($organizer, $event),
        'forceDelete' => $policy->forceDelete($organizer, $event),
    ])->toBe([
        'viewAny' => true,
        'create' => true,
        'view' => true,
        'update' => true,
        'delete' => true,
        'restore' => true,
        'forceDelete' => false,
    ]);
});

test('organizers cannot manage another organizers event', function () {
    $organizer = User::factory()->create();
    $otherEvent = Event::factory()->for(User::factory())->create();
    $policy = new EventPolicy;

    expect([
        'view' => $policy->view($organizer, $otherEvent),
        'update' => $policy->update($organizer, $otherEvent),
        'delete' => $policy->delete($organizer, $otherEvent),
        'restore' => $policy->restore($organizer, $otherEvent),
    ])->toBe([
        'view' => false,
        'update' => false,
        'delete' => false,
        'restore' => false,
    ]);
});

test('administrators cannot manage organizer events through the organizer policy', function () {
    $administrator = User::factory()->administrator()->create();
    $event = Event::factory()->create();
    $policy = new EventPolicy;

    expect([
        'viewAny' => $policy->viewAny($administrator),
        'create' => $policy->create($administrator),
        'view' => $policy->view($administrator, $event),
        'update' => $policy->update($administrator, $event),
    ])->toBe([
        'viewAny' => false,
        'create' => false,
        'view' => false,
        'update' => false,
    ]);
});

test('suspended organizers cannot access events', function () {
    $organizer = User::factory()->suspended()->create();
    $event = Event::factory()->for($organizer)->create();
    $policy = new EventPolicy;

    expect([
        'viewAny' => $policy->viewAny($organizer),
        'create' => $policy->create($organizer),
        'view' => $policy->view($organizer, $event),
        'update' => $policy->update($organizer, $event),
    ])->toBe([
        'viewAny' => false,
        'create' => false,
        'view' => false,
        'update' => false,
    ]);
});
