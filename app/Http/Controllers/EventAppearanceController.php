<?php

namespace App\Http\Controllers;

use App\Actions\Events\GetEventInvitation;
use App\Actions\Events\UpdateEventAppearance;
use App\Http\Requests\UpdateEventAppearanceRequest;
use App\Models\Event;
use App\Support\EventThemeCatalog;
use Illuminate\Http\RedirectResponse;
use Illuminate\Support\Facades\Gate;
use Inertia\Inertia;
use Inertia\Response;

class EventAppearanceController extends Controller
{
    public function edit(
        Event $event,
        GetEventInvitation $invitation,
        EventThemeCatalog $themes,
    ): Response {
        Gate::authorize('update', $event);

        return Inertia::render('dashboard/events/appearance', [
            'event' => $invitation->handle($event),
            'themeOptions' => $themes->forType($event->type),
        ]);
    }

    public function update(
        UpdateEventAppearanceRequest $request,
        Event $event,
        UpdateEventAppearance $updateAppearance,
    ): RedirectResponse {
        $updateAppearance->handle(
            $event,
            $request->validated(),
            $request->file('banner'),
            $request->file('background'),
        );

        return back()->with('success', 'Aparência do evento atualizada.');
    }
}
