<?php

namespace App;

enum UserRole: string
{
    case Organizer = 'organizer';
    case Administrator = 'administrator';
}
