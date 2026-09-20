<?php

namespace App;

enum EventType: string
{
    case Housewarming = 'housewarming';
    case Wedding = 'wedding';
    case Birthday = 'birthday';
    case KitchenTea = 'kitchen_tea';
    case Other = 'other';
}
