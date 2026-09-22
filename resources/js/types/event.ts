export type EventStatus = 'draft' | 'published' | 'closed';

export type EventSectionType =
    | 'cover'
    | 'welcome'
    | 'information'
    | 'countdown'
    | 'palette'
    | 'gifts'
    | 'instructions'
    | 'rsvp';

export type EventTypeOption = {
    label: string;
    value: string;
};

export type EventDetails = {
    id: number;
    title: string;
    slug: string | null;
    type: string;
    status: EventStatus;
    publicUrl?: string | null;
    invitationUrl?: string;
    startsAt: string | null;
    startsAtLocal: string | null;
    timezone: string;
    venueName: string | null;
    address: string | null;
    latitude: number | null;
    longitude: number | null;
    welcomeText: string | null;
    instructions: string | null;
    rsvpOpen: boolean;
    reservationsOpen: boolean;
};

export type EventTheme = {
    templateKey: string;
    backgroundColor: string;
    surfaceColor: string;
    textColor: string;
    accentColor: string;
    borderColor: string;
    bannerUrl: string | null;
    bannerPosition: 'top' | 'center' | 'bottom';
    fontPair: string;
    titleFont: string;
    bodyFont: string;
    coverLayout: string;
    cardStyle: string;
    buttonStyle: string;
    decorationStyle: string;
    backgroundUrl: string | null;
    backgroundFill: 'cover' | 'repeat';
    backgroundPosition: 'top' | 'center' | 'bottom' | 'left' | 'right';
    backgroundOverlay: 'light' | 'dark';
    backgroundOverlayOpacity: number;
};

export type EventThemeOption = {
    key: string;
    type: string;
    name: string;
    description: string;
    backgroundColor: string;
    surfaceColor: string;
    textColor: string;
    accentColor: string;
    borderColor: string;
    fontPair: string;
    titleFont: string;
    bodyFont: string;
    coverLayout: string;
    cardStyle: string;
    buttonStyle: string;
    decorationStyle: string;
};

export type EventFontOption = {
    value: string;
    label: string;
    category: string;
};

export type EventSection = {
    type: EventSectionType;
    label: string;
    enabled: boolean;
    position: number;
};

export type EventPaletteItem = {
    label: string;
    colorHex: string | null;
    material: string | null;
    position: number;
};

export type EventGift = {
    id: number;
    name: string;
    description: string | null;
    priceCents: number | null;
    imageUrl: string | null;
    purchaseUrl: string | null;
    quantityTotal: number;
    quantityReserved: number;
    quantityAvailable: number;
};

export type EventInvitation = {
    id: number;
    title: string;
    slug: string | null;
    publicUrl: string | null;
    type: string;
    status: EventStatus;
    startsAt: string | null;
    timezone: string;
    venueName: string | null;
    address: string | null;
    welcomeText: string | null;
    instructions: string | null;
    mapUrl: string | null;
    isReadOnly: boolean;
    showConfirmedGuests: boolean;
    theme: EventTheme;
    sections: EventSection[];
    paletteItems: EventPaletteItem[];
    gifts: EventGift[];
    confirmedGuestNames?: string[];
};
