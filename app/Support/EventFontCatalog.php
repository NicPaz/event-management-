<?php

namespace App\Support;

class EventFontCatalog
{
    /** @return list<array{value: string, label: string, category: string}> */
    public function titleOptions(): array
    {
        return [
            $this->option('classic', 'Georgia clássica', 'Serifada'),
            $this->option('editorial', 'Editorial elegante', 'Serifada'),
            $this->option('romantic', 'Palatino romântica', 'Serifada'),
            $this->option('rustic', 'Rockwell rústica', 'Serifada'),
            $this->option('modern', 'Instrument Sans', 'Sem serifa'),
            $this->option('organic', 'Optima orgânica', 'Sem serifa'),
            $this->option('playful', 'Trebuchet divertida', 'Sem serifa'),
            $this->option('retro', 'Cooper retrô', 'Serifada'),
            $this->option('handwritten', 'Manuscrita delicada', 'Manuscrita'),
        ];
    }

    /** @return list<array{value: string, label: string, category: string}> */
    public function bodyOptions(): array
    {
        return [
            $this->option('modern', 'Instrument Sans', 'Sem serifa'),
            $this->option('organic', 'Optima orgânica', 'Sem serifa'),
            $this->option('playful', 'Trebuchet amigável', 'Sem serifa'),
            $this->option('classic', 'Georgia clássica', 'Serifada'),
            $this->option('editorial', 'Editorial elegante', 'Serifada'),
            $this->option('romantic', 'Palatino suave', 'Serifada'),
            $this->option('rustic', 'Rockwell rústica', 'Serifada'),
            $this->option('retro', 'Cooper retrô', 'Serifada'),
        ];
    }

    /** @return list<string> */
    public function titleKeys(): array
    {
        return array_column($this->titleOptions(), 'value');
    }

    /** @return list<string> */
    public function bodyKeys(): array
    {
        return array_column($this->bodyOptions(), 'value');
    }

    /** @return array{value: string, label: string, category: string} */
    private function option(string $value, string $label, string $category): array
    {
        return [
            'value' => $value,
            'label' => $label,
            'category' => $category,
        ];
    }
}
