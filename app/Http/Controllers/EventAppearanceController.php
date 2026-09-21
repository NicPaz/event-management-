<?php

namespace App\Http\Controllers;

use App\Actions\Events\GetEventInvitation;
use App\Actions\Events\UpdateEventAppearance;
use App\Http\Requests\UpdateEventAppearanceRequest;
use App\Models\Event;
use App\Support\EventFontCatalog;
use App\Support\EventThemeCatalog;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Gate;
use Inertia\Inertia;
use Inertia\Response;

class EventAppearanceController extends Controller
{
    public function edit(
        Request $request,
        Event $event,
        GetEventInvitation $invitation,
        EventThemeCatalog $themes,
        EventFontCatalog $fonts,
    ): Response {
        Gate::authorize('update', $event);

        return Inertia::render('dashboard/events/appearance', [
            'event' => $invitation->handle($event),
            'themeOptions' => $themes->forType($event->type),
            'fontOptions' => [
                'titles' => $fonts->titleOptions(),
                'body' => $fonts->bodyOptions(),
            ],
            'creationFlow' => $request->boolean('creation'),
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
