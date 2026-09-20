import { useEffect, useRef, useState, type FormEvent } from 'react';
import { Head, Link, useForm } from '@inertiajs/react';
import {
    ArrowDown,
    ArrowLeft,
    ArrowUp,
    GripVertical,
    Monitor,
    Plus,
    Smartphone,
    Trash2,
} from 'lucide-react';
import EventAppearanceController from '@/actions/App/Http/Controllers/EventAppearanceController';
import EventThemeController from '@/actions/App/Http/Controllers/EventThemeController';
import EventInvitation from '@/components/event-invitation';
import InputError from '@/components/input-error';
import ThemePreview from '@/components/theme-preview';
import { Button } from '@/components/ui/button';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { index, show } from '@/routes/events';
import type {
    EventInvitation as EventInvitationData,
    EventSection,
    EventThemeOption,
} from '@/types';

type EditableSection = Pick<
    EventSection,
    'type' | 'label' | 'enabled' | 'position'
>;

type EditablePaletteItem = {
    label: string;
    color_hex: string;
    material: string;
    position: number;
};

type AppearanceFormData = {
    background_color: string;
    surface_color: string;
    text_color: string;
    accent_color: string;
    border_color: string;
    banner: File | null;
    banner_position: 'top' | 'center' | 'bottom';
    remove_banner: boolean;
    background: File | null;
    background_fill: 'cover' | 'repeat';
    background_position: 'top' | 'center' | 'bottom' | 'left' | 'right';
    background_overlay: 'light' | 'dark';
    background_overlay_opacity: number;
    remove_background: boolean;
    sections: EditableSection[];
    palette_items: EditablePaletteItem[];
};

const colorFields: Array<{
    key:
        | 'background_color'
        | 'surface_color'
        | 'text_color'
        | 'accent_color'
        | 'border_color';
    label: string;
}> = [
    { key: 'background_color', label: 'Fundo' },
    { key: 'surface_color', label: 'Superfície' },
    { key: 'text_color', label: 'Texto' },
    { key: 'accent_color', label: 'Destaque' },
    { key: 'border_color', label: 'Bordas' },
];

function moveItem<T>(items: T[], from: number, to: number): T[] {
    if (to < 0 || to >= items.length || from === to) {
        return items;
    }

    const reordered = [...items];
    const [item] = reordered.splice(from, 1);
    reordered.splice(to, 0, item);

    return reordered;
}

