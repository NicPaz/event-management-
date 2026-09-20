<?php

namespace App\Support;

use App\Models\Event;
use App\Models\EventTheme;
use Illuminate\Support\Facades\Storage;

class EventAssetStorage
{
    public function deleteIfOwnedAndUnreferenced(Event $event, ?string $path): void
    {
        if ($path === null || ! str_starts_with($path, "events/{$event->id}/")) {
            return;
        }

        $isReferenced = EventTheme::query()
            ->where('banner_path', $path)
            ->orWhere('background_path', $path)
            ->exists();

        if (! $isReferenced) {
            Storage::disk('public')->delete($path);
        }
    }
}
