<?php

namespace App\Http\Controllers;

use App\Actions\Events\ApplyEventTheme;
use App\Http\Requests\UpdateEventThemeRequest;
use App\Models\Event;
use Illuminate\Http\RedirectResponse;

class EventThemeController extends Controller
{
    public function update(
        UpdateEventThemeRequest $request,
        Event $event,
        ApplyEventTheme $applyTheme,
    ): RedirectResponse {
        $applyTheme->handle($event, $request->string('theme_key')->toString());

        return back()->with('success', 'Tema aplicado e aparência original restaurada.');
    }
}
