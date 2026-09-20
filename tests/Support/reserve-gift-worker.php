<?php

declare(strict_types=1);

use App\Actions\Gifts\ReserveGift;
use App\Models\EventGuest;
use App\Models\Gift;
use Illuminate\Contracts\Console\Kernel;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;

require dirname(__DIR__, 2).'/vendor/autoload.php';

$application = require dirname(__DIR__, 2).'/bootstrap/app.php';
$application->make(Kernel::class)->bootstrap();

[$script, $databasePath, $cachePath, $barrierPath, $workerName, $guestId, $giftId] = $argv;

config([
    'database.default' => 'sqlite',
    'database.connections.sqlite.database' => $databasePath,
    'cache.default' => 'file',
    'cache.stores.file.path' => $cachePath,
    'cache.stores.file.lock_path' => $cachePath,
]);
DB::purge('sqlite');

$guest = EventGuest::query()->findOrFail((int) $guestId);
$gift = Gift::query()->findOrFail((int) $giftId);
$readyPath = $barrierPath.'.'.$workerName.'.ready';
touch($readyPath);

$deadline = microtime(true) + 10;

while (! file_exists($barrierPath)) {
    if (microtime(true) >= $deadline) {
        fwrite(STDERR, 'A barreira de concorrência não foi liberada.');
        exit(2);
    }

    usleep(1_000);
}

try {
    $application->make(ReserveGift::class)->handle($guest, $gift, 1);
    fwrite(STDOUT, 'reserved');
} catch (ValidationException $exception) {
    $quantityError = $exception->errors()['quantity'][0] ?? null;

    if ($quantityError === 'A quantidade solicitada não está mais disponível.') {
        fwrite(STDOUT, 'unavailable');
        exit(0);
    }

    fwrite(STDERR, $exception->getMessage());
    exit(3);
}
