<?php

namespace App;

enum EventStatus: string
{
    case Draft = 'draft';
    case Published = 'published';
    case Closed = 'closed';
}
