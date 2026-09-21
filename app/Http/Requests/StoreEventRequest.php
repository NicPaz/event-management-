<?php

namespace App\Http\Requests;

use App\EventType;
use App\Models\Event;
use App\Support\EventThemeCatalog;
use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;
use Illuminate\Validation\Validator;

class StoreEventRequest extends FormRequest
{
    protected function prepareForValidation(): void
    {
        if ($this->route('event') !== null || $this->filled('theme_key')) {
            return;
        }

        $type = EventType::tryFrom($this->string('type')->toString());
        $themeKey = $type === null
            ? null
            : data_get(app(EventThemeCatalog::class)->forType($type), '0.key');

        if (is_string($themeKey)) {
            $this->merge(['theme_key' => $themeKey]);
        }
    }

    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return $this->user()?->can('create', Event::class) ?? false;
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            'title' => ['required', 'string', 'max:120'],
            'type' => ['required', Rule::enum(EventType::class)],
            'theme_key' => [Rule::requiredIf($this->route('event') === null), 'nullable', 'string', 'max:80'],
            'starts_at' => [Rule::requiredIf($this->isCreationStep()), 'date_format:Y-m-d\TH:i'],
            'venue_name' => [Rule::requiredIf($this->isCreationStep()), 'string', 'max:255'],
            'address' => [Rule::requiredIf($this->isCreationStep()), 'string', 'max:500'],
            'welcome_text' => ['nullable', 'string', 'max:5000'],
            'instructions' => ['nullable', 'string', 'max:5000'],
        ];
    }

    /** @return array<string, string> */
    public function messages(): array
    {
        return [
            'title.required' => 'Informe o nome do evento.',
            'type.required' => 'Selecione o tipo do evento.',
            'starts_at.required' => 'Informe a data e o horário do evento.',
            'venue_name.required' => 'Informe o nome do local.',
            'address.required' => 'Informe o endereço do evento.',
        ];
    }

    private function isCreationStep(): bool
    {
        return $this->route('event') === null || $this->boolean('creation');
    }

    /** @return list<callable(Validator): void> */
    public function after(): array
    {
        return [function (Validator $validator): void {
            if ($validator->errors()->hasAny(['type', 'theme_key']) || ! $this->filled('theme_key')) {
                return;
            }

            $type = EventType::tryFrom($this->string('type')->toString());

            if ($type !== null
                && ! app(EventThemeCatalog::class)->belongsToType($this->string('theme_key')->toString(), $type)) {
                $validator->errors()->add('theme_key', 'Selecione um tema disponível para o tipo de evento.');
            }
        }];
    }
}
