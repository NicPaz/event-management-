<?php

namespace App\Support;

use App\EventType;
use InvalidArgumentException;

class EventThemeCatalog
{
    /** @return list<array<string, mixed>> */
    public function forType(EventType $type): array
    {
        return array_values(collect($this->themes())
            ->filter(fn (array $theme): bool => $theme['type'] === $type->value)
            ->values()
            ->all());
    }

    /** @return array<string, mixed> */
    public function preset(string $key): array
    {
        $theme = collect($this->themes())->firstWhere('key', $key);

        if (! is_array($theme)) {
            throw new InvalidArgumentException('O tema selecionado não existe.');
        }

        return $theme;
    }

    public function belongsToType(string $key, EventType $type): bool
    {
        return collect($this->forType($type))->contains(
            fn (array $theme): bool => $theme['key'] === $key,
        );
    }

    /** @return list<array<string, mixed>> */
    private function themes(): array
    {
        return [
            $this->theme('housewarming-neutral', EventType::Housewarming, 'Utensílios em tons neutros', 'Cerâmica, linho e formas orgânicas.', '#F4EFE8', '#FFFCF8', '#342F2A', '#8A6F57', '#D8C9BA', 'editorial', 'split', 'soft', 'rounded', 'utensils'),
            $this->theme('housewarming-sage', EventType::Housewarming, 'Botânico verde sálvia', 'Folhagens leves e cartões naturais.', '#EEF2EA', '#FCFFF9', '#26382D', '#6F8B72', '#C4D1C2', 'organic', 'framed', 'glass', 'pill', 'botanical'),
            $this->theme('housewarming-modern', EventType::Housewarming, 'Casa moderna minimalista', 'Linhas precisas e composição assimétrica.', '#F2F2F0', '#FFFFFF', '#181A1B', '#4D625B', '#CFD2CF', 'modern', 'split', 'outlined', 'square', 'geometric'),
            $this->theme('housewarming-rustic', EventType::Housewarming, 'Rústico acolhedor', 'Texturas quentes e molduras artesanais.', '#F3E6D5', '#FFF9F0', '#3F2D21', '#A25F3B', '#D6B99D', 'rustic', 'framed', 'layered', 'rounded', 'organic'),

            $this->theme('kitchen-vintage', EventType::KitchenTea, 'Cozinha vintage', 'Xadrez suave, rótulos e charme retrô.', '#FFF4E4', '#FFFCF4', '#46352A', '#B34E3A', '#E1BFA0', 'retro', 'framed', 'outlined', 'pill', 'checks'),
            $this->theme('kitchen-floral', EventType::KitchenTea, 'Floral delicado', 'Flores miúdas e composição romântica.', '#FFF2F3', '#FFFCFC', '#4D343A', '#B7687B', '#E6C4CC', 'romantic', 'centered', 'soft', 'rounded', 'floral'),
            $this->theme('kitchen-lemon', EventType::KitchenTea, 'Limão siciliano', 'Amarelo solar e ilustrações mediterrâneas.', '#FFF9D9', '#FFFFF7', '#2E3D2D', '#D19A16', '#DED58F', 'playful', 'split', 'layered', 'pill', 'citrus'),
            $this->theme('kitchen-terracotta', EventType::KitchenTea, 'Terracota e madeira', 'Tons terrosos e cartões robustos.', '#F3E3D7', '#FFF9F5', '#442D25', '#B45F3C', '#D7AE95', 'rustic', 'editorial', 'layered', 'square', 'organic'),

            $this->theme('wedding-classic', EventType::Wedding, 'Clássico elegante', 'Serifas formais e detalhes dourados.', '#F8F5EF', '#FFFFFF', '#27221E', '#9B7B45', '#DDD1BD', 'classic', 'centered', 'outlined', 'rounded', 'monogram'),
            $this->theme('wedding-garden', EventType::Wedding, 'Jardim romântico', 'Flores aquareladas e formas suaves.', '#F4F4EA', '#FFFDF8', '#334039', '#8C6F76', '#CED3C4', 'romantic', 'framed', 'soft', 'pill', 'floral'),
            $this->theme('wedding-modern', EventType::Wedding, 'Moderno minimalista', 'Grande tipografia e espaços generosos.', '#F5F5F3', '#FFFFFF', '#151515', '#515151', '#D1D1CE', 'modern', 'editorial', 'flat', 'square', 'lines'),
            $this->theme('wedding-boho', EventType::Wedding, 'Boho natural', 'Arcos, fibras e tons de areia.', '#F4EADF', '#FFF9F1', '#44362D', '#9A7054', '#D7BFA9', 'organic', 'split', 'layered', 'pill', 'arches'),

            $this->theme('birthday-colorful', EventType::Birthday, 'Colorido divertido', 'Confetes, formas soltas e botões vibrantes.', '#FFF2D7', '#FFFFFF', '#352A4B', '#EF5D60', '#E8B7C2', 'playful', 'split', 'layered', 'pill', 'confetti'),
            $this->theme('birthday-night', EventType::Birthday, 'Elegante noturno', 'Fundo profundo, brilho e cartões translúcidos.', '#171827', '#24263A', '#F8F3E8', '#D7AE5D', '#4B4B63', 'editorial', 'centered', 'glass', 'rounded', 'stars'),
            $this->theme('birthday-retro', EventType::Birthday, 'Retrô', 'Curvas marcantes e cores dos anos 70.', '#F5C96A', '#FFF2CF', '#392D2A', '#D64B32', '#9F6F51', 'retro', 'framed', 'outlined', 'pill', 'waves'),
            $this->theme('birthday-floral', EventType::Birthday, 'Floral', 'Buquês vivos e cartões delicados.', '#FFF0F2', '#FFFBFA', '#4A3038', '#C64F79', '#E5B7C5', 'romantic', 'centered', 'soft', 'rounded', 'floral'),

            $this->theme('other-neutral', EventType::Other, 'Neutro sofisticado', 'Equilíbrio editorial para qualquer celebração.', '#F1EEE8', '#FFFFFF', '#282725', '#6F665B', '#D2CCC3', 'editorial', 'editorial', 'outlined', 'square', 'lines'),
            $this->theme('other-botanical', EventType::Other, 'Botânico', 'Folhas estruturadas e verde profundo.', '#EDF3EB', '#FBFFF9', '#25372C', '#4E7A5A', '#BDD0BF', 'organic', 'framed', 'soft', 'pill', 'botanical'),
            $this->theme('other-geometric', EventType::Other, 'Geométrico moderno', 'Blocos, diagonais e contraste contemporâneo.', '#EEF0F5', '#FFFFFF', '#20263B', '#5D5FEF', '#C7CBE0', 'modern', 'split', 'flat', 'square', 'geometric'),
            $this->theme('other-celebration', EventType::Other, 'Celebração colorida', 'Ritmo visual, confetes e cores alegres.', '#FFF3DF', '#FFFFFF', '#33304A', '#E65F5C', '#E9B9A7', 'playful', 'centered', 'layered', 'pill', 'confetti'),
        ];
    }

    /** @return array<string, mixed> */
    private function theme(
        string $key,
        EventType $type,
        string $name,
        string $description,
        string $backgroundColor,
        string $surfaceColor,
        string $textColor,
        string $accentColor,
        string $borderColor,
        string $fontPair,
        string $coverLayout,
        string $cardStyle,
        string $buttonStyle,
        string $decorationStyle,
    ): array {
        $theme = compact(
            'key', 'name', 'description', 'backgroundColor', 'surfaceColor',
            'textColor', 'accentColor', 'borderColor', 'fontPair', 'coverLayout',
            'cardStyle', 'buttonStyle', 'decorationStyle',
        ) + ['type' => $type->value];

        $theme['titleFont'] = $fontPair;
        $theme['bodyFont'] = match ($fontPair) {
            'organic' => 'organic',
            'playful' => 'playful',
            default => 'modern',
        };

        return $theme;
    }
}
