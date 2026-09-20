<?php

namespace App\Actions\Gifts;

use App\Models\EventGuest;
use App\Models\Gift;
use App\Models\GiftReservation;

class CancelGiftReservation
{
    public function __construct(private UpdateGiftReservation $updateReservation) {}

    public function handle(EventGuest $guest, Gift $gift): GiftReservation
    {
        return $this->updateReservation->handle($guest, $gift, 0);
    }
}
