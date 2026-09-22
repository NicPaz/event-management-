import { Eye } from 'lucide-react';
import {
    buttonClass,
    cardClass,
    decorationBackground,
    fontStack,
    themeAssets,
} from '@/lib/event-theme';
import type { EventThemeOption } from '@/types';

export default function ThemePreview({
    theme,
    selected,
    onSelect,
    onPreview,
}: {
    theme: EventThemeOption;
    selected?: boolean;
    onSelect?: () => void;
    onPreview?: () => void;
}) {
    const assets = themeAssets(theme.key);

    return (
        <article
            className={`overflow-hidden border-2 bg-white transition ${selected ? 'border-primary ring-primary/20 ring-4' : 'border-border'}`}
        >
            <div
                className="relative aspect-[4/3] overflow-hidden p-4"
                style={{
                    backgroundColor: theme.backgroundColor,
                    backgroundImage: assets.backgroundUrl
                        ? `${assets.backgroundOverlay === 'light' ? `linear-gradient(rgba(255,255,255,${(assets.backgroundOverlayOpacity ?? 0) / 100}), rgba(255,255,255,${(assets.backgroundOverlayOpacity ?? 0) / 100}))` : assets.backgroundOverlay === 'dark' ? `linear-gradient(rgba(0,0,0,${(assets.backgroundOverlayOpacity ?? 0) / 100}), rgba(0,0,0,${(assets.backgroundOverlayOpacity ?? 0) / 100}))` : 'none'}, url(${assets.backgroundUrl})`
                        : decorationBackground(theme),
                    backgroundPosition: assets.backgroundPosition ?? 'center',
                    backgroundRepeat:
                        assets.backgroundFill === 'repeat'
                            ? 'repeat'
                            : 'no-repeat',
                    backgroundSize:
                        assets.backgroundFill === 'repeat' ? 'auto' : 'cover',
                    color: theme.textColor,
                    fontFamily: fontStack(theme.bodyFont),
                }}
            >
                <div
                    className={`flex h-2/3 flex-col justify-center ${theme.coverLayout === 'split' ? 'items-start pr-12 text-left' : theme.coverLayout === 'editorial' ? 'items-start justify-end text-left' : 'items-center text-center'} ${theme.coverLayout === 'framed' ? (assets.coverFrameUrl ? 'border-[10px] border-transparent bg-clip-padding bg-origin-border p-3' : 'border-2 p-3') : ''}`}
                    style={
                        assets.coverFrameUrl
                            ? {
                                  borderColor: theme.borderColor,
                                  backgroundImage: `linear-gradient(${theme.surfaceColor}, ${theme.surfaceColor}), url(${assets.coverFrameUrl})`,
                                  backgroundOrigin: 'border-box',
                                  backgroundClip: 'padding-box, border-box',
                                  backgroundSize: 'auto, 72px 72px',
                              }
                            : { borderColor: theme.borderColor }
                    }
                >
                    <span className="text-[7px] font-semibold tracking-[.22em] uppercase">
                        Você está convidado
                    </span>
                    <strong
                        className="mt-1 text-xl leading-none"
                        style={{
                            color: assets.titleColor ?? theme.textColor,
                            fontFamily: fontStack(theme.titleFont),
                        }}
                    >
                        Celebração
                    </strong>
                    {assets.coverIllustrationUrl && (
                        <img
                            src={assets.coverIllustrationUrl}
                            alt=""
                            aria-hidden="true"
                            className="mt-2 h-12 w-14 object-contain"
                        />
                    )}
                </div>
                <div className="mt-3 grid grid-cols-2 gap-2">
                    <div
                        className={`h-10 border ${cardClass(theme.cardStyle)}`}
                        style={{
                            backgroundColor: theme.surfaceColor,
                            borderColor: theme.borderColor,
                        }}
                    />
                    <div
                        className={`flex h-10 items-center justify-center text-[7px] font-bold text-white ${buttonClass(theme.buttonStyle)}`}
                        style={{ backgroundColor: theme.accentColor }}
                    >
                        CONFIRMAR
                    </div>
                </div>
            </div>
            <div className="grid gap-3 p-4">
                <div>
                    <h3 className="font-semibold">{theme.name}</h3>
                    <p className="text-muted-foreground mt-1 text-xs">
                        {theme.description}
                    </p>
                </div>
                <div className="grid grid-cols-2 gap-2">
                    {onPreview && (
                        <button
                            type="button"
                            onClick={onPreview}
                            className="inline-flex min-h-9 items-center justify-center gap-1 border px-2 text-xs font-medium"
                        >
                            <Eye className="size-3.5" /> Visualizar
                        </button>
                    )}
                    {onSelect && (
                        <button
                            type="button"
                            onClick={onSelect}
                            className="bg-primary text-primary-foreground min-h-9 px-2 text-xs font-semibold"
                        >
                            {selected ? 'Selecionado' : 'Aplicar tema'}
                        </button>
                    )}
                </div>
            </div>
        </article>
    );
}
