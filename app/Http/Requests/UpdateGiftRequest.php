<?php

namespace App\Http\Requests;

use App\Models\Event;
use App\Models\Gift;
use Illuminate\Validation\Validator;

class UpdateGiftRequest extends StoreGiftRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        $event = $this->route('event');
        $gift = $this->route('gift');

        return $event instanceof Event
            && $gift instanceof Gift
            && $gift->event_id === $event->id
            && ($this->user()?->can('update', $event) ?? false);
    }

    /** @return list<callable(Validator): void> */
    public function after(): array
    {
        return [
            function (Validator $validator): void {
                $gift = $this->route('gift');

                if ($gift instanceof Gift
                    && ! $validator->errors()->has('quantity_total')
                    && $this->integer('quantity_total') < $gift->quantity_reserved) {
                    $validator->errors()->add(
                        'quantity_total',
                        'A quantidade total não pode ser menor que a quantidade já reservada.',
                    );
                }
            },
        ];
    }
}
