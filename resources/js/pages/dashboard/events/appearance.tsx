import { useEffect, useRef, useState, type FormEvent } from 'react';
import { Head, Link, router, useForm } from '@inertiajs/react';
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
import EventCreationController from '@/actions/App/Http/Controllers/EventCreationController';
import EventThemeController from '@/actions/App/Http/Controllers/EventThemeController';
import GiftController from '@/actions/App/Http/Controllers/GiftController';
import { EventCreationProgress } from '@/components/event-creation-progress';
import EventInvitation from '@/components/event-invitation';
import { CelebreLogo } from '@/components/celebre-logo';
import InputError from '@/components/input-error';
import ThemePreview from '@/components/theme-preview';
import { UnsavedChangesGuard } from '@/components/unsaved-changes-guard';
import { fontStack } from '@/lib/event-theme';
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
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
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
    EventFontOption,
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
    title_font: string;
    body_font: string;
    show_confirmed_guests: boolean;
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
    fontOptions,
    creationFlow = false,
}: {
    event: EventInvitationData;
    themeOptions: EventThemeOption[];
    fontOptions: {
        titles: EventFontOption[];
        body: EventFontOption[];
    };
    creationFlow?: boolean;
}) {
    const form = useForm<AppearanceFormData>({
        background_color: event.theme.backgroundColor,
        surface_color: event.theme.surfaceColor,
        text_color: event.theme.textColor,
        accent_color: event.theme.accentColor,
        border_color: event.theme.borderColor,
        title_font: event.theme.titleFont,
        body_font: event.theme.bodyFont,
        show_confirmed_guests: event.showConfirmedGuests,
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
    const bannerInput = useRef<HTMLInputElement | null>(null);
    const backgroundInput = useRef<HTMLInputElement | null>(null);
    const continueAfterSave = useRef(false);
    const navigationBypass = useRef(false);

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
        showConfirmedGuests: form.data.show_confirmed_guests,
        theme: {
            ...event.theme,
            backgroundColor: form.data.background_color,
            surfaceColor: form.data.surface_color,
            textColor: form.data.text_color,
            accentColor: form.data.accent_color,
            borderColor: form.data.border_color,
            titleFont: form.data.title_font,
            bodyFont: form.data.body_font,
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
        navigationBypass.current = true;
        form.post(EventAppearanceController.update(event.id).url, {
            forceFormData: true,
            preserveScroll: true,
            onSuccess: () => {
                form.setDefaults();

                if (continueAfterSave.current) {
                    router.visit(EventCreationController.show(event.id).url);
                }
            },
            onError: () => {
                navigationBypass.current = false;
            },
            onFinish: () => {
                if (!continueAfterSave.current) {
                    navigationBypass.current = false;
                }
            },
        });
    };

    return (
        <>
            <Head title={`Aparência de ${event.title}`} />
            <UnsavedChangesGuard
                when={form.isDirty && !form.processing}
                bypassRef={navigationBypass}
            />
            <div className="bg-background fixed inset-0 z-50 flex min-h-0 flex-col">
                <div className="bg-card border-primary/10 flex shrink-0 flex-wrap items-center justify-between gap-3 border-b px-3 py-2 shadow-sm sm:px-5">
                    <div className="flex min-w-0 items-center gap-3">
                        <Button asChild variant="ghost" size="icon">
                            <Link
                                href={
                                    creationFlow
                                        ? GiftController.index(event.id, {
                                              query: { creation: 1 },
                                          })
                                        : show(event.id)
                                }
                                aria-label="Voltar ao painel do evento"
                            >
                                <ArrowLeft />
                            </Link>
                        </Button>
                        <CelebreLogo
                            variant="symbol"
                            decorative
                            className="hidden size-9 sm:block"
                        />
                        <div className="min-w-0">
                            <h1 className="truncate font-serif text-lg">
                                {creationFlow
                                    ? 'Personalização'
                                    : 'Personalizar'}{' '}
                                {event.title}
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
                            variant={creationFlow ? 'outline' : 'default'}
                            onClick={() => {
                                continueAfterSave.current = false;
                            }}
                        >
                            {form.processing ? 'Salvando...' : 'Salvar'}
                        </Button>
                        {creationFlow && (
                            <Button
                                type="submit"
                                form="appearance-form"
                                disabled={form.processing}
                                onClick={() => {
                                    continueAfterSave.current = true;
                                }}
                            >
                                {form.processing ? 'Salvando...' : 'Continuar'}
                            </Button>
                        )}
                    </div>
                </div>

                {creationFlow && (
                    <div className="bg-card shrink-0 border-b px-3 py-3 sm:px-5">
                        <EventCreationProgress currentStep={3} />
                    </div>
                )}

                <form
                    id="appearance-form"
                    onSubmit={submit}
                    className="grid min-h-0 flex-1 grid-rows-[minmax(16rem,42vh)_minmax(0,1fr)] md:grid-cols-[24rem_minmax(0,1fr)] md:grid-rows-1"
                >
                    <div className="bg-background flex min-h-0 min-w-0 flex-col gap-5 overflow-y-auto border-b p-4 md:border-r md:border-b-0">
                        <Card className="box-border w-full max-w-full min-w-0">
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
                                        className="h-auto min-h-11 w-full max-w-full whitespace-normal"
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

                        <Card className="box-border w-full max-w-full min-w-0">
                            <CardHeader>
                                <CardTitle>Cores do convite</CardTitle>
                                <CardDescription>
                                    O texto precisa manter contraste mínimo com
                                    o fundo e os cartões.
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="grid min-w-0 gap-5">
                                {colorFields.map((field) => (
                                    <div
                                        key={field.key}
                                        className="grid min-w-0 gap-2"
                                    >
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

                        <Card className="box-border w-full max-w-full min-w-0">
                            <CardHeader>
                                <CardTitle>Tipografia</CardTitle>
                                <CardDescription>
                                    Escolha fontes separadas para títulos e
                                    textos. As manuscritas são indicadas para
                                    destaques curtos; os textos longos usam
                                    opções de leitura confortável.
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="grid min-w-0 gap-4">
                                <FontSelect
                                    label="Títulos e destaques"
                                    name="title-font"
                                    options={fontOptions.titles}
                                    value={form.data.title_font}
                                    onChange={(value) =>
                                        form.setData('title_font', value)
                                    }
                                    error={form.errors.title_font}
                                />
                                <FontSelect
                                    label="Textos e botões"
                                    name="body-font"
                                    options={fontOptions.body}
                                    value={form.data.body_font}
                                    onChange={(value) =>
                                        form.setData('body_font', value)
                                    }
                                    error={form.errors.body_font}
                                />
                            </CardContent>
                        </Card>

                        <Card className="box-border w-full max-w-full min-w-0">
                            <CardHeader>
                                <CardTitle>Imagem de fundo</CardTitle>
                                <CardDescription>
                                    Independente do banner. A sobreposição
                                    mantém textos e botões legíveis no celular e
                                    no desktop.
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="grid min-w-0 gap-5">
                                <div className="grid gap-2">
                                    <Label htmlFor="background">Imagem</Label>
                                    <Input
                                        id="background"
                                        ref={backgroundInput}
                                        type="file"
                                        accept="image/jpeg,image/png,image/webp"
                                        className="box-border h-auto min-h-11 w-full max-w-full min-w-0 file:mr-2 file:max-w-full file:shrink-0"
                                        onChange={(inputEvent) => {
                                            form.setData(
                                                'background',
                                                inputEvent.target.files?.[0] ??
                                                    null,
                                            );
                                            form.setData(
                                                'remove_background',
                                                false,
                                            );
                                        }}
                                    />
                                    {form.data.background && (
                                        <p className="text-muted-foreground max-w-full min-w-0 text-xs break-all">
                                            {form.data.background.name}
                                        </p>
                                    )}
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
                                <div className="grid min-w-0 grid-cols-1 gap-4">
                                    <div className="grid min-w-0 gap-2">
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
                                            className="border-input focus-visible:border-ring focus-visible:ring-ring/35 bg-card box-border h-11 w-full max-w-full min-w-0 rounded-xl border px-3 text-sm shadow-xs outline-none focus-visible:ring-3"
                                        >
                                            <option value="cover">
                                                Cobrir a área
                                            </option>
                                            <option value="repeat">
                                                Repetir como textura
                                            </option>
                                        </select>
                                    </div>
                                    <div className="grid min-w-0 gap-2">
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
                                            className="border-input focus-visible:border-ring focus-visible:ring-ring/35 bg-card box-border h-11 w-full max-w-full min-w-0 rounded-xl border px-3 text-sm shadow-xs outline-none focus-visible:ring-3"
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
                                    <div className="grid min-w-0 gap-2">
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
                                            className="border-input focus-visible:border-ring focus-visible:ring-ring/35 bg-card box-border h-11 w-full max-w-full min-w-0 rounded-xl border px-3 text-sm shadow-xs outline-none focus-visible:ring-3"
                                        >
                                            <option value="light">Clara</option>
                                            <option value="dark">Escura</option>
                                        </select>
                                    </div>
                                    <div className="grid min-w-0 gap-2">
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
                                            className="box-border max-w-full min-w-0"
                                        />
                                    </div>
                                </div>
                                {(backgroundPreview ||
                                    (!form.data.remove_background &&
                                        event.theme.backgroundUrl)) && (
                                    <Button
                                        type="button"
                                        variant="outline"
                                        className="justify-self-start"
                                        onClick={() => {
                                            form.setData('background', null);
                                            form.setData(
                                                'remove_background',
                                                true,
                                            );
                                            setBackgroundPreview(null);

                                            if (backgroundInput.current) {
                                                backgroundInput.current.value =
                                                    '';
                                            }
                                        }}
                                    >
                                        <Trash2 /> Remover imagem de fundo
                                    </Button>
                                )}
                            </CardContent>
                        </Card>

                        <Card className="box-border w-full max-w-full min-w-0">
                            <CardHeader>
                                <CardTitle>Banner</CardTitle>
                                <CardDescription>
                                    JPEG, PNG ou WebP de até 5 MB. Imagens
                                    horizontais funcionam melhor.
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="grid min-w-0 gap-5">
                                <div className="grid gap-2">
                                    <Label htmlFor="banner">Imagem</Label>
                                    <Input
                                        id="banner"
                                        ref={bannerInput}
                                        type="file"
                                        accept="image/jpeg,image/png,image/webp"
                                        className="box-border h-auto min-h-11 w-full max-w-full min-w-0 file:mr-2 file:max-w-full file:shrink-0"
                                        onChange={(inputEvent) => {
                                            form.setData(
                                                'banner',
                                                inputEvent.target.files?.[0] ??
                                                    null,
                                            );
                                            form.setData(
                                                'remove_banner',
                                                false,
                                            );
                                        }}
                                    />
                                    {form.data.banner && (
                                        <p className="text-muted-foreground max-w-full min-w-0 text-xs break-all">
                                            {form.data.banner.name}
                                        </p>
                                    )}
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
                                        className="border-input focus-visible:border-ring focus-visible:ring-ring/35 bg-card box-border h-11 w-full max-w-full min-w-0 rounded-xl border px-3 text-sm shadow-xs outline-none focus-visible:ring-3"
                                    >
                                        <option value="top">Topo</option>
                                        <option value="center">Centro</option>
                                        <option value="bottom">Base</option>
                                    </select>
                                </div>
                                {(bannerPreview ||
                                    (!form.data.remove_banner &&
                                        event.theme.bannerUrl)) && (
                                    <Button
                                        type="button"
                                        variant="outline"
                                        className="justify-self-start"
                                        onClick={() => {
                                            form.setData('banner', null);
                                            form.setData('remove_banner', true);
                                            setBannerPreview(null);

                                            if (bannerInput.current) {
                                                bannerInput.current.value = '';
                                            }
                                        }}
                                    >
                                        <Trash2 /> Remover banner
                                    </Button>
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

                        <Card className="box-border w-full max-w-full min-w-0">
                            <CardHeader>
                                <CardTitle>Seções</CardTitle>
                                <CardDescription>
                                    Arraste ou use os botões para ordenar. A
                                    lista de confirmados é configurada dentro da
                                    própria confirmação de presença.
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="grid min-w-0 gap-2">
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
                                            className="grid gap-3 rounded-lg border p-3"
                                        >
                                            <div className="flex items-center gap-2">
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
                                                            ...form.data
                                                                .sections,
                                                        ];
                                                        sections[sectionIndex] =
                                                            {
                                                                ...section,
                                                                enabled:
                                                                    inputEvent
                                                                        .target
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
                                                <Button
                                                    type="button"
                                                    size="icon"
                                                    variant="ghost"
                                                    disabled={
                                                        sectionIndex === 0
                                                    }
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
                                                        form.data.sections
                                                            .length -
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
                                            {section.type === 'rsvp' && (
                                                <label className="flex items-start gap-3 border-t pt-3 text-sm">
                                                    <input
                                                        type="checkbox"
                                                        checked={
                                                            form.data
                                                                .show_confirmed_guests
                                                        }
                                                        onChange={(
                                                            inputEvent,
                                                        ) =>
                                                            form.setData(
                                                                'show_confirmed_guests',
                                                                inputEvent
                                                                    .target
                                                                    .checked,
                                                            )
                                                        }
                                                        className="accent-primary mt-0.5 size-4 shrink-0"
                                                    />
                                                    <span>
                                                        <span className="block font-medium">
                                                            Mostrar lista de
                                                            confirmados no
                                                            convite
                                                        </span>
                                                        <span className="text-muted-foreground mt-1 block text-xs leading-5">
                                                            Exibe publicamente
                                                            apenas os nomes dos
                                                            titulares. Ao
                                                            ocultar a seção,
                                                            esta lista também
                                                            ficará oculta.
                                                        </span>
                                                    </span>
                                                </label>
                                            )}
                                        </div>
                                    ),
                                )}
                                <InputError message={form.errors.sections} />
                                <InputError
                                    message={form.errors.show_confirmed_guests}
                                />
                            </CardContent>
                        </Card>

                        <Card className="min-w-0">
                            <CardHeader>
                                <CardTitle>
                                    Cores para inspirar os presentes
                                </CardTitle>
                                <CardDescription>
                                    Se quiser, indique cores para ajudar seus
                                    convidados a escolher presentes que combinem
                                    com suas preferências.
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="grid min-w-0 gap-4">
                                {form.data.palette_items.map(
                                    (item, itemIndex) => (
                                        <div
                                            key={item.position}
                                            className="grid min-w-0 gap-3 rounded-lg border p-4 sm:grid-cols-2 lg:grid-cols-2"
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
                                                    className="h-11 w-full min-w-0 p-1"
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
                                                color_hex: '',
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
                                        participationActionEnabled={false}
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
                                navigationBypass.current = true;
                                themeForm.transform(() => ({
                                    theme_key: pendingTheme.key,
                                }));
                                themeForm.post(
                                    EventThemeController.update(event.id).url,
                                    {
                                        preserveState: false,
                                        preserveScroll: true,
                                        onSuccess: () => setPendingTheme(null),
                                        onError: () => {
                                            navigationBypass.current = false;
                                        },
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

function FontSelect({
    label,
    name,
    options,
    value,
    onChange,
    error,
}: {
    label: string;
    name: string;
    options: EventFontOption[];
    value: string;
    onChange: (value: string) => void;
    error?: string;
}) {
    return (
        <div className="grid w-full max-w-full min-w-0 gap-2">
            <Label htmlFor={name}>{label}</Label>
            <Select value={value} onValueChange={onChange}>
                <SelectTrigger
                    id={name}
                    className="box-border w-full max-w-full min-w-0"
                    style={{ fontFamily: fontStack(value) }}
                >
                    <SelectValue />
                </SelectTrigger>
                <SelectContent align="start">
                    {options.map((option) => (
                        <SelectItem
                            key={option.value}
                            value={option.value}
                            style={{ fontFamily: fontStack(option.value) }}
                        >
                            {option.label}
                        </SelectItem>
                    ))}
                </SelectContent>
            </Select>
            <InputError message={error} />
        </div>
    );
}

EventAppearance.layout = {
    breadcrumbs: [{ title: 'Meus eventos', href: index() }],
};
