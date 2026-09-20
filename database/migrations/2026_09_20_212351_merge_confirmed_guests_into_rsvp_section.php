<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::table('events', function (Blueprint $table) {
            $table->boolean('show_confirmed_guests')->default(false)->after('rsvp_open');
        });

        DB::table('event_sections')
            ->where('type', 'confirmed_guests')
            ->where('enabled', true)
            ->select('event_id')
            ->orderBy('event_id')
            ->chunkById(200, function ($sections): void {
                DB::table('events')
                    ->whereIn('id', $sections->pluck('event_id'))
                    ->update(['show_confirmed_guests' => true]);
            }, 'event_id');

        DB::table('event_sections')->where('type', 'confirmed_guests')->delete();

        $this->normalizeSectionPositions();
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        $now = now();

        DB::table('events')->select(['id', 'show_confirmed_guests'])->orderBy('id')->chunkById(200, function ($events) use ($now): void {
            foreach ($events as $event) {
                $lastPosition = DB::table('event_sections')->where('event_id', $event->id)->max('position');
                $nextPosition = $lastPosition === null ? 0 : ((int) $lastPosition) + 1;

                DB::table('event_sections')->insertOrIgnore([
                    'event_id' => $event->id,
                    'type' => 'confirmed_guests',
                    'enabled' => (bool) $event->show_confirmed_guests,
                    'position' => $nextPosition,
                    'created_at' => $now,
                    'updated_at' => $now,
                ]);
            }
        });

        Schema::table('events', function (Blueprint $table) {
            $table->dropColumn('show_confirmed_guests');
        });
    }

    private function normalizeSectionPositions(): void
    {
        DB::table('events')->select('id')->orderBy('id')->chunkById(200, function ($events): void {
            foreach ($events as $event) {
                $sections = DB::table('event_sections')
                    ->where('event_id', $event->id)
                    ->orderBy('position')
                    ->orderBy('id')
                    ->get(['id', 'position']);

                foreach ($sections as $position => $section) {
                    if ((int) $section->position !== $position) {
                        DB::table('event_sections')
                            ->where('id', $section->id)
                            ->update(['position' => $position]);
                    }
                }
            }
        });
    }
};
