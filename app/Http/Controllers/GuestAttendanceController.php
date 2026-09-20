<?php

namespace App\Http\Controllers;

use App\Actions\Guests\ResolveGuestAccess;
use App\Actions\Guests\UpdateGuestAttendance;
use App\EventStatus;
use App\Http\Requests\CancelGuestAttendanceRequest;
use App\Http\Requests\UpdateGuestAttendanceRequest;
use App\Models\Event;
use App\RsvpStatus;
use Illuminate\Http\RedirectResponse;
use Illuminate\Validation\ValidationException;

class GuestAttendanceController extends Controller
{
    public function update(
        UpdateGuestAttendanceRequest $request,
        Event $event,
        ResolveGuestAccess $access,
        UpdateGuestAttendance $attendance,
    ): RedirectResponse {
        abort_unless($event->isPubliclyAvailable(), 404);

        if ($event->status !== EventStatus::Published || ! $event->rsvp_open) {
            throw ValidationException::withMessages([
                'attendance' => 'As confirmações de presença estão fechadas.',
            ]);
        }

        $guest = $access->handle($request, $event);

        if ($guest === null) {
            throw ValidationException::withMessages([
                'identity' => 'Identifique-se novamente para gerenciar sua participação.',
            ]);
        }

        $status = RsvpStatus::from($request->string('status')->toString());

        if ($status === RsvpStatus::Declined) {
            $attendance->cancel(
                $guest,
                $request->string('reservation_handling')->toString(),
            );
        } else {
            $attendance->confirm($guest, $status, $request->integer('companions_count'));
        }

        return redirect()->route('public.events.show', $event->slug)
            ->with('success', 'Sua resposta foi atualizada.');
    }

    public function destroy(
        CancelGuestAttendanceRequest $request,
        Event $event,
        ResolveGuestAccess $access,
        UpdateGuestAttendance $attendance,
    ): RedirectResponse {
        abort_unless($event->isPubliclyAvailable(), 404);

        if ($event->status !== EventStatus::Published) {
            throw ValidationException::withMessages([
                'attendance' => 'Este evento está disponível somente para consulta.',
            ]);
        }

        $guest = $access->handle($request, $event);

        if ($guest === null) {
            throw ValidationException::withMessages([
                'identity' => 'Identifique-se novamente para gerenciar sua participação.',
            ]);
        }

        $attendance->cancel(
            $guest,
            $request->string('reservation_handling')->toString(),
        );

        return redirect()->route('public.events.show', $event->slug)
            ->with('success', 'Presença cancelada.');
    }
}
