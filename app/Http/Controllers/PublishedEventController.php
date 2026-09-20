<?php

namespace App\Http\Controllers;

use App\Actions\Events\PublishEvent;
use App\Models\Event;
use Illuminate\Http\RedirectResponse;
use Illuminate\Support\Facades\Gate;

class PublishedEventController extends Controller
{
    public function store(Event $event, PublishEvent $publishEvent): RedirectResponse
    {
        Gate::authorize('update', $event);
        $publishEvent->handle($event);

        return back()->with('success', 'Evento publicado.');
    }
}
