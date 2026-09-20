<?php

namespace App\Http\Requests;

use App\Actions\Guests\NormalizeGuestIdentity;
use App\Models\Event;
use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Database\Query\Builder;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;
use Illuminate\Validation\Validator;

class IdentifyGuestRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return true;
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        $event = $this->route('event');

        return [
            'name' => ['required', 'string', 'max:120'],
            'phone' => ['required', 'string', 'max:24'],
            'gift_id' => [
                'nullable',
                'integer',
                Rule::exists('gifts', 'id')->where(
                    fn (Builder $query): Builder => $query
                        ->where('event_id', $event instanceof Event ? $event->id : 0)
                        ->whereNull('archived_at'),
                ),
            ],
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

                if (app(NormalizeGuestIdentity::class)->phone($this->string('phone')->toString()) === null) {
                    $validator->errors()->add('phone', 'Informe um telefone brasileiro válido com DDD.');
                }
            },
        ];
    }
}
