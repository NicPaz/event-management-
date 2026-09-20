<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        $now = now();

        DB::table('events')->select('id')->orderBy('id')->chunkById(200, function ($events) use ($now): void {
            foreach ($events as $event) {
                $nextPosition = ((int) DB::table('event_sections')->where('event_id', $event->id)->max('position')) + 1;

                DB::table('event_sections')->insertOrIgnore([
                    'event_id' => $event->id,
                    'type' => 'confirmed_guests',
                    'enabled' => false,
                    'position' => $nextPosition,
                    'created_at' => $now,
                    'updated_at' => $now,
                ]);
            }
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        DB::table('event_sections')->where('type', 'confirmed_guests')->delete();
    }
};
