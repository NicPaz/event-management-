<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreGiftRequest;
use App\Http\Requests\UpdateGiftRequest;
use App\Models\Event;
use App\Models\Gift;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Gate;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;
use Inertia\Inertia;
use Inertia\Response;

class GiftController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(Request $request, Event $event): Response
    {
        Gate::authorize('view', $event);

        return Inertia::render('dashboard/events/gifts', [
            'event' => ['id' => $event->id, 'title' => $event->title],
            'gifts' => $event->gifts()->whereNull('archived_at')->get()->map(fn (Gift $gift): array => $this->giftData($gift)),
            'creationFlow' => $request->boolean('creation'),
        ]);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(StoreGiftRequest $request, Event $event): RedirectResponse
    {
        $attributes = $request->safe()->only(['name', 'description', 'purchase_url', 'quantity_total']);
        $attributes['price_cents'] = $this->priceInCents($request->validated('price'));
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
        $attributes['price_cents'] = $this->priceInCents($request->validated('price'));
        $oldImagePath = $gift->image_path;

        if ($request->hasFile('image')) {
            $attributes['image_path'] = $request->file('image')->store("events/{$event->id}/gifts", 'public');
        } elseif ($request->boolean('remove_image')) {
            $attributes['image_path'] = null;
        }

        $gift->update($attributes);

        if ($oldImagePath !== null && $oldImagePath !== $gift->image_path) {
            $this->deleteManagedImageIfUnused($event, $oldImagePath);
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
            'priceCents' => $gift->price_cents,
            'purchaseUrl' => $gift->purchase_url,
            'imageUrl' => $gift->image_path === null ? null : Storage::disk('public')->url($gift->image_path),
            'quantityTotal' => $gift->quantity_total,
            'quantityReserved' => $gift->quantity_reserved,
            'quantityAvailable' => $gift->quantity_total - $gift->quantity_reserved,
            'archived' => $gift->archived_at !== null,
        ];
    }

    private function priceInCents(mixed $price): ?int
    {
        if ($price === null || $price === '') {
            return null;
        }

        [$whole, $fraction] = array_pad(explode('.', (string) $price, 2), 2, '');

        return ((int) $whole * 100) + (int) str_pad(Str::substr($fraction, 0, 2), 2, '0');
    }

    private function deleteManagedImageIfUnused(Event $event, string $imagePath): void
    {
        if (! Str::startsWith($imagePath, "events/{$event->id}/gifts/")) {
            return;
        }

        if (Gift::query()->where('image_path', $imagePath)->exists()) {
            return;
        }

        Storage::disk('public')->delete($imagePath);
    }
}
