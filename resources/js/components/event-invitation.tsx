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
} from 'lucide-react';
import type {
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
};

function SectionShell({ children }: { children: ReactNode }) {
    return (
        <section className="mx-auto w-full max-w-5xl px-5 py-10 sm:px-8 sm:py-14">
            {children}
        </section>
    );
}

function Countdown({ startsAt }: { startsAt: string | null }) {
    const calculateRemaining = () => {
        const difference = startsAt
            ? Math.max(0, new Date(startsAt).getTime() - Date.now())
            : 0;

        return {
            days: Math.floor(difference / 86_400_000),
            hours: Math.floor((difference / 3_600_000) % 24),
            minutes: Math.floor((difference / 60_000) % 60),
            seconds: Math.floor((difference / 1_000) % 60),
        };
    };

    const [remaining, setRemaining] = useState(calculateRemaining);

    useEffect(() => {
        const timer = window.setInterval(
            () => setRemaining(calculateRemaining()),
            1_000,
        );

        return () => window.clearInterval(timer);
    }, [startsAt]);

    if (!startsAt) {
        return (
            <p className="text-center text-sm opacity-70">Data a confirmar</p>
        );
    }

    const values = [
        ['Dias', remaining.days],
        ['Horas', remaining.hours],
        ['Minutos', remaining.minutes],
        ['Segundos', remaining.seconds],
    ];

    return (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            {values.map(([label, value]) => (
                <div
                    key={label}
                    className="rounded-2xl border border-(--event-border) bg-(--event-surface) p-4 text-center shadow-sm"
                >
                    <strong className="block font-serif text-3xl tabular-nums sm:text-4xl">
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
}: {
    event: EventInvitationData;
    showGuestActions?: boolean;
}) {
    const date = event.startsAt ? new Date(event.startsAt) : null;
    const themeStyle: ThemeStyle = {
        '--event-accent': event.theme.accentColor,
        '--event-background': event.theme.backgroundColor,
        '--event-border': event.theme.borderColor,
        '--event-surface': event.theme.surfaceColor,
        '--event-text': event.theme.textColor,
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
                {event.theme.bannerUrl && (
                    <div className="absolute inset-0 bg-black/45" />
                )}
                <div
                    className={`relative mx-auto flex min-h-[28rem] max-w-4xl flex-col items-center justify-center gap-6 px-5 py-20 text-center ${event.theme.bannerUrl ? 'text-white' : ''}`}
                >
                    <span className="text-xs font-semibold tracking-[0.3em] uppercase">
                        Você está convidado
                    </span>
                    <h1 className="font-serif text-5xl leading-tight text-balance sm:text-7xl">
                        {event.title}
                    </h1>
                </div>
            </section>
        ),
        welcome: event.welcomeText ? (
            <SectionShell>
                <div className="mx-auto max-w-3xl text-center">
                    <Heart className="mx-auto size-7 text-(--event-accent)" />
                    <h2 className="mt-4 font-serif text-3xl sm:text-4xl">
                        Boas-vindas
                    </h2>
                    <p className="mt-5 text-base leading-8 whitespace-pre-line opacity-75 sm:text-lg">
                        {event.welcomeText}
                    </p>
                </div>
            </SectionShell>
        ) : null,
        information: (
            <SectionShell>
                <h2 className="mb-8 text-center font-serif text-3xl sm:text-4xl">
                    Informações do evento
                </h2>
                <div className="grid gap-4 md:grid-cols-3">
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
                <h2 className="mb-8 text-center font-serif text-3xl sm:text-4xl">
                    Contagem regressiva
                </h2>
                <Countdown startsAt={event.startsAt} />
            </SectionShell>
        ),
        palette: (
            <SectionShell>
                <div className="text-center">
                    <Palette className="mx-auto size-7 text-(--event-accent)" />
                    <h2 className="mt-4 font-serif text-3xl sm:text-4xl">
                        Paleta da casa
                    </h2>
                    <p className="mt-3 text-sm opacity-70">
                        Cores e materiais que combinam com o nosso lar.
                    </p>
                </div>
                {event.paletteItems.length > 0 ? (
                    <div className="mt-8 grid grid-cols-2 gap-3 sm:grid-cols-4">
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
                ) : (
                    <p className="mt-8 text-center text-sm opacity-65">
                        A paleta ainda não foi definida.
                    </p>
                )}
            </SectionShell>
        ),
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
                    <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                        {event.gifts.map((gift) => (
                            <article
                                key={gift.id}
                                id={`presente-${gift.id}`}
                                className="overflow-hidden rounded-2xl border border-(--event-border) bg-(--event-surface)"
                            >
                                {gift.imageUrl && (
                                    <img
                                        src={gift.imageUrl}
                                        alt=""
                                        className="aspect-[4/3] w-full object-cover"
                                    />
                                )}
                                <div className="p-5">
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
                                            ? `${gift.quantityAvailable} de ${gift.quantityTotal} unidades disponíveis`
                                            : 'Todos reservados'}
                                    </p>
                                    <div className="mt-5 grid grid-cols-2 gap-2">
                                        {event.slug &&
                                        showGuestActions &&
                                        gift.quantityAvailable > 0 ? (
                                            <Link
                                                href={`${
                                                    participation(event.slug, {
                                                        query: {
                                                            gift: gift.id,
                                                        },
                                                    }).url
                                                }#presente-${gift.id}`}
                                                className="inline-flex min-h-11 items-center justify-center rounded-lg bg-(--event-accent) px-3 text-center text-sm font-semibold text-white outline-offset-2 hover:brightness-95 focus-visible:outline-2"
                                            >
                                                Presentear
                                            </Link>
                                        ) : (
                                            <span
                                                aria-disabled="true"
                                                className="inline-flex min-h-11 cursor-not-allowed items-center justify-center rounded-lg bg-(--event-accent) px-3 text-center text-sm font-semibold text-white opacity-45"
                                            >
                                                Presentear
                                            </span>
                                        )}
                                        {gift.purchaseUrl ? (
                                            <a
                                                href={gift.purchaseUrl}
                                                target="_blank"
                                                rel="noreferrer"
                                                className="inline-flex min-h-11 items-center justify-center rounded-lg border border-(--event-border) px-3 text-center text-sm font-semibold text-(--event-accent) outline-offset-2 hover:bg-(--event-background) focus-visible:outline-2"
                                            >
                                                Sugestão de compra
                                                <ExternalLink className="ml-1.5 size-3.5 shrink-0" />
                                            </a>
                                        ) : (
                                            <span
                                                aria-disabled="true"
                                                className="inline-flex min-h-11 cursor-not-allowed items-center justify-center rounded-lg border border-(--event-border) px-3 text-center text-sm font-semibold opacity-45"
                                            >
                                                Sugestão de compra
                                            </span>
                                        )}
                                    </div>
                                </div>
                            </article>
                        ))}
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
                <div className="rounded-3xl bg-(--event-accent) px-6 py-10 text-center text-white sm:px-10">
                    <h2 className="font-serif text-3xl">Orientações</h2>
                    <p className="mt-4 leading-7 whitespace-pre-line text-white/85">
                        {event.instructions}
                    </p>
                </div>
            </SectionShell>
        ) : null,
        rsvp: (
            <SectionShell>
                <div className="rounded-3xl border border-(--event-border) bg-(--event-surface) px-6 py-10 text-center">
                    <h2 className="font-serif text-3xl">
                        Confirmação de presença
                    </h2>
                    <p className="mt-3 text-sm opacity-70">
                        A confirmação de presença estará disponível nesta área.
                    </p>
                </div>
            </SectionShell>
        ),
    };

    return (
        <div
            style={themeStyle}
            className="min-h-screen overflow-x-hidden bg-(--event-background) text-(--event-text)"
        >
            {!event.sections.some(
                (section) => section.type === 'cover' && section.enabled,
            ) && <h1 className="sr-only">{event.title}</h1>}
            {event.sections
                .filter((section) => section.enabled)
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
