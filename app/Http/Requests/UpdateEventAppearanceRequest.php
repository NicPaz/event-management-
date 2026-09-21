<?php

namespace App\Http\Requests;

use App\EventSectionType;
use App\Models\Event;
use App\Models\EventTheme;
use App\Support\EventFontCatalog;
use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;
use Illuminate\Validation\Validator;

class UpdateEventAppearanceRequest extends FormRequest
{
    protected function prepareForValidation(): void
    {
        $event = $this->route('event');
        $theme = $event instanceof Event ? $event->theme()->firstOrNew() : new EventTheme;

        $this->merge([
            'background_fill' => $this->input('background_fill', $theme->background_fill),
            'background_position' => $this->input('background_position', $theme->background_position),
            'background_overlay' => $this->input('background_overlay', $theme->background_overlay),
            'background_overlay_opacity' => $this->input('background_overlay_opacity', $theme->background_overlay_opacity),
            'title_font' => $this->input('title_font', $theme->title_font),
            'body_font' => $this->input('body_font', $theme->body_font),
            'show_confirmed_guests' => $this->input('show_confirmed_guests', $event instanceof Event ? $event->show_confirmed_guests : false),
            'sections' => $this->input('sections', []),
        ]);
    }

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
        $fonts = app(EventFontCatalog::class);

        return [
            'background_color' => ['required', 'regex:/^#[0-9A-Fa-f]{6}$/'],
            'surface_color' => ['required', 'regex:/^#[0-9A-Fa-f]{6}$/'],
            'text_color' => ['required', 'regex:/^#[0-9A-Fa-f]{6}$/'],
            'accent_color' => ['required', 'regex:/^#[0-9A-Fa-f]{6}$/'],
            'border_color' => ['required', 'regex:/^#[0-9A-Fa-f]{6}$/'],
            'title_font' => ['required', Rule::in($fonts->titleKeys())],
            'body_font' => ['required', Rule::in($fonts->bodyKeys())],
            'show_confirmed_guests' => ['required', 'boolean'],
            'banner' => ['nullable', 'image', 'mimes:jpg,jpeg,png,webp', 'max:5120', 'dimensions:max_width=6000,max_height=4000'],
            'banner_position' => ['required', Rule::in(['top', 'center', 'bottom'])],
            'remove_banner' => ['sometimes', 'boolean'],
            'background' => ['nullable', 'image', 'mimes:jpg,jpeg,png,webp', 'max:5120', 'dimensions:max_width=6000,max_height=6000'],
            'background_fill' => ['required', Rule::in(['cover', 'repeat'])],
            'background_position' => ['required', Rule::in(['top', 'center', 'bottom', 'left', 'right'])],
            'background_overlay' => ['required', Rule::in(['light', 'dark'])],
            'background_overlay_opacity' => ['required', 'integer', 'between:0,80'],
            'remove_background' => ['sometimes', 'boolean'],
            'sections' => ['required', 'array', 'size:'.count(EventSectionType::cases())],
            'sections.*.type' => ['required', 'distinct', Rule::enum(EventSectionType::class)],
            'sections.*.enabled' => ['required', 'boolean'],
            'sections.*.position' => ['required', 'integer', 'between:0,'.(count(EventSectionType::cases()) - 1), 'distinct'],
            'palette_items' => ['sometimes', 'array', 'max:20'],
            'palette_items.*.label' => ['required', 'string', 'max:80'],
            'palette_items.*.color_hex' => ['nullable', 'regex:/^#[0-9A-Fa-f]{6}$/'],
            'palette_items.*.material' => ['nullable', 'string', 'max:80'],
            'palette_items.*.position' => ['required', 'integer', 'min:0', 'distinct'],
        ];
    }

    /**
     * @return list<callable(Validator): void>
     */
    public function after(): array
    {
        return [
            function (Validator $validator): void {
                if (! $validator->errors()->hasAny(['background_color', 'surface_color', 'text_color'])) {
                    $text = $this->string('text_color')->toString();

                    if ($this->contrastRatio($text, $this->string('background_color')->toString()) < 4.5
                        || $this->contrastRatio($text, $this->string('surface_color')->toString()) < 4.5) {
                        $validator->errors()->add(
                            'text_color',
                            'Escolha uma cor de texto com contraste mínimo de 4,5:1 sobre o fundo e a superfície.',
                        );
                    }
                }

                $sections = $this->input('sections', []);
                $sectionTypes = [];

                if (is_array($sections)) {
                    foreach ($sections as $section) {
                        if (is_array($section) && is_string($section['type'] ?? null)) {
                            $sectionTypes[] = $section['type'];
                        }
                    }
                }

                sort($sectionTypes);
                $expectedTypes = collect(EventSectionType::cases())->map->value->sort()->values()->all();

                if ($sectionTypes !== $expectedTypes) {
                    $validator->errors()->add('sections', 'Envie cada seção do evento exatamente uma vez.');
                }
            },
        ];
    }

    private function contrastRatio(string $first, string $second): float
    {
        $lighter = max($this->relativeLuminance($first), $this->relativeLuminance($second));
        $darker = min($this->relativeLuminance($first), $this->relativeLuminance($second));

        return ($lighter + 0.05) / ($darker + 0.05);
    }

    private function relativeLuminance(string $hex): float
    {
        $channels = array_map(
            static function (string $channel): float {
                $value = hexdec($channel) / 255;

                return $value <= 0.04045 ? $value / 12.92 : (($value + 0.055) / 1.055) ** 2.4;
            },
            str_split(ltrim($hex, '#'), 2),
        );

        return 0.2126 * $channels[0] + 0.7152 * $channels[1] + 0.0722 * $channels[2];
    }
}
