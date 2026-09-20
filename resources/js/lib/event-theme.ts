import type { CSSProperties } from 'react';
import type { EventTheme, EventThemeOption } from '@/types';

type VisualTheme = EventTheme | EventThemeOption;

export const fontStack = (fontPair: string) => {
    const stacks: Record<string, string> = {
        classic: 'Georgia, Cambria, "Times New Roman", serif',
        editorial: 'Didot, Bodoni 72, Georgia, serif',
        organic: 'Optima, Candara, system-ui, sans-serif',
        modern: 'Inter, ui-sans-serif, system-ui, sans-serif',
        rustic: 'Rockwell, Courier New, serif',
        retro: 'Cooper Black, Rockwell, Georgia, serif',
        romantic: 'Palatino Linotype, Book Antiqua, Georgia, serif',
        playful: 'Trebuchet MS, ui-rounded, system-ui, sans-serif',
    };

    return stacks[fontPair] ?? stacks.classic;
};

export const decorationBackground = (
    theme: VisualTheme,
): CSSProperties['backgroundImage'] => {
    const accent = theme.accentColor;
    const border = theme.borderColor;

    switch (theme.decorationStyle) {
        case 'checks':
            return `linear-gradient(45deg, ${border}55 25%, transparent 25%), linear-gradient(-45deg, ${border}55 25%, transparent 25%), linear-gradient(45deg, transparent 75%, ${border}55 75%), linear-gradient(-45deg, transparent 75%, ${border}55 75%)`;
        case 'geometric':
            return `linear-gradient(135deg, transparent 65%, ${accent}22 65%), linear-gradient(35deg, ${border}44 20%, transparent 20%)`;
        case 'confetti':
            return `radial-gradient(circle at 15% 20%, ${accent}88 0 4px, transparent 5px), radial-gradient(circle at 82% 30%, ${border} 0 6px, transparent 7px), radial-gradient(circle at 65% 80%, ${accent}55 0 5px, transparent 6px)`;
        case 'botanical':
        case 'floral':
        case 'organic':
            return `radial-gradient(ellipse at 0% 0%, ${accent}2e 0 18%, transparent 19%), radial-gradient(ellipse at 100% 100%, ${border}77 0 22%, transparent 23%)`;
        case 'waves':
        case 'arches':
            return `radial-gradient(ellipse at 10% 110%, transparent 0 28%, ${accent}33 29% 32%, transparent 33%), radial-gradient(ellipse at 90% -10%, transparent 0 25%, ${border}88 26% 30%, transparent 31%)`;
        case 'stars':
            return `radial-gradient(circle at 20% 20%, ${accent} 0 1px, transparent 2px), radial-gradient(circle at 70% 35%, #fff 0 1px, transparent 2px), radial-gradient(circle at 45% 75%, ${accent} 0 2px, transparent 3px)`;
        case 'citrus':
            return `radial-gradient(circle at 8% 20%, ${accent}55 0 9%, transparent 10%), radial-gradient(circle at 92% 80%, ${accent}44 0 12%, transparent 13%)`;
        case 'lines':
            return `repeating-linear-gradient(120deg, transparent 0 42px, ${border}55 43px 44px)`;
        default:
            return `radial-gradient(circle at 0 0, ${accent}22 0 16%, transparent 17%), radial-gradient(circle at 100% 100%, ${border}66 0 18%, transparent 19%)`;
    }
};

export const cardClass = (style: string) => {
    switch (style) {
        case 'outlined':
            return 'rounded-none border-2 shadow-none';
        case 'flat':
            return 'rounded-sm border-0 shadow-none';
        case 'glass':
            return 'rounded-3xl border-white/40 bg-(--event-surface)/85 shadow-xl backdrop-blur-md';
        case 'layered':
            return 'rounded-3xl border-2 shadow-[6px_6px_0_var(--event-border)]';
        default:
            return 'rounded-2xl shadow-sm';
    }
};

export const buttonClass = (style: string) => {
    switch (style) {
        case 'pill':
            return 'rounded-full';
        case 'square':
            return 'rounded-none uppercase tracking-wider';
        default:
            return 'rounded-lg';
    }
};