export default function EventAppearance({
    event,
    themeOptions,
}: {
    event: EventInvitationData;
    themeOptions: EventThemeOption[];
}) {
    const form = useForm<AppearanceFormData>({
        background_color: event.theme.backgroundColor,
        surface_color: event.theme.surfaceColor,
        text_color: event.theme.textColor,
        accent_color: event.theme.accentColor,
        border_color: event.theme.borderColor,
        banner: null,
        banner_position: event.theme.bannerPosition,
        remove_banner: false,
        background: null,
        background_fill: event.theme.backgroundFill,
        background_position: event.theme.backgroundPosition,
        background_overlay: event.theme.backgroundOverlay,
        background_overlay_opacity: event.theme.backgroundOverlayOpacity,
        remove_background: false,
        sections: event.sections,
        palette_items: event.paletteItems.map((item) => ({
            label: item.label,
            color_hex: item.colorHex ?? '',
            material: item.material ?? '',
            position: item.position,
        })),
    });
    const [viewport, setViewport] = useState<'mobile' | 'desktop'>('desktop');
    const [bannerPreview, setBannerPreview] = useState<string | null>(null);
    const [backgroundPreview, setBackgroundPreview] = useState<string | null>(
        null,
    );
    const [pendingTheme, setPendingTheme] = useState<EventThemeOption | null>(
        null,
    );
    const themeForm = useForm({ theme_key: event.theme.templateKey });
    const activeThemeKey = themeOptions.some(
        (theme) => theme.key === event.theme.templateKey,
    )
        ? event.theme.templateKey
        : themeOptions[0]?.key;
    const draggedSection = useRef<number | null>(null);

    useEffect(() => {
        if (!form.data.banner) {
            setBannerPreview(null);

            return;
        }

        const objectUrl = URL.createObjectURL(form.data.banner);
        setBannerPreview(objectUrl);

        return () => URL.revokeObjectURL(objectUrl);
    }, [form.data.banner]);

    useEffect(() => {
        if (!form.data.background) {
            setBackgroundPreview(null);

            return;
        }

        const objectUrl = URL.createObjectURL(form.data.background);
        setBackgroundPreview(objectUrl);

        return () => URL.revokeObjectURL(objectUrl);
    }, [form.data.background]);

    const normalizeSections = (sections: EditableSection[]) =>
        sections.map((section, position) => ({ ...section, position }));

    const normalizePalette = (items: EditablePaletteItem[]) =>
        items.map((item, position) => ({ ...item, position }));

    const moveSection = (from: number, to: number) => {
        form.setData(
            'sections',
            normalizeSections(moveItem(form.data.sections, from, to)),
        );
    };

    const previewEvent: EventInvitationData = {
        ...event,
        theme: {
            ...event.theme,
            backgroundColor: form.data.background_color,
            surfaceColor: form.data.surface_color,
            textColor: form.data.text_color,
            accentColor: form.data.accent_color,
            borderColor: form.data.border_color,
            bannerUrl: form.data.remove_banner
                ? bannerPreview
                : (bannerPreview ?? event.theme.bannerUrl),
            bannerPosition: form.data.banner_position,
            backgroundUrl: form.data.remove_background
                ? backgroundPreview
                : (backgroundPreview ?? event.theme.backgroundUrl),
            backgroundFill: form.data.background_fill,
            backgroundPosition: form.data.background_position,
            backgroundOverlay: form.data.background_overlay,
            backgroundOverlayOpacity: form.data.background_overlay_opacity,
        },
        sections: form.data.sections,
        paletteItems: form.data.palette_items.map((item) => ({
            label: item.label || 'Sem nome',
            colorHex: item.color_hex || null,
            material: item.material || null,
            position: item.position,
        })),
    };

    const submit = (submitEvent: FormEvent<HTMLFormElement>) => {
        submitEvent.preventDefault();
        form.post(EventAppearanceController.update(event.id).url, {
            forceFormData: true,
            preserveScroll: true,
        });
    };

    return (
        <>
            <Head title={`Aparência de ${event.title}`} />
            <div className="bg-muted fixed inset-0 z-50 flex min-h-0 flex-col">
                <div className="bg-background flex shrink-0 flex-wrap items-center justify-between gap-3 border-b px-3 py-2 sm:px-5">
                    <div className="flex min-w-0 items-center gap-3">
                        <Button asChild variant="ghost" size="icon">
                            <Link
                                href={show(event.id)}
                                aria-label="Voltar ao painel do evento"
                            >
                                <ArrowLeft />
                            </Link>
                        </Button>
                        <div className="min-w-0">
                            <h1 className="truncate font-semibold">
                                Personalizar {event.title}
                            </h1>
                            <p className="text-muted-foreground hidden text-xs sm:block">
                                As alterações aparecem na prévia em tempo real.
                            </p>
                        </div>
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="flex rounded-lg border p-1">
                            <Button
                                type="button"
                                size="icon"
                                variant={
                                    viewport === 'mobile'
                                        ? 'secondary'
                                        : 'ghost'
                                }
                                aria-label="Prévia para celular"
                                onClick={() => setViewport('mobile')}
                            >
                                <Smartphone />
                            </Button>
                            <Button
                                type="button"
                                size="icon"
                                variant={
                                    viewport === 'desktop'
                                        ? 'secondary'
                                        : 'ghost'
                                }
                                aria-label="Prévia para desktop"
                                onClick={() => setViewport('desktop')}
                            >
                                <Monitor />
                            </Button>
                        </div>
                        <Button
                            type="submit"
                            form="appearance-form"
                            disabled={form.processing}
                        >
                            {form.processing ? 'Salvando...' : 'Salvar'}
                        </Button>
                    </div>
                </div>

                <form
                    id="appearance-form"
                    onSubmit={submit}
                    className="grid min-h-0 flex-1 grid-rows-[minmax(16rem,42vh)_minmax(0,1fr)] overflow-hidden md:grid-cols-[24rem_minmax(0,1fr)] md:grid-rows-1"
                >
                    <div className="bg-background flex min-h-0 min-w-0 flex-col gap-5 overflow-y-auto border-b p-4 md:border-r md:border-b-0">
                        <Card>
                            <CardHeader>
                                <CardTitle>Tema visual</CardTitle>
                                <CardDescription>
                                    Trocar ou restaurar um tema redefine cores,
                                    composição e imagens. Dados, presentes,
                                    convidados, reservas e seções são
                                    preservados.
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="grid gap-4">
                                {themeOptions.map((theme) => (
                                    <ThemePreview
                                        key={theme.key}
                                        theme={theme}
                                        selected={theme.key === activeThemeKey}
                                        onSelect={() => setPendingTheme(theme)}
                                    />
                                ))}
                                {activeThemeKey && (
                                    <Button
                                        type="button"
                                        variant="outline"
                                        onClick={() =>
                                            setPendingTheme(
                                                themeOptions.find(
                                                    (theme) =>
                                                        theme.key ===
                                                        activeThemeKey,
                                                ) ?? null,
                                            )
                                        }
                                    >
                                        Restaurar aparência original do tema
                                    </Button>
                                )}
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader>
                                <CardTitle>Cores do convite</CardTitle>
                                <CardDescription>
                                    O texto precisa manter contraste mínimo com
                                    o fundo e os cartões.
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="grid gap-5 sm:grid-cols-2">
                                {colorFields.map((field) => (
                                    <div key={field.key} className="grid gap-2">
                                        <Label htmlFor={field.key}>
                                            {field.label}
                                        </Label>
                                        <div className="flex min-w-0 gap-2">
                                            <Input
                                                aria-label={`${field.label}: seletor de cor`}
                                                type="color"
                                                value={form.data[field.key]}
                                                onChange={(inputEvent) =>
                                                    form.setData(
                                                        field.key,
                                                        inputEvent.target.value.toUpperCase(),
                                                    )
                                                }
                                                className="w-12 shrink-0 p-1"
                                            />
                                            <Input
                                                id={field.key}
                                                value={form.data[field.key]}
                                                onChange={(inputEvent) =>
                                                    form.setData(
                                                        field.key,
                                                        inputEvent.target.value.toUpperCase(),
                                                    )
                                                }
                                                maxLength={7}
                                                pattern="#[0-9A-Fa-f]{6}"
                                                className="min-w-0 font-mono"
                                                required
                                            />
                                        </div>
                                        <InputError
                                            message={form.errors[field.key]}
                                        />
                                    </div>
                                ))}
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader>
                                <CardTitle>Imagem de fundo</CardTitle>
                                <CardDescription>
                                    Independente do banner. A sobreposição
                                    mantém textos e botões legíveis no celular e
                                    no desktop.
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="grid gap-5">
                                <div className="grid gap-2">
                                    <Label htmlFor="background">Imagem</Label>
                                    <Input
                                        id="background"
                                        type="file"
                                        accept="image/jpeg,image/png,image/webp"
                                        onChange={(inputEvent) =>
                                            form.setData(
                                                'background',
                                                inputEvent.target.files?.[0] ??
                                                    null,
                                            )
                                        }
                                    />
                                    <InputError
                                        message={form.errors.background}
                                    />
                                </div>
                                {(backgroundPreview ||
                                    (!form.data.remove_background &&
                                        event.theme.backgroundUrl)) && (
                                    <img
                                        src={
                                            backgroundPreview ??
                                            event.theme.backgroundUrl ??
                                            ''
                                        }
                                        alt="Prévia do fundo"
                                        className="h-28 w-full rounded-lg border object-cover"
                                    />
                                )}
                                <div className="grid grid-cols-2 gap-3">
                                    <div className="grid gap-2">
                                        <Label htmlFor="background_fill">
                                            Preenchimento
                                        </Label>
                                        <select
                                            id="background_fill"
                                            value={form.data.background_fill}
                                            onChange={(inputEvent) =>
                                                form.setData(
                                                    'background_fill',
                                                    inputEvent.target
                                                        .value as AppearanceFormData['background_fill'],
                                                )
                                            }
                                            className="border-input h-9 rounded-md border bg-transparent px-3 text-sm"
                                        >
                                            <option value="cover">
                                                Cobrir a área
                                            </option>
                                            <option value="repeat">
                                                Repetir como textura
                                            </option>
                                        </select>
                                    </div>
                                    <div className="grid gap-2">
                                        <Label htmlFor="background_position">
                                            Posição
                                        </Label>
                                        <select
                                            id="background_position"
                                            value={
                                                form.data.background_position
                                            }
                                            onChange={(inputEvent) =>
                                                form.setData(
                                                    'background_position',
                                                    inputEvent.target
                                                        .value as AppearanceFormData['background_position'],
                                                )
                                            }
                                            className="border-input h-9 rounded-md border bg-transparent px-3 text-sm"
                                        >
                                            <option value="top">Topo</option>
                                            <option value="center">
                                                Centro
                                            </option>
                                            <option value="bottom">Base</option>
                                            <option value="left">
                                                Esquerda
                                            </option>
                                            <option value="right">
                                                Direita
                                            </option>
                                        </select>
                                    </div>
                                    <div className="grid gap-2">
                                        <Label htmlFor="background_overlay">
                                            Sobreposição
                                        </Label>
                                        <select
                                            id="background_overlay"
                                            value={form.data.background_overlay}
                                            onChange={(inputEvent) =>
                                                form.setData(
                                                    'background_overlay',
                                                    inputEvent.target
                                                        .value as AppearanceFormData['background_overlay'],
                                                )
                                            }
                                            className="border-input h-9 rounded-md border bg-transparent px-3 text-sm"
                                        >
                                            <option value="light">Clara</option>
                                            <option value="dark">Escura</option>
                                        </select>
                                    </div>
                                    <div className="grid gap-2">
                                        <Label htmlFor="background_overlay_opacity">
                                            Intensidade:{' '}
                                            {
                                                form.data
                                                    .background_overlay_opacity
                                            }
                                            %
                                        </Label>
                                        <Input
                                            id="background_overlay_opacity"
                                            type="range"
                                            min={0}
                                            max={80}
                                            value={
                                                form.data
                                                    .background_overlay_opacity
                                            }
                                            onChange={(inputEvent) =>
                                                form.setData(
                                                    'background_overlay_opacity',
                                                    Number(
                                                        inputEvent.target.value,
                                                    ),
                                                )
                                            }
                                        />
                                    </div>
                                </div>
                                {event.theme.backgroundUrl && (
                                    <label className="flex items-center gap-3 text-sm">
                                        <input
                                            type="checkbox"
                                            checked={
                                                form.data.remove_background
                                            }
                                            onChange={(inputEvent) =>
                                                form.setData(
                                                    'remove_background',
                                                    inputEvent.target.checked,
                                                )
                                            }
                                            className="accent-primary size-4"
                                        />
                                        Remover imagem de fundo atual
                                    </label>
                                )}
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader>
                                <CardTitle>Banner</CardTitle>
                                <CardDescription>
                                    JPEG, PNG ou WebP de até 5 MB. Imagens
                                    horizontais funcionam melhor.
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="grid gap-5">
                                <div className="grid gap-2">
                                    <Label htmlFor="banner">Imagem</Label>
                                    <Input
                                        id="banner"
                                        type="file"
                                        accept="image/jpeg,image/png,image/webp"
                                        onChange={(inputEvent) =>
                                            form.setData(
                                                'banner',
                                                inputEvent.target.files?.[0] ??
                                                    null,
                                            )
                                        }
                                    />
                                    <InputError message={form.errors.banner} />
                                </div>
                                <div className="grid gap-2">
                                    <Label htmlFor="banner_position">
                                        Posição da imagem
                                    </Label>
                                    <select
                                        id="banner_position"
                                        value={form.data.banner_position}
                                        onChange={(inputEvent) =>
                                            form.setData(
                                                'banner_position',
                                                inputEvent.target
                                                    .value as AppearanceFormData['banner_position'],
                                            )
                                        }
                                        className="border-input focus-visible:border-ring focus-visible:ring-ring/50 h-9 rounded-md border bg-transparent px-3 text-sm shadow-xs outline-none focus-visible:ring-3"
                                    >
                                        <option value="top">Topo</option>
                                        <option value="center">Centro</option>
                                        <option value="bottom">Base</option>
                                    </select>
                                </div>
                                {event.theme.bannerUrl && (
                                    <label className="flex items-center gap-3 text-sm">
                                        <input
                                            type="checkbox"
                                            checked={form.data.remove_banner}
                                            onChange={(inputEvent) =>
                                                form.setData(
                                                    'remove_banner',
                                                    inputEvent.target.checked,
                                                )
                                            }
                                            className="accent-primary size-4"
                                        />
                                        Remover banner atual
                                    </label>
                                )}
                                {form.progress && (
                                    <progress
                                        value={form.progress.percentage}
                                        max="100"
                                        className="h-2 w-full"
                                    >
                                        {form.progress.percentage}%
                                    </progress>
                                )}
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader>
                                <CardTitle>Seções</CardTitle>
                                <CardDescription>
                                    Arraste ou use os botões para ordenar. A
                                    visibilidade não altera permissões futuras.
                                    Ao ativar “Quem já confirmou”, os nomes dos
                                    titulares confirmados ficarão públicos no
                                    convite.
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="grid gap-2">
                                {form.data.sections.map(
                                    (section, sectionIndex) => (
                                        <div
                                            key={section.type}
                                            draggable
                                            onDragStart={() => {
                                                draggedSection.current =
                                                    sectionIndex;
                                            }}
                                            onDragOver={(dragEvent) =>
                                                dragEvent.preventDefault()
                                            }
                                            onDrop={() => {
                                                if (
                                                    draggedSection.current !==
                                                    null
                                                ) {
                                                    moveSection(
                                                        draggedSection.current,
                                                        sectionIndex,
                                                    );
                                                }
                                                draggedSection.current = null;
                                            }}
                                            className="flex items-center gap-2 rounded-lg border p-3"
                                        >
                                            <GripVertical
                                                className="text-muted-foreground size-4 shrink-0 cursor-grab"
                                                aria-hidden="true"
                                            />
                                            <input
                                                id={`section-${section.type}`}
                                                type="checkbox"
                                                checked={section.enabled}
                                                onChange={(inputEvent) => {
                                                    const sections = [
                                                        ...form.data.sections,
                                                    ];
                                                    sections[sectionIndex] = {
                                                        ...section,
                                                        enabled:
                                                            inputEvent.target
                                                                .checked,
                                                    };
                                                    form.setData(
                                                        'sections',
                                                        sections,
                                                    );
                                                }}
                                                className="accent-primary size-4"
                                            />
                                            <Label
                                                htmlFor={`section-${section.type}`}
                                                className="min-w-0 flex-1"
                                            >
                                                {section.label}
                                            </Label>
                                            {section.type ===
                                                'confirmed_guests' &&
                                                section.enabled && (
                                                    <span className="text-[11px] leading-tight text-amber-700">
                                                        nomes públicos
                                                    </span>
                                                )}
                                            <Button
                                                type="button"
                                                size="icon"
                                                variant="ghost"
                                                disabled={sectionIndex === 0}
                                                aria-label={`Subir ${section.label}`}
                                                onClick={() =>
                                                    moveSection(
                                                        sectionIndex,
                                                        sectionIndex - 1,
                                                    )
                                                }
                                            >
                                                <ArrowUp />
                                            </Button>
                                            <Button
                                                type="button"
                                                size="icon"
                                                variant="ghost"
                                                disabled={
                                                    sectionIndex ===
                                                    form.data.sections.length -
                                                        1
                                                }
                                                aria-label={`Descer ${section.label}`}
                                                onClick={() =>
                                                    moveSection(
                                                        sectionIndex,
                                                        sectionIndex + 1,
                                                    )
                                                }
                                            >
                                                <ArrowDown />
                                            </Button>
                                        </div>
                                    ),
                                )}
                                <InputError message={form.errors.sections} />
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader>
                                <CardTitle>Paleta da casa</CardTitle>
                                <CardDescription>
                                    Cadastre cores ou materiais reais da casa,
                                    sem relação com as cores do convite.
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="grid gap-4">
                                {form.data.palette_items.map(
                                    (item, itemIndex) => (
                                        <div
                                            key={item.position}
                                            className="grid gap-3 rounded-lg border p-4 sm:grid-cols-[1fr_9rem_1fr_auto]"
                                        >
                                            <div className="grid gap-2">
                                                <Label
                                                    htmlFor={`palette-label-${itemIndex}`}
                                                >
                                                    Nome
                                                </Label>
                                                <Input
                                                    id={`palette-label-${itemIndex}`}
                                                    value={item.label}
                                                    maxLength={80}
                                                    onChange={(inputEvent) => {
                                                        const items = [
                                                            ...form.data
                                                                .palette_items,
                                                        ];
                                                        items[itemIndex] = {
                                                            ...item,
                                                            label: inputEvent
                                                                .target.value,
                                                        };
                                                        form.setData(
                                                            'palette_items',
                                                            items,
                                                        );
                                                    }}
                                                    required
                                                />
                                            </div>
                                            <div className="grid gap-2">
                                                <Label
                                                    htmlFor={`palette-color-${itemIndex}`}
                                                >
                                                    Cor
                                                </Label>
                                                <Input
                                                    id={`palette-color-${itemIndex}`}
                                                    type="color"
                                                    value={
                                                        item.color_hex ||
                                                        '#FFFFFF'
                                                    }
                                                    onChange={(inputEvent) => {
                                                        const items = [
                                                            ...form.data
                                                                .palette_items,
                                                        ];
                                                        items[itemIndex] = {
                                                            ...item,
                                                            color_hex:
                                                                inputEvent.target.value.toUpperCase(),
                                                        };
                                                        form.setData(
                                                            'palette_items',
                                                            items,
                                                        );
                                                    }}
                                                    className="w-full p-1"
                                                />
                                            </div>
                                            <div className="grid gap-2">
                                                <Label
                                                    htmlFor={`palette-material-${itemIndex}`}
                                                >
                                                    Material
                                                </Label>
                                                <Input
                                                    id={`palette-material-${itemIndex}`}
                                                    value={item.material}
                                                    maxLength={80}
                                                    placeholder="Ex.: inox"
                                                    onChange={(inputEvent) => {
                                                        const items = [
                                                            ...form.data
                                                                .palette_items,
                                                        ];
                                                        items[itemIndex] = {
                                                            ...item,
                                                            material:
                                                                inputEvent
                                                                    .target
                                                                    .value,
                                                        };
                                                        form.setData(
                                                            'palette_items',
                                                            items,
                                                        );
                                                    }}
                                                />
                                            </div>
                                            <Button
                                                type="button"
                                                size="icon"
                                                variant="ghost"
                                                aria-label={`Remover ${item.label || 'item'}`}
                                                className="self-end"
                                                onClick={() =>
                                                    form.setData(
                                                        'palette_items',
                                                        normalizePalette(
                                                            form.data.palette_items.filter(
                                                                (
                                                                    _,
                                                                    indexToKeep,
                                                                ) =>
                                                                    indexToKeep !==
                                                                    itemIndex,
                                                            ),
                                                        ),
                                                    )
                                                }
                                            >
                                                <Trash2 />
                                            </Button>
                                        </div>
                                    ),
                                )}
                                {form.data.palette_items.length === 0 && (
                                    <p className="text-muted-foreground rounded-lg border border-dashed p-5 text-center text-sm">
                                        Nenhuma cor ou material cadastrado.
                                    </p>
                                )}
                                <Button
                                    type="button"
                                    variant="outline"
                                    className="justify-self-start"
                                    disabled={
                                        form.data.palette_items.length >= 20
                                    }
                                    onClick={() =>
                                        form.setData('palette_items', [
                                            ...form.data.palette_items,
                                            {
                                                label: '',
                                                color_hex: '#FFFFFF',
                                                material: '',
                                                position:
                                                    form.data.palette_items
                                                        .length,
                                            },
                                        ])
                                    }
                                >
                                    <Plus /> Adicionar item
                                </Button>
                                <InputError
                                    message={form.errors.palette_items}
                                />
                            </CardContent>
                        </Card>
                    </div>

                    <aside className="bg-muted/40 min-h-0 min-w-0 overflow-auto p-3 sm:p-5">
                        <Card className="mx-auto min-h-full max-w-[90rem] overflow-hidden shadow-sm">
                            <CardHeader>
                                <div>
                                    <CardTitle>Prévia ao vivo</CardTitle>
                                    <CardDescription>
                                        Esta é a mesma página que seus
                                        convidados verão.
                                    </CardDescription>
                                </div>
                            </CardHeader>
                            <CardContent className="bg-muted/40 overflow-auto p-3 sm:p-5">
                                <div
                                    className={`mx-auto overflow-hidden rounded-xl border bg-white shadow-sm transition-[width] ${viewport === 'mobile' ? 'w-[min(100%,360px)]' : 'w-full'}`}
                                >
                                    <EventInvitation
                                        event={previewEvent}
                                        showGuestActions={false}
                                    />
                                </div>
                            </CardContent>
                        </Card>
                    </aside>
                </form>
            </div>
            <Dialog
                open={pendingTheme !== null}
                onOpenChange={(open) => !open && setPendingTheme(null)}
            >
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>
                            {pendingTheme?.key === event.theme.templateKey
                                ? 'Restaurar aparência original?'
                                : `Aplicar ${pendingTheme?.name}?`}
                        </DialogTitle>
                        <DialogDescription>
                            Cores, tipografia, composição, cartões, botões,
                            banner e imagem de fundo serão substituídos pelos
                            padrões do tema. Informações do evento, presentes,
                            convidados, reservas e a visibilidade/ordem das
                            seções não serão alterados.
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter>
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => setPendingTheme(null)}
                        >
                            Manter personalizações
                        </Button>
                        <Button
                            type="button"
                            disabled={
                                themeForm.processing || pendingTheme === null
                            }
                            onClick={() => {
                                if (pendingTheme === null) return;
                                themeForm.transform(() => ({
                                    theme_key: pendingTheme.key,
                                }));
                                themeForm.post(
                                    EventThemeController.update(event.id).url,
                                    {
                                        preserveScroll: true,
                                        onSuccess: () => setPendingTheme(null),
                                    },
                                );
                            }}
                        >
                            {themeForm.processing
                                ? 'Aplicando...'
                                : 'Confirmar substituição'}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </>
    );
}

EventAppearance.layout = {
    breadcrumbs: [{ title: 'Meus eventos', href: index() }],
};
