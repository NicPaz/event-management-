<?php

use Illuminate\Support\Facades\Artisan;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\File;
use Illuminate\Support\Str;
use Symfony\Component\Process\Process;

test('two processes cannot reserve the same last gift unit', function () {
    $temporaryDirectory = sys_get_temp_dir().'/celebra-concurrency-'.Str::uuid();
    $databasePath = $temporaryDirectory.'/database.sqlite';
    $cachePath = $temporaryDirectory.'/cache';
    $barrierPath = $temporaryDirectory.'/start';
    File::ensureDirectoryExists($cachePath);
    File::put($databasePath, '');

    config([
        'database.connections.concurrency' => [
            ...config('database.connections.sqlite'),
            'database' => $databasePath,
        ],
    ]);

    try {
        Artisan::call('migrate:fresh', [
            '--database' => 'concurrency',
            '--force' => true,
        ]);

        $database = DB::connection('concurrency');
        $now = now();
        $userId = $database->table('users')->insertGetId([
            'name' => 'Organizadora',
            'email' => 'organizer@example.test',
            'password' => 'not-used-in-this-test',
            'created_at' => $now,
            'updated_at' => $now,
        ]);
        $eventId = $database->table('events')->insertGetId([
            'user_id' => $userId,
            'title' => 'Evento concorrente',
            'type' => 'other',
            'slug' => 'evento-concorrente',
            'timezone' => 'America/Sao_Paulo',
            'status' => 'published',
            'rsvp_open' => true,
            'reservations_open' => true,
            'published_at' => $now,
            'created_at' => $now,
            'updated_at' => $now,
        ]);
        $firstGuestId = $database->table('event_guests')->insertGetId([
            'event_id' => $eventId,
            'name' => 'Primeira Pessoa',
            'name_normalized' => 'primeira pessoa',
            'phone_normalized' => '5511999991111',
            'created_at' => $now,
            'updated_at' => $now,
        ]);
        $secondGuestId = $database->table('event_guests')->insertGetId([
            'event_id' => $eventId,
            'name' => 'Segunda Pessoa',
            'name_normalized' => 'segunda pessoa',
            'phone_normalized' => '5511999992222',
            'created_at' => $now,
            'updated_at' => $now,
        ]);
        $giftId = $database->table('gifts')->insertGetId([
            'event_id' => $eventId,
            'name' => 'Última unidade',
            'quantity_total' => 1,
            'quantity_reserved' => 0,
            'position' => 0,
            'created_at' => $now,
            'updated_at' => $now,
        ]);

        $workerPath = base_path('tests/Support/reserve-gift-worker.php');
        $processes = collect([
            'first' => $firstGuestId,
            'second' => $secondGuestId,
        ])->map(fn (int $guestId, string $workerName): Process => new Process([
            PHP_BINARY,
            $workerPath,
            $databasePath,
            $cachePath,
            $barrierPath,
            $workerName,
            (string) $guestId,
            (string) $giftId,
        ], base_path(), timeout: 15));

        $processes->each->start();
        $deadline = microtime(true) + 10;

        while (! File::exists($barrierPath.'.first.ready') || ! File::exists($barrierPath.'.second.ready')) {
            if (microtime(true) >= $deadline) {
                $this->fail('Os dois processos não ficaram prontos para o teste de concorrência.');
            }

            usleep(1_000);
        }

        File::put($barrierPath, 'start');
        $processes->each->wait();
        $results = $processes->map(fn (Process $process): string => trim($process->getOutput()))->sort()->values()->all();

        expect($results)->toBe(['reserved', 'unavailable'])
            ->and($processes->every(fn (Process $process): bool => $process->isSuccessful()))->toBeTrue()
            ->and($database->table('gifts')->where('id', $giftId)->value('quantity_reserved'))->toBe(1)
            ->and($database->table('gift_reservations')->where('gift_id', $giftId)->where('status', 'active')->count())->toBe(1);
    } finally {
        DB::disconnect('concurrency');
        File::deleteDirectory($temporaryDirectory);
    }
});
