import { Link, usePage } from '@inertiajs/react';
import {
    CalendarDays,
    Gift,
    LayoutGrid,
    ShieldCheck,
    Users,
} from 'lucide-react';
import AppLogo from '@/components/app-logo';
import { NavMain } from '@/components/nav-main';
import { NavUser } from '@/components/nav-user';
import {
    Sidebar,
    SidebarContent,
    SidebarFooter,
    SidebarHeader,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
} from '@/components/ui/sidebar';
import { dashboard } from '@/routes';
import { dashboard as adminDashboard } from '@/routes/admin';
import { index as adminEventsIndex } from '@/routes/admin/events';
import { index as adminUsersIndex } from '@/routes/admin/users';
import { index as eventsIndex } from '@/routes/events';
import { index as giftsIndex } from '@/routes/gifts';
import { index as guestsIndex } from '@/routes/guests';
import type { NavItem } from '@/types';

export function AppSidebar() {
    const page = usePage();
    const { auth } = page.props;
    const selectedEvent = new URL(
        page.url,
        'https://celebra.local',
    ).searchParams.get('event');
    const contextOptions =
        selectedEvent === null
            ? undefined
            : { query: { event: selectedEvent } };
    const mainNavItems: NavItem[] = [
        {
            title: 'Visão geral',
            href: dashboard(),
            icon: LayoutGrid,
        },
    ];

    if (auth.user.role === 'organizer') {
        mainNavItems.push({
            title: 'Eventos',
            href: eventsIndex(),
            icon: CalendarDays,
        });
        mainNavItems.push({
            title: 'Presentes',
            href: giftsIndex(contextOptions),
            icon: Gift,
        });
        mainNavItems.push({
            title: 'Convidados',
            href: guestsIndex(contextOptions),
            icon: Users,
        });
    }

    if (auth.user.role === 'administrator') {
        mainNavItems.push({
            title: 'Administração',
            href: adminDashboard(),
            icon: ShieldCheck,
        });
        mainNavItems.push({
            title: 'Organizadores',
            href: adminUsersIndex(),
            icon: Users,
        });
        mainNavItems.push({
            title: 'Eventos da plataforma',
            href: adminEventsIndex(),
            icon: CalendarDays,
        });
    }

    return (
        <Sidebar collapsible="icon" variant="inset">
            <SidebarHeader>
                <SidebarMenu>
                    <SidebarMenuItem>
                        <SidebarMenuButton size="lg" asChild>
                            <Link href={dashboard()} prefetch>
                                <AppLogo />
                            </Link>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                </SidebarMenu>
            </SidebarHeader>

            <SidebarContent>
                <NavMain items={mainNavItems} />
            </SidebarContent>

            <SidebarFooter>
                <NavUser />
            </SidebarFooter>
        </Sidebar>
    );
}
