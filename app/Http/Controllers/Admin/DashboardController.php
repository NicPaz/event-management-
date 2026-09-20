<?php

namespace App\Http\Controllers\Admin;

use App\EventStatus;
use App\Http\Controllers\Controller;
use App\Models\Event;
use App\Models\User;
use App\UserRole;
use Inertia\Inertia;
use Inertia\Response;

class DashboardController extends Controller
{
    /**
     * Handle the incoming request.
     */
    public function __invoke(): Response
    {
        return Inertia::render('admin/dashboard', [
            'metrics' => [
                'organizers' => User::query()->where('role', UserRole::Organizer)->count(),
                'events' => Event::query()->count(),
                'publishedEvents' => Event::query()->where('status', EventStatus::Published)->count(),
                'suspendedUsers' => User::query()->whereNotNull('suspended_at')->count(),
            ],
        ]);
    }
}
