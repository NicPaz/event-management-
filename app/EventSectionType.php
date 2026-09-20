<?php

namespace App;

enum EventSectionType: string
{
    case Cover = 'cover';
    case Welcome = 'welcome';
    case Information = 'information';
    case Countdown = 'countdown';
    case Palette = 'palette';
    case Gifts = 'gifts';
    case Instructions = 'instructions';
    case Rsvp = 'rsvp';

    public function label(): string
    {
        return match ($this) {
            self::Cover => 'Capa',
            self::Welcome => 'Boas-vindas',
            self::Information => 'Informações',
            self::Countdown => 'Contagem regressiva',
            self::Palette => 'Paleta da casa',
            self::Gifts => 'Presentes',
            self::Instructions => 'Orientações',
            self::Rsvp => 'Confirmação de presença',
        };
    }
}
