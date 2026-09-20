<?php

namespace App\Http\Controllers;

use App\Actions\Events\CloseEvent;
use App\Actions\Events\ReopenEvent;
use App\Models\Event;
use Illuminate\Http\RedirectResponse;
use Illuminate\Support\Facades\Gate;

class ClosedEventController extends Controller
{
    public function store(Event $event, CloseEvent $closeEvent): RedirectResponse
    {
        Gate::authorize('update', $event);
        $closeEvent->handle($event);

        return back()->with('success', 'Evento encerrado.');
    }

    public function destroy(Event $event, ReopenEvent $reopenEvent): RedirectResponse
    {
        Gate::authorize('update', $event);
        $reopenEvent->handle($event);

        return back()->with('success', 'Evento reaberto.');
    }
}
