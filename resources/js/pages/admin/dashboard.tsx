import { Head } from '@inertiajs/react';
import { CalendarCheck, CalendarDays, ShieldAlert, Users } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { dashboard } from '@/routes/admin';

type Metrics = {
    organizers: number;
    events: number;
    publishedEvents: number;
    suspendedUsers: number;
};

export default function AdminDashboard({ metrics }: { metrics: Metrics }) {
    const cards = [
        { label: 'Organizadores', value: metrics.organizers, icon: Users },
        { label: 'Eventos', value: metrics.events, icon: CalendarDays },
        {
            label: 'Eventos publicados',
            value: metrics.publishedEvents,
            icon: CalendarCheck,
        },
        {
            label: 'Contas suspensas',
            value: metrics.suspendedUsers,
            icon: ShieldAlert,
        },
    ];

    return (
        <>
            <Head title="Administração" />

            <div className="flex flex-1 flex-col gap-6 p-4 md:p-6">
                <div className="flex flex-col gap-1">
                    <h1 className="text-2xl font-semibold tracking-tight">
                        Administração
                    </h1>
                    <p className="text-muted-foreground text-sm">
                        Indicadores globais sem acesso por impersonação.
                    </p>
                </div>

                <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                    {cards.map((card) => (
                        <Card key={card.label}>
                            <CardHeader className="flex-row items-center justify-between gap-3">
                                <CardTitle className="text-sm font-medium">
                                    {card.label}
                                </CardTitle>
                                <card.icon className="text-muted-foreground size-4" />
                            </CardHeader>
                            <CardContent>
                                <p className="text-3xl font-semibold tabular-nums">
                                    {card.value}
                                </p>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            </div>
        </>
    );
}

AdminDashboard.layout = {
    breadcrumbs: [{ title: 'Administração', href: dashboard() }],
};
