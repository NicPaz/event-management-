<?php

namespace App\Policies;

use App\Models\Event;
use App\Models\User;
use App\UserRole;

class EventPolicy
{
    /**
     * Determine whether the user can view any models.
     */
    public function viewAny(User $user): bool
    {
        return $this->isActiveOrganizer($user);
    }

    /**
     * Determine whether the user can view the model.
     */
    public function view(User $user, Event $event): bool
    {
        return $this->isActiveOrganizer($user) && $event->user_id === $user->id;
    }

    /**
     * Determine whether the user can create models.
     */
    public function create(User $user): bool
    {
        return $this->isActiveOrganizer($user);
    }

    /**
     * Determine whether the user can update the model.
     */
    public function update(User $user, Event $event): bool
    {
        return $this->view($user, $event);
    }

    /**
     * Determine whether the user can delete the model.
     */
    public function delete(User $user, Event $event): bool
    {
        return $this->view($user, $event);
    }

    /**
     * Determine whether the user can restore the model.
     */
    public function restore(User $user, Event $event): bool
    {
        return $this->view($user, $event);
    }

    /**
     * Determine whether the user can permanently delete the model.
     */
    public function forceDelete(User $user, Event $event): bool
    {
        return false;
    }

    private function isActiveOrganizer(User $user): bool
    {
        return $user->role === UserRole::Organizer && $user->suspended_at === null;
    }
}
