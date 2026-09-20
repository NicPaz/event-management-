<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\AuditLog;
use App\Models\Event;
use App\Models\User;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class SuspendedEventController extends Controller
{
    public function store(Request $request, Event $event): RedirectResponse
    {
        DB::transaction(function () use ($request, $event): void {
            $event->forceFill(['suspended_at' => now()])->save();
            $this->audit($request->user(), $event, 'admin.event_suspended');
        });

        return back()->with('success', 'Evento suspenso.');
    }

    public function destroy(Request $request, Event $event): RedirectResponse
    {
        DB::transaction(function () use ($request, $event): void {
            $event->forceFill(['suspended_at' => null])->save();
            $this->audit($request->user(), $event, 'admin.event_reactivated');
        });

        return back()->with('success', 'Evento reativado.');
    }

    private function audit(User $actor, Event $event, string $action): void
    {
        AuditLog::query()->create([
            'event_id' => $event->id,
            'actor_type' => 'user',
            'actor_id' => $actor->id,
            'action' => $action,
            'subject_type' => Event::class,
            'subject_id' => $event->id,
            'summary' => ['suspended' => $event->suspended_at !== null],
        ]);
    }
}
