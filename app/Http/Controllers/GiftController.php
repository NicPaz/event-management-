<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreGiftRequest;
use App\Http\Requests\UpdateGiftRequest;
use App\Models\Event;
use App\Models\Gift;
use Illuminate\Http\RedirectResponse;
use Illuminate\Support\Facades\Gate;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;
use Inertia\Response;

class GiftController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(Event $event): Response
    {
        Gate::authorize('view', $event);

        return Inertia::render('dashboard/events/gifts', [
            'event' => ['id' => $event->id, 'title' => $event->title],
            'gifts' => $event->gifts()->get()->map(fn (Gift $gift): array => $this->giftData($gift)),
        ]);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(StoreGiftRequest $request, Event $event): RedirectResponse
    {
        $attributes = $request->safe()->only(['name', 'description', 'purchase_url', 'quantity_total']);
        $attributes['position'] = ((int) $event->gifts()->max('position')) + 1;

        if ($request->hasFile('image')) {
            $attributes['image_path'] = $request->file('image')->store("events/{$event->id}/gifts", 'public');
        }

        $event->gifts()->create($attributes);

        return back()->with('success', 'Presente adicionado.');
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(UpdateGiftRequest $request, Event $event, Gift $gift): RedirectResponse
    {
        $attributes = $request->safe()->only(['name', 'description', 'purchase_url', 'quantity_total']);

        if ($request->hasFile('image')) {
            $newImagePath = $request->file('image')->store("events/{$event->id}/gifts", 'public');
            $oldImagePath = $gift->image_path;
            $attributes['image_path'] = $newImagePath;
            $gift->update($attributes);

            if ($oldImagePath !== null) {
                Storage::disk('public')->delete($oldImagePath);
            }
        } else {
            $gift->update($attributes);
        }

        return back()->with('success', 'Presente atualizado.');
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Event $event, Gift $gift): RedirectResponse
    {
        Gate::authorize('update', $event);
        abort_unless($gift->event_id === $event->id, 404);
        $gift->update(['archived_at' => now()]);

        return back()->with('success', 'Presente arquivado.');
    }

    /** @return array<string, bool|int|string|null> */
    private function giftData(Gift $gift): array
    {
        return [
            'id' => $gift->id,
            'name' => $gift->name,
            'description' => $gift->description,
            'purchaseUrl' => $gift->purchase_url,
            'imageUrl' => $gift->image_path === null ? null : Storage::disk('public')->url($gift->image_path),
            'quantityTotal' => $gift->quantity_total,
            'quantityReserved' => $gift->quantity_reserved,
            'quantityAvailable' => $gift->quantity_total - $gift->quantity_reserved,
            'archived' => $gift->archived_at !== null,
        ];
    }
}
