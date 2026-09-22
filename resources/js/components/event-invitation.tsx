import { useEffect, useState, type CSSProperties, type ReactNode } from 'react';
import { Link } from '@inertiajs/react';
import {
    CalendarDays,
    Clock3,
    ExternalLink,
    Gift,
    Heart,
    MapPin,
    Palette,
    Users,
} from 'lucide-react';
import {
    buttonClass,
    cardClass,
    decorationBackground,
    fontStack,
    themeAssets,
} from '@/lib/event-theme';
import type {
    EventGift,
    EventInvitation as EventInvitationData,
    EventSectionType,
} from '@/types';
import { participation } from '@/routes/public/events';

type ThemeStyle = CSSProperties & {
    '--event-accent': string;
    '--event-background': string;
    '--event-border': string;
    '--event-surface': string;
    '--event-text': string;
    '--event-title-color': string;
    '--event-title-font': string;
};

type CountdownRemaining = {
    days: number;
    hours: number;
    minutes: number;
    seconds: number;
};

function calculateCountdown(startsAt: string): CountdownRemaining {
    const difference = Math.max(0, new Date(startsAt).getTime() - Date.now());

    return {
        days: Math.floor(difference / 86_400_000),
        hours: Math.floor((difference / 3_600_000) % 24),
        minutes: Math.floor((difference / 60_000) % 60),
        seconds: Math.floor((difference / 1_000) % 60),
    };
}

function SectionShell({ children, id }: { children: ReactNode; id?: string }) {
    return (
        <section
            id={id}
            className="mx-auto w-full max-w-5xl px-5 py-10 @min-[640px]:px-8 @min-[640px]:py-14"
        >
            {children}
        </section>
    );
}

function Countdown({ startsAt }: { startsAt: string | null }) {
    const [remaining, setRemaining] = useState<CountdownRemaining | null>(null);

    useEffect(() => {
        if (!startsAt) {
            setRemaining(null);

            return;
        }

        const updateCountdown = () =>
            setRemaining(calculateCountdown(startsAt));
        updateCountdown();
        const timer = window.setInterval(updateCountdown, 1_000);

        return () => window.clearInterval(timer);
    }, [startsAt]);

    if (!startsAt) {
        return (
            <p className="text-center text-sm opacity-70">Data a confirmar</p>
        );
    }

    const values = remaining
        ? [
              ['Dias', remaining.days],
              ['Horas', remaining.hours],
              ['Minutos', remaining.minutes],
              ['Segundos', remaining.seconds],
          ]
        : [
              ['Dias', '--'],
              ['Horas', '--'],
              ['Minutos', '--'],
              ['Segundos', '--'],
          ];

    return (
        <div className="grid grid-cols-2 gap-3 @min-[640px]:grid-cols-4">
            {values.map(([label, value]) => (
                <div
                    key={label}
                    className="rounded-2xl border border-(--event-border) bg-(--event-surface) p-4 text-center shadow-sm"
                >
                    <strong className="event-title-font block text-3xl tabular-nums @min-[640px]:text-4xl">
                        {String(value).padStart(2, '0')}
                    </strong>
                    <span className="text-xs tracking-wider uppercase opacity-65">
                        {label}
                    </span>
                </div>
            ))}
        </div>
    );
}

