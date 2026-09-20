<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\AuditLog;
use App\Models\User;
use App\UserRole;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class SuspendedUserController extends Controller
{
    public function store(Request $request, User $user): RedirectResponse
    {
        $this->ensureOrganizer($user);

        DB::transaction(function () use ($request, $user): void {
            $user->forceFill(['suspended_at' => now()])->save();
            $this->audit($request->user(), $user, 'admin.user_suspended');
        });

        return back()->with('success', 'Conta suspensa.');
    }

    public function destroy(Request $request, User $user): RedirectResponse
    {
        $this->ensureOrganizer($user);

        DB::transaction(function () use ($request, $user): void {
            $user->forceFill(['suspended_at' => null])->save();
            $this->audit($request->user(), $user, 'admin.user_reactivated');
        });

        return back()->with('success', 'Conta reativada.');
    }

    private function ensureOrganizer(User $user): void
    {
        abort_unless($user->role === UserRole::Organizer, 404);
    }

    private function audit(User $actor, User $subject, string $action): void
    {
        AuditLog::query()->create([
            'actor_type' => 'user',
            'actor_id' => $actor->id,
            'action' => $action,
            'subject_type' => User::class,
            'subject_id' => $subject->id,
            'summary' => ['suspended' => $subject->suspended_at !== null],
        ]);
    }
}
