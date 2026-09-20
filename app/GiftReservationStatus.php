<?php

namespace App;

enum GiftReservationStatus: string
{
    case Active = 'active';
    case Cancelled = 'cancelled';
}
