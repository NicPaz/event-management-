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
    backgroundColor: string;
    surfaceColor: string;
    textColor: string;
    accentColor: string;
    borderColor: string;
    bannerUrl: string | null;
    bannerPosition: 'top' | 'center' | 'bottom';
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
    theme: EventTheme;
    sections: EventSection[];
    paletteItems: EventPaletteItem[];
    gifts: EventGift[];
};
