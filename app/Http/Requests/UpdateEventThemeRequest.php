<?php

namespace App\Http\Requests;

use App\Models\Event;
use App\Support\EventThemeCatalog;
use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Validator;

class UpdateEventThemeRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        $event = $this->route('event');

        return $event instanceof Event && ($this->user()?->can('update', $event) ?? false);
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            'theme_key' => ['required', 'string', 'max:80'],
        ];
    }

    /** @return list<callable(Validator): void> */
    public function after(): array
    {
        return [function (Validator $validator): void {
            $event = $this->route('event');

            if ($event instanceof Event
                && ! app(EventThemeCatalog::class)->belongsToType($this->string('theme_key')->toString(), $event->type)) {
                $validator->errors()->add('theme_key', 'Selecione um tema disponível para este tipo de evento.');
            }
        }];
    }
}
