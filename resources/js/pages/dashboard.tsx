import { Head, Link, usePage } from '@inertiajs/react';
import {
    ArrowRight,
    CalendarDays,
    Gift,
    ShieldCheck,
    Users,
} from 'lucide-react';
import { CelebrationMarks } from '@/components/celebre/celebration-marks';
import { PageHeader } from '@/components/celebre/page-header';
import { CelebreLogo } from '@/components/celebre-logo';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { dashboard } from '@/routes';
import { dashboard as adminDashboard } from '@/routes/admin';
import { create, index as eventsIndex } from '@/routes/events';
import { index as giftsIndex } from '@/routes/gifts';
import { index as guestsIndex } from '@/routes/guests';

export default function Dashboard() {
    const { auth } = usePage().props;
    const isAdministrator = auth.user.role === 'administrator';
    const shortcuts = isAdministrator
        ? [
              {
                  title: 'Administração',
                  description: 'Acompanhe os indicadores da plataforma.',
                  href: adminDashboard(),
                  icon: ShieldCheck,
              },
          ]
        : [
              {
                  title: 'Eventos',
                  description: 'Crie, publique e personalize seus convites.',
                  href: eventsIndex(),
                  icon: CalendarDays,
              },
              {
                  title: 'Presentes',
                  description: 'Organize sugestões e acompanhe reservas.',
                  href: giftsIndex(),
                  icon: Gift,
              },
              {
                  title: 'Convidados',
                  description: 'Consulte confirmações e acompanhantes.',
                  href: guestsIndex(),
                  icon: Users,
              },
          ];

    return (
        <>
            <Head title="Visão geral" />
            <div className="flex flex-1 flex-col gap-8 p-4 md:p-6 lg:p-8">
                <PageHeader
                    eyebrow="Visão geral"
                    title={'Olá, ' + auth.user.name.split(' ')[0]}
                    description={
                        isAdministrator
                            ? 'Acompanhe a operação do Celebre em um só lugar.'
                            : 'Seu espaço para transformar cada detalhe em uma celebração especial.'
                    }
                    actions={
                        !isAdministrator && (
                            <Button asChild>
                                <Link href={create()}>
                                    Criar evento <ArrowRight />
                                </Link>
                            </Button>
                        )
                    }
                />

                <section className="bg-primary relative isolate overflow-hidden rounded-2xl px-6 py-8 text-white shadow-[0_18px_50px_rgba(89,56,184,0.2)] sm:px-8">
                    <div className="bg-brand-orange absolute -right-16 -bottom-20 -z-10 size-56 rounded-full opacity-25" />
                    <CelebrationMarks className="absolute top-5 right-7 brightness-125" />
                    <div className="max-w-2xl">
                        <CelebreLogo variant="light" className="h-auto w-36" />
                        <h2 className="mt-6 font-serif text-3xl sm:text-4xl">
                            Cada momento merece ser lembrado.
                        </h2>
                        <p className="mt-3 max-w-xl text-sm leading-6 text-white/80 sm:text-base">
                            Mantenha convites, presentes e confirmações
                            organizados para aproveitar a festa junto com seus
                            convidados.
                        </p>
                    </div>
                </section>

                <section aria-labelledby="quick-access-title">
                    <h2
                        id="quick-access-title"
                        className="mb-4 font-serif text-2xl"
                    >
                        Acessos rápidos
                    </h2>
                    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                        {shortcuts.map((shortcut) => (
                            <Link key={shortcut.title} href={shortcut.href}>
                                <Card className="border-primary/10 hover:border-primary/30 h-full transition-[border-color,transform,box-shadow] hover:-translate-y-0.5 hover:shadow-[0_16px_40px_rgba(59,39,82,0.1)]">
                                    <CardContent className="flex items-start gap-4">
                                        <div className="bg-brand-soft text-primary flex size-12 shrink-0 items-center justify-center rounded-2xl">
                                            <shortcut.icon className="size-6" />
                                        </div>
                                        <div>
                                            <h3 className="font-serif text-xl">
                                                {shortcut.title}
                                            </h3>
                                            <p className="text-muted-foreground mt-1 text-sm leading-6">
                                                {shortcut.description}
                                            </p>
                                        </div>
                                    </CardContent>
                                </Card>
                            </Link>
                        ))}
                    </div>
                </section>
            </div>
        </>
    );
}

Dashboard.layout = {
    breadcrumbs: [
        {
            title: 'Visão geral',
            href: dashboard(),
        },
    ],
};
