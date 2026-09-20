<?php

namespace App;

enum RsvpStatus: string
{
    case Unanswered = 'unanswered';
    case Confirmed = 'confirmed';
    case Declined = 'declined';
}
