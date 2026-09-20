<?php

namespace App\Http\Requests;

use App\Actions\Guests\NormalizeGuestIdentity;
use App\Models\Event;
use App\Models\EventGuest;
use App\RsvpStatus;
use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;
use Illuminate\Validation\Validator;

class UpdateEventGuestRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        $event = $this->route('event');
        $guest = $this->route('guest');

        return $event instanceof Event
            && $guest instanceof EventGuest
            && $guest->event_id === $event->id
            && ($this->user()?->can('update', $event) ?? false);
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            'name' => ['required', 'string', 'max:120'],
            'phone' => ['required', 'string', 'max:24'],
            'status' => ['required', Rule::enum(RsvpStatus::class)],
            'companions_count' => ['required', 'integer', 'min:0', 'max:100'],
        ];
    }

    /** @return list<callable(Validator): void> */
    public function after(): array
    {
        return [
            function (Validator $validator): void {
                if ($validator->errors()->has('phone')) {
                    return;
                }

                $event = $this->route('event');
                $guest = $this->route('guest');
                $phone = app(NormalizeGuestIdentity::class)->phone($this->string('phone')->toString());

                if ($phone === null) {
                    $validator->errors()->add('phone', 'Informe um telefone brasileiro válido com DDD.');

                    return;
                }

                if ($event instanceof Event && $guest instanceof EventGuest
                    && $event->guests()->where('phone_normalized', $phone)->whereKeyNot($guest->id)->exists()) {
                    $validator->errors()->add('phone', 'Este telefone já pertence a outro convidado do evento.');
                }
            },
        ];
    }
}
