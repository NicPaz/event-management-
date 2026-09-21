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
    const themeStyle: ThemeStyle = {
        '--event-accent': event.theme.accentColor,
        '--event-background': event.theme.backgroundColor,
        '--event-border': event.theme.borderColor,
        '--event-surface': event.theme.surfaceColor,
        '--event-text': event.theme.textColor,
        '--event-title-font': fontStack(event.theme.titleFont),
        fontFamily: fontStack(event.theme.bodyFont),
        backgroundColor: event.theme.backgroundColor,
        backgroundImage: event.theme.backgroundUrl
            ? `linear-gradient(${event.theme.backgroundOverlay === 'dark' ? `rgba(0,0,0,${event.theme.backgroundOverlayOpacity / 100})` : `rgba(255,255,255,${event.theme.backgroundOverlayOpacity / 100})`}, ${event.theme.backgroundOverlay === 'dark' ? `rgba(0,0,0,${event.theme.backgroundOverlayOpacity / 100})` : `rgba(255,255,255,${event.theme.backgroundOverlayOpacity / 100})`}), url(${event.theme.backgroundUrl})`
            : decorationBackground(event.theme),
        backgroundSize:
            event.theme.backgroundFill === 'repeat' ? 'auto' : 'cover',
        backgroundRepeat:
            event.theme.backgroundFill === 'repeat' ? 'repeat' : 'no-repeat',
        backgroundPosition: event.theme.backgroundPosition,
    };

    const sections: Record<EventSectionType, ReactNode> = {
        cover: (
            <section className="relative min-h-[28rem] overflow-hidden border-b border-(--event-border)">
                {event.theme.bannerUrl ? (
                    <img
                        src={event.theme.bannerUrl}
                        alt=""
                        className="absolute inset-0 size-full object-cover"
                        style={{ objectPosition: event.theme.bannerPosition }}
                    />
                ) : (
                    <>
                        <div className="absolute -top-24 -left-24 size-80 rounded-full border border-(--event-border)" />
                        <div className="absolute -right-24 -bottom-28 size-96 rounded-full border border-(--event-border)" />
                    </>
                )}
                <div
                    className={`relative mx-auto flex min-h-[28rem] max-w-4xl flex-col justify-center gap-6 px-5 py-20 ${event.theme.coverLayout === 'split' || event.theme.coverLayout === 'editorial' ? 'items-start text-left' : 'items-center text-center'} ${event.theme.coverLayout === 'framed' ? 'my-8 min-h-[24rem] border-2 border-(--event-border)' : ''}`}
                >
                    <span className="text-xs font-semibold tracking-[0.3em] uppercase">
                        Você está convidado
                    </span>
                    <h1 className="text-5xl leading-tight text-balance @min-[640px]:text-7xl">
                        {event.title}
                    </h1>
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

    return (
        <div
            style={themeStyle}
            className="event-typography @container min-h-screen overflow-x-hidden bg-(--event-background) text-(--event-text)"
        >
            {!event.sections.some(
                (section) => section.type === 'cover' && section.enabled,
            ) && <h1 className="sr-only">{event.title}</h1>}
            {event.sections
                .filter((section) => section.enabled)
                .filter(
                    (section) =>
                        section.type !== 'palette' ||
                        event.paletteItems.length > 0,
                )
                .sort((first, second) => first.position - second.position)
                .map((section) => (
                    <div key={section.type}>{sections[section.type]}</div>
                ))}
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
            {event.isReadOnly && (
                <footer className="border-t border-(--event-border) px-5 py-8 text-center text-sm opacity-70">
                    Este evento foi encerrado e está disponível somente para
                    consulta.
                </footer>
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