export default function EventInvitation({
    event,
    showGuestActions = true,
    participationActionEnabled = true,
    onGiftSelect,
    reservingGiftId = null,
    giftReservations = {},
}: {
    event: EventInvitationData;
    showGuestActions?: boolean;
    participationActionEnabled?: boolean;
    onGiftSelect?: (gift: EventGift) => void;
    reservingGiftId?: number | null;
    giftReservations?: Record<string, number>;
}) {
    const date = event.startsAt ? new Date(event.startsAt) : null;
    const assets = themeAssets(event.theme.templateKey);
    const postCoverBackgroundUrl = event.theme.backgroundUrl
        ? null
        : assets.postCoverBackgroundUrl;
    const titleColor =
        assets.titleColor && event.theme.textColor.toUpperCase() === '#344E50'
            ? assets.titleColor
            : event.theme.textColor;
    const eventTypeLabels: Record<string, string> = {
        housewarming: 'Chá de casa nova',
        kitchen_tea: 'Chá de panela',
        wedding: 'Casamento',
        birthday: 'Aniversário',
        other: 'Celebração',
    };
    const eventTypeLabel = eventTypeLabels[event.type] ?? 'Celebração';
    const titleIncludesType = event.title
        .toLocaleLowerCase('pt-BR')
        .includes(eventTypeLabel.toLocaleLowerCase('pt-BR'));
    const dateDay = date
        ? new Intl.DateTimeFormat('pt-BR', {
              day: '2-digit',
              timeZone: event.timezone,
          }).format(date)
        : null;
    const dateMonthYear = date
        ? new Intl.DateTimeFormat('pt-BR', {
              month: 'long',
              year: 'numeric',
              timeZone: event.timezone,
          }).format(date)
        : null;
    const dateTimeLabel = date
        ? new Intl.DateTimeFormat('pt-BR', {
              dateStyle: 'full',
              timeStyle: 'short',
              timeZone: event.timezone,
          }).format(date)
        : 'Data e horário a confirmar';
    const themeStyle: ThemeStyle = {
        '--event-accent': event.theme.accentColor,
        '--event-background': event.theme.backgroundColor,
        '--event-border': event.theme.borderColor,
        '--event-surface': event.theme.surfaceColor,
        '--event-text': event.theme.textColor,
        '--event-title-color': titleColor,
        '--event-title-font': fontStack(event.theme.titleFont),
        fontFamily: fontStack(event.theme.bodyFont),
        backgroundColor: event.theme.backgroundColor,
        backgroundImage: event.theme.backgroundUrl
            ? `linear-gradient(${event.theme.backgroundOverlay === 'dark' ? `rgba(0,0,0,${event.theme.backgroundOverlayOpacity / 100})` : `rgba(255,255,255,${event.theme.backgroundOverlayOpacity / 100})`}, ${event.theme.backgroundOverlay === 'dark' ? `rgba(0,0,0,${event.theme.backgroundOverlayOpacity / 100})` : `rgba(255,255,255,${event.theme.backgroundOverlayOpacity / 100})`}), url(${event.theme.backgroundUrl})`
            : postCoverBackgroundUrl
              ? undefined
              : decorationBackground(event.theme),
        backgroundSize:
            event.theme.backgroundFill === 'repeat' ? 'auto' : 'cover',
        backgroundRepeat:
            event.theme.backgroundFill === 'repeat' ? 'repeat' : 'no-repeat',
        backgroundPosition: event.theme.backgroundPosition,
    };

    const sections: Record<EventSectionType, ReactNode> = {
        cover: (
            <section
                className={`relative overflow-hidden border-b border-(--event-border) ${assets.coverFrameUrl ? 'py-5 @min-[640px]:py-8' : 'min-h-[28rem]'}`}
                style={
                    assets.backgroundUrl &&
                    !event.theme.bannerUrl &&
                    !event.theme.backgroundUrl
                        ? {
                              backgroundImage: `${assets.backgroundOverlay === 'light' ? `linear-gradient(rgba(255,255,255,${(assets.backgroundOverlayOpacity ?? 0) / 100}), rgba(255,255,255,${(assets.backgroundOverlayOpacity ?? 0) / 100}))` : assets.backgroundOverlay === 'dark' ? `linear-gradient(rgba(0,0,0,${(assets.backgroundOverlayOpacity ?? 0) / 100}), rgba(0,0,0,${(assets.backgroundOverlayOpacity ?? 0) / 100}))` : 'none'}, url(${assets.backgroundUrl})`,
                              backgroundPosition:
                                  assets.backgroundPosition ?? 'center',
                              backgroundRepeat:
                                  assets.backgroundFill === 'repeat'
                                      ? 'repeat'
                                      : 'no-repeat',
                              backgroundSize:
                                  assets.backgroundFill === 'repeat'
                                      ? 'auto'
                                      : 'cover',
                          }
                        : undefined
                }
            >
                {event.theme.bannerUrl ? (
                    <img
                        src={event.theme.bannerUrl}
                        alt=""
                        className="absolute inset-0 size-full object-cover"
                        style={{ objectPosition: event.theme.bannerPosition }}
                    />
                ) : !assets.coverFrameUrl ? (
                    <>
                        <div className="absolute -top-24 -left-24 size-80 rounded-full border border-(--event-border)" />
                        <div className="absolute -right-24 -bottom-28 size-96 rounded-full border border-(--event-border)" />
                    </>
                ) : null}
                <div
                    className={`relative mx-4 my-0 flex flex-col justify-center gap-4 px-5 py-10 text-center @min-[640px]:mx-auto @min-[640px]:gap-6 @min-[640px]:px-10 @min-[640px]:py-14 ${assets.coverFrameUrl ? 'min-h-0 w-[min(100%,680px)]' : 'min-h-[28rem] max-w-4xl'} ${event.theme.coverLayout === 'split' || event.theme.coverLayout === 'editorial' ? 'items-start text-left' : 'items-center'} ${event.theme.coverLayout === 'framed' ? (assets.coverFrameUrl ? 'border-[16px] border-transparent bg-clip-padding bg-origin-border @min-[640px]:border-[32px]' : 'border-2 border-(--event-border)') : ''}`}
                    style={
                        assets.coverFrameUrl && !event.theme.bannerUrl
                            ? {
                                  backgroundImage: `linear-gradient(${event.theme.surfaceColor}, ${event.theme.surfaceColor}), url(${assets.coverFrameUrl})`,
                                  backgroundOrigin: 'border-box',
                                  backgroundClip: 'padding-box, border-box',
                                  backgroundSize: 'auto, auto 144px',
                              }
                            : undefined
                    }
                >
                    <span
                        className="text-[2.5rem] leading-tight text-(--event-title-color) @min-[640px]:text-[3.5rem]"
                        style={{ fontFamily: fontStack(event.theme.titleFont) }}
                    >
                        {titleIncludesType
                            ? 'Você está convidado'
                            : eventTypeLabel}
                    </span>
                    {assets.coverIllustrationUrl && (
                        <img
                            src={assets.coverIllustrationUrl}
                            alt="Avental azul claro com detalhe botânico"
                            className="h-36 w-28 object-contain @min-[640px]:h-52 @min-[640px]:w-36"
                        />
                    )}
                    <h1
                        className={`leading-tight text-balance ${assets.coverFrameUrl ? 'max-w-full text-lg @min-[640px]:text-2xl' : 'text-5xl @min-[640px]:text-7xl'}`}
                        aria-label={
                            assets.coverFrameUrl
                                ? `${event.title}. ${dateTimeLabel}`
                                : undefined
                        }
                    >
                        {event.title}
                    </h1>
                    {assets.coverFrameUrl && (
                        <div className="grid w-full max-w-2xl gap-4 text-sm">
                            <div className="flex justify-center gap-3">
                                <div className="min-w-28 border-y border-(--event-border) px-4 py-2 text-center">
                                    <span className="block text-2xl font-semibold text-(--event-title-color)">
                                        {dateDay ?? '--'}
                                    </span>
                                    <span className="block text-xs capitalize opacity-75">
                                        {dateMonthYear ?? 'Data a confirmar'}
                                    </span>
                                </div>
                                <div className="min-w-28 border-y border-(--event-border) px-4 py-2 text-center">
                                    <span className="block text-2xl font-semibold text-(--event-title-color)">
                                        {date
                                            ? new Intl.DateTimeFormat('pt-BR', {
                                                  timeStyle: 'short',
                                                  timeZone: event.timezone,
                                              }).format(date)
                                            : '--:--'}
                                    </span>
                                    <span className="block text-xs opacity-75">
                                        Horário
                                    </span>
                                </div>
                            </div>
                            <p className="max-w-xl border-t border-(--event-border) pt-4 text-center leading-6 break-words">
                                <strong className="block text-(--event-title-color)">
                                    {event.venueName ?? 'Local a confirmar'}
                                </strong>
                                {event.address && (
                                    <span className="block opacity-80">
                                        {event.address}
                                    </span>
                                )}
                            </p>
                        </div>
                    )}
                </div>
            </section>
        ),
        welcome: event.welcomeText ? (
            <SectionShell id="presentes">
                <div className="mx-auto max-w-3xl text-center">
                    <Heart className="mx-auto size-7 text-(--event-accent)" />
                    <h2 className="mt-4 font-serif text-3xl @min-[640px]:text-4xl">
                        Boas-vindas
                    </h2>
                    <p className="mt-5 text-base leading-8 whitespace-pre-line opacity-75 @min-[640px]:text-lg">
                        {event.welcomeText}
                    </p>
                </div>
            </SectionShell>
        ) : null,
        information: (
            <SectionShell>
                <h2 className="mb-8 text-center font-serif text-3xl @min-[640px]:text-4xl">
                    Informações do evento
                </h2>
                <div className="grid gap-4 @min-[768px]:grid-cols-3">
                    <InformationCard icon={<CalendarDays />} title="Data">
                        {date
                            ? new Intl.DateTimeFormat('pt-BR', {
                                  dateStyle: 'full',
                                  timeZone: event.timezone,
                              }).format(date)
                            : 'A confirmar'}
                    </InformationCard>
                    <InformationCard icon={<Clock3 />} title="Horário">
                        {date
                            ? new Intl.DateTimeFormat('pt-BR', {
                                  timeStyle: 'short',
                                  timeZone: event.timezone,
                              }).format(date)
                            : 'A confirmar'}
                    </InformationCard>
                    <InformationCard icon={<MapPin />} title="Local">
                        {event.venueName ?? 'A confirmar'}
                        {event.address && (
                            <span className="block">{event.address}</span>
                        )}
                        {event.mapUrl && (
                            <a
                                href={event.mapUrl}
                                target="_blank"
                                rel="noreferrer"
                                className="mt-3 inline-flex items-center gap-2 font-medium text-(--event-accent) underline underline-offset-4 focus-visible:outline-2 focus-visible:outline-offset-4"
                            >
                                Abrir no mapa
                                <ExternalLink className="size-3.5" />
                            </a>
                        )}
                    </InformationCard>
                </div>
            </SectionShell>
        ),
        countdown: (
            <SectionShell>
                <h2 className="mb-8 text-center font-serif text-3xl @min-[640px]:text-4xl">
                    Contagem regressiva
                </h2>
                <Countdown startsAt={event.startsAt} />
            </SectionShell>
        ),
        palette:
            event.paletteItems.length > 0 ? (
                <SectionShell>
                    <div className="text-center">
                        <Palette className="mx-auto size-7 text-(--event-accent)" />
                        <h2 className="mt-4 font-serif text-3xl @min-[640px]:text-4xl">
                            Cores para inspirar os presentes
                        </h2>
                        <p className="mt-3 text-sm opacity-70">
                            Se quiser, indique cores para ajudar seus convidados
                            a escolher presentes que combinem com suas
                            preferências.
                        </p>
                    </div>
                    <div className="mt-8 grid grid-cols-2 gap-3 @min-[640px]:grid-cols-4">
                        {event.paletteItems.map((item) => (
                            <div
                                key={`${item.position}-${item.label}`}
                                className="rounded-2xl border border-(--event-border) bg-(--event-surface) p-4 text-center"
                            >
                                {item.colorHex && (
                                    <span
                                        className="mx-auto mb-3 block size-12 rounded-full border border-black/10"
                                        style={{
                                            backgroundColor: item.colorHex,
                                        }}
                                    />
                                )}
                                <strong className="block text-sm">
                                    {item.label}
                                </strong>
                                {item.material && (
                                    <span className="mt-1 block text-xs opacity-65">
                                        {item.material}
                                    </span>
                                )}
                            </div>
                        ))}
                    </div>
                </SectionShell>
            ) : null,
        gifts: (
            <SectionShell>
                <div className="text-center">
                    <Gift className="mx-auto size-7 text-(--event-accent)" />
                    <h2 className="mt-4 font-serif text-3xl">Presentes</h2>
                    <p className="mt-3 text-sm opacity-70">
                        Cada reserva atualiza a quantidade disponível.
                    </p>
                </div>
                {event.gifts.length > 0 ? (
                    <div className="mt-8 grid gap-4 @min-[640px]:grid-cols-2 @min-[1024px]:grid-cols-3">
                        {event.gifts.map((gift) => {
                            const soldOut = gift.quantityAvailable <= 0;

                            return (
                                <article
                                    key={gift.id}
                                    id={`presente-${gift.id}`}
                                    className={`relative flex min-w-0 flex-col overflow-hidden border border-(--event-border) bg-(--event-surface) ${cardClass(event.theme.cardStyle)}`}
                                >
                                    {soldOut && (
                                        <span className="absolute top-3 right-3 z-10 rounded-full bg-neutral-950/85 px-3 py-1 text-xs font-semibold text-white">
                                            Já reservado
                                        </span>
                                    )}
                                    {gift.imageUrl && (
                                        <img
                                            src={gift.imageUrl}
                                            alt=""
                                            className={`aspect-[4/3] w-full object-cover transition ${soldOut ? 'opacity-55 grayscale' : ''}`}
                                        />
                                    )}
                                    <div className="flex min-w-0 flex-1 flex-col p-5">
                                        <h3 className="font-serif text-xl">
                                            {gift.name}
                                        </h3>
                                        {gift.description && (
                                            <p className="mt-2 text-sm leading-6 opacity-70">
                                                {gift.description}
                                            </p>
                                        )}
                                        <p className="mt-4 text-sm font-semibold">
                                            {gift.quantityAvailable > 0
                                                ? `${gift.quantityAvailable} ${gift.quantityAvailable === 1 ? 'unidade disponível' : 'unidades disponíveis'} de ${gift.quantityTotal}`
                                                : 'Sem unidades disponíveis'}
                                        </p>
                                        {giftReservations[String(gift.id)] && (
                                            <p className="mt-2 text-sm text-emerald-700">
                                                Você escolheu{' '}
                                                {
                                                    giftReservations[
                                                        String(gift.id)
                                                    ]
                                                }{' '}
                                                {giftReservations[
                                                    String(gift.id)
                                                ] === 1
                                                    ? 'unidade'
                                                    : 'unidades'}
                                            </p>
                                        )}
                                        <div className="mt-auto grid gap-2 pt-5 @min-[420px]:grid-cols-2">
                                            {!soldOut &&
                                            event.slug &&
                                            showGuestActions &&
                                            gift.quantityAvailable > 0 &&
                                            onGiftSelect ? (
                                                <button
                                                    type="button"
                                                    disabled={
                                                        reservingGiftId !== null
                                                    }
                                                    onClick={() =>
                                                        onGiftSelect(gift)
                                                    }
                                                    className={`inline-flex min-h-11 items-center justify-center bg-(--event-accent) px-3 text-center text-sm font-semibold text-white outline-offset-2 hover:brightness-95 focus-visible:outline-2 ${buttonClass(event.theme.buttonStyle)}`}
                                                >
                                                    {reservingGiftId === gift.id
                                                        ? 'Reservando...'
                                                        : 'Presentear'}
                                                </button>
                                            ) : (
                                                <button
                                                    type="button"
                                                    disabled
                                                    aria-disabled="true"
                                                    className={`inline-flex min-h-11 cursor-not-allowed items-center justify-center bg-(--event-accent) px-3 text-center text-sm font-semibold text-white opacity-45 ${buttonClass(event.theme.buttonStyle)}`}
                                                >
                                                    {soldOut
                                                        ? 'Já reservado'
                                                        : 'Presentear'}
                                                </button>
                                            )}
                                            {!soldOut && gift.purchaseUrl ? (
                                                <a
                                                    href={gift.purchaseUrl}
                                                    target="_blank"
                                                    rel="noreferrer"
                                                    className="inline-flex min-h-11 items-center justify-center rounded-lg border border-(--event-border) px-3 text-center text-sm font-semibold text-(--event-accent) outline-offset-2 hover:bg-(--event-background) focus-visible:outline-2"
                                                >
                                                    Sugestão de compra
                                                    <ExternalLink className="ml-1.5 size-3.5 shrink-0" />
                                                </a>
                                            ) : !soldOut ? (
                                                <span
                                                    aria-disabled="true"
                                                    className="inline-flex min-h-11 cursor-not-allowed items-center justify-center rounded-lg border border-(--event-border) px-3 text-center text-sm font-semibold opacity-45"
                                                >
                                                    Sugestão de compra
                                                </span>
                                            ) : null}
                                        </div>
                                    </div>
                                </article>
                            );
                        })}
                    </div>
                ) : (
                    <p className="mt-8 text-center text-sm opacity-65">
                        A lista ainda não possui presentes.
                    </p>
                )}
            </SectionShell>
        ),
        instructions: event.instructions ? (
            <SectionShell>
                <div className="rounded-3xl bg-(--event-accent) px-6 py-10 text-center text-white @min-[640px]:px-10">
                    <h2 className="font-serif text-3xl">Orientações</h2>
                    <p className="mt-4 leading-7 whitespace-pre-line text-white/85">
                        {event.instructions}
                    </p>
                </div>
            </SectionShell>
        ) : null,
        rsvp: (
            <SectionShell>
                <div className="rounded-3xl border border-(--event-border) bg-(--event-surface) px-6 py-10 text-center @min-[640px]:px-10">
                    <h2 className="font-serif text-3xl">
                        Confirmação de presença
                    </h2>
                    <p className="mt-3 text-sm opacity-70">
                        Confirme sua participação e informe seus acompanhantes.
                    </p>
                    {event.slug &&
                        (participationActionEnabled ? (
                            <Link
                                href={participation(event.slug)}
                                className={`mt-6 inline-flex min-h-11 items-center justify-center bg-(--event-accent) px-5 text-sm font-semibold text-white outline-offset-4 hover:brightness-95 focus-visible:outline-2 ${buttonClass(event.theme.buttonStyle)}`}
                            >
                                Confirmar presença
                            </Link>
                        ) : (
                            <span
                                aria-hidden="true"
                                className={`mt-6 inline-flex min-h-11 items-center justify-center bg-(--event-accent) px-5 text-sm font-semibold text-white ${buttonClass(event.theme.buttonStyle)}`}
                            >
                                Confirmar presença
                            </span>
                        ))}
                    {event.showConfirmedGuests &&
                        event.confirmedGuestNames !== undefined && (
                            <div className="mt-8 border-t border-(--event-border) pt-8">
                                <Users className="mx-auto size-6 text-(--event-accent)" />
                                <h3 className="mt-3 text-2xl">
                                    Quem já confirmou
                                </h3>
                                <ConfirmedGuestNames
                                    names={event.confirmedGuestNames}
                                />
                            </div>
                        )}
                </div>
            </SectionShell>
        ),
    };
    const orderedSections = event.sections
        .filter((section) => section.enabled)
        .filter(
            (section) =>
                section.type !== 'palette' || event.paletteItems.length > 0,
        )
        .sort((first, second) => first.position - second.position);
    const coverIndex = orderedSections.findIndex(
        (section) => section.type === 'cover',
    );
    const renderedSections = orderedSections.map((section) => (
        <div key={section.type}>{sections[section.type]}</div>
    ));
    const readOnlyFooter = event.isReadOnly && (
        <footer className="border-t border-(--event-border) px-5 py-8 text-center text-sm opacity-70">
            Este evento foi encerrado e está disponível somente para consulta.
        </footer>
    );

    return (
        <div
            style={themeStyle}
            className={`event-typography @container min-h-screen overflow-x-hidden bg-(--event-background) text-(--event-text) ${postCoverBackgroundUrl ? 'flex flex-col' : ''}`}
        >
            {!event.sections.some(
                (section) => section.type === 'cover' && section.enabled,
            ) && <h1 className="sr-only">{event.title}</h1>}
            {postCoverBackgroundUrl ? (
                <>
                    {renderedSections.slice(0, coverIndex + 1)}
                    <div
                        className="w-full flex-1"
                        style={{
                            backgroundImage: `url(${postCoverBackgroundUrl})`,
                            backgroundPosition: 'top left',
                            backgroundRepeat: 'repeat',
                            backgroundSize: '400px auto',
                        }}
                    >
                        {renderedSections.slice(coverIndex + 1)}
                        {readOnlyFooter}
                    </div>
                </>
            ) : (
                <>
                    {renderedSections}
                    {readOnlyFooter}
                </>
            )}
            {event.slug && showGuestActions && (
                <div className="fixed right-4 bottom-4 z-20">
                    <Link
                        href={participation(event.slug)}
                        className="inline-flex min-h-11 items-center rounded-full bg-(--event-accent) px-5 text-sm font-semibold text-white shadow-lg outline-offset-4 hover:brightness-95 focus-visible:outline-2"
                    >
                        Minha participação
                    </Link>
                </div>
            )}
        </div>
    );
}

function ConfirmedGuestNames({ names }: { names?: string[] }) {
    if (!names || names.length === 0) {
        return (
            <p className="mt-6 text-center text-sm opacity-65">
                As confirmações aparecerão aqui.
            </p>
        );
    }

    return (
        <ul className="mx-auto mt-6 max-w-2xl divide-y divide-(--event-border) border-y border-(--event-border)">
            {names.map((name, index) => (
                <li
                    key={`${name}-${index}`}
                    className="px-3 py-3 text-center font-medium"
                >
                    {name}
                </li>
            ))}
        </ul>
    );
}

function InformationCard({
    children,
    icon,
    title,
}: {
    children: ReactNode;
    icon: ReactNode;
    title: string;
}) {
    return (
        <article className="rounded-2xl border border-(--event-border) bg-(--event-surface) p-6 shadow-sm">
            <div className="mb-5 text-(--event-accent) [&>svg]:size-6">
                {icon}
            </div>
            <h3 className="font-serif text-xl">{title}</h3>
            <div className="mt-2 text-sm leading-6 opacity-75">{children}</div>
        </article>
    );
}
