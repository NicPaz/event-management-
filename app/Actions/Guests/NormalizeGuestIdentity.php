<?php

namespace App\Actions\Guests;

use Illuminate\Support\Str;

class NormalizeGuestIdentity
{
    public function name(string $name): string
    {
        return Str::of($name)->squish()->lower()->ascii()->toString();
    }

    public function phone(string $phone): ?string
    {
        $digits = preg_replace('/\D+/', '', $phone);

        if ($digits === null) {
            return null;
        }

        if (strlen($digits) === 10 || strlen($digits) === 11) {
            $digits = '55'.$digits;
        }

        if (! preg_match('/^55[1-9][0-9][2-9][0-9]{7,8}$/', $digits)) {
            return null;
        }

        return $digits;
    }
}
