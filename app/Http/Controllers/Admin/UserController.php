<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\User;
use App\UserRole;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class UserController extends Controller
{
    public function index(Request $request): Response
    {
        $search = str($request->string('search')->toString())->squish()->limit(120)->toString();

        $users = User::query()
            ->where('role', UserRole::Organizer)
            ->withCount('events')
            ->when($search !== '', fn (Builder $query): Builder => $query->where(
                fn (Builder $query): Builder => $query
                    ->where('name', 'like', "%{$search}%")
                    ->orWhere('email', 'like', "%{$search}%"),
            ))
            ->latest('id')
            ->paginate(15)
            ->withQueryString()
            ->through(fn (User $user): array => [
                'id' => $user->id,
                'name' => $user->name,
                'email' => $user->email,
                'eventsCount' => $user->events_count,
                'suspended' => $user->suspended_at !== null,
                'createdAt' => $user->created_at?->toIso8601String(),
            ]);

        return Inertia::render('admin/users', [
            'users' => $users,
            'filters' => ['search' => $search],
        ]);
    }
}
