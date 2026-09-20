<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Event;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class EventController extends Controller
{
    public function index(Request $request): Response
    {
        $search = str($request->string('search')->toString())->squish()->limit(120)->toString();

        $events = Event::query()
            ->with('user:id,name,email,suspended_at')
            ->when($search !== '', fn (Builder $query): Builder => $query->where(
                fn (Builder $query): Builder => $query
                    ->where('title', 'like', "%{$search}%")
                    ->orWhereHas('user', fn (Builder $query): Builder => $query
                        ->where('name', 'like', "%{$search}%")
                        ->orWhere('email', 'like', "%{$search}%")),
            ))
            ->latest('id')
            ->paginate(15)
            ->withQueryString()
            ->through(fn (Event $event): array => [
                'id' => $event->id,
                'title' => $event->title,
                'status' => $event->status->value,
                'suspended' => $event->suspended_at !== null,
                'organizer' => [
                    'name' => $event->user->name,
                    'email' => $event->user->email,
                    'suspended' => $event->user->suspended_at !== null,
                ],
                'createdAt' => $event->created_at?->toIso8601String(),
            ]);

        return Inertia::render('admin/events', [
            'events' => $events,
            'filters' => ['search' => $search],
        ]);
    }
}
