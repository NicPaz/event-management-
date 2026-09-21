import { Head, Link, usePage } from '@inertiajs/react';
import {
    ArrowRight,
    CalendarHeart,
    CheckCircle2,
    Gift,
    Sparkles,
    Users,
} from 'lucide-react';
import { CelebrationMarks } from '@/components/celebre/celebration-marks';
import { CelebreLogo } from '@/components/celebre-logo';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { dashboard, home, login, register } from '@/routes';

const benefits = [
    {
        icon: CalendarHeart,
        title: 'Seu convite, do seu jeito',
        description:
            'Escolha um tema, personalize cada detalhe e compartilhe uma página que combina com a celebração.',
    },
    {
        icon: Gift,
        title: 'Presentes sem confusão',
        description:
            'Organize sugestões, acompanhe reservas e deixe cada convidado escolher com tranquilidade.',
    },
    {
        icon: Users,
        title: 'Presenças organizadas',
        description:
            'Centralize confirmações, acompanhantes e informações importantes em um só lugar.',
    },
];

export default function Welcome() {
    const { auth } = usePage().props;

    return (
        <>
            <Head title="Celebre momentos especiais" />
            <div className="bg-background min-h-screen overflow-hidden">
                <header className="border-primary/10 bg-card/90 relative z-20 border-b backdrop-blur">
                    <div className="mx-auto flex h-20 max-w-7xl items-center justify-between gap-4 px-5 sm:px-8">
                        <Link
                            href={home()}
                            className="celebre-focus rounded-lg"
                        >
                            <CelebreLogo className="h-auto w-36 sm:w-40" />
                        </Link>
                        <nav
                            aria-label="Navegação principal"
                            className="flex items-center gap-2"
                        >
                            {auth.user ? (
                                <Button asChild>
                                    <Link href={dashboard()}>
                                        Ir para o painel <ArrowRight />
                                    </Link>
                                </Button>
                            ) : (
                                <>
                                    <Button asChild variant="ghost">
                                        <Link href={login()}>Entrar</Link>
                                    </Button>
                                    <Button asChild>
                                        <Link href={register()}>
                                            Criar conta
                                        </Link>
                                    </Button>
                                </>
                            )}
                        </nav>
                    </div>
                </header>

                <main>
                    <section className="relative isolate px-5 py-16 sm:px-8 sm:py-24 lg:py-28">
                        <div className="bg-brand-orange/10 absolute -top-32 -left-32 -z-10 size-96 rounded-full" />
                        <div className="bg-brand-soft absolute -right-36 bottom-0 -z-10 size-96 rounded-full" />
                        <CelebrationMarks className="absolute top-10 right-[12%] hidden md:block" />

                        <div className="mx-auto grid max-w-7xl items-center gap-14 lg:grid-cols-[1.05fr_0.95fr]">
                            <div className="max-w-2xl">
                                <div className="text-primary border-primary/15 bg-card mb-5 inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-sm font-semibold shadow-sm">
                                    <Sparkles className="text-brand-orange size-4" />
                                    Convites e organização em um só lugar
                                </div>
                                <h1 className="font-serif text-5xl leading-[1.04] text-balance sm:text-6xl lg:text-7xl">
                                    Celebre o momento. A gente ajuda a
                                    organizar.
                                </h1>
                                <p className="text-muted-foreground mt-6 max-w-xl text-lg leading-8">
                                    Crie uma página especial, organize presentes
                                    e acompanhe as confirmações para aproveitar
                                    o que realmente importa.
                                </p>
                                <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                                    <Button asChild size="lg">
                                        <Link
                                            href={
                                                auth.user
                                                    ? dashboard()
                                                    : register()
                                            }
                                        >
                                            {auth.user
                                                ? 'Abrir meu painel'
                                                : 'Criar meu evento'}
                                            <ArrowRight />
                                        </Link>
                                    </Button>
                                    {!auth.user && (
                                        <Button
                                            asChild
                                            size="lg"
                                            variant="outline"
                                        >
                                            <Link href={login()}>
                                                Já tenho uma conta
                                            </Link>
                                        </Button>
                                    )}
                                </div>
                            </div>

                            <Card className="border-primary/15 relative overflow-hidden p-1 sm:p-3">
                                <CelebrationMarks className="absolute top-5 right-5" />
                                <CardContent className="grid gap-6 p-6 sm:p-8">
                                    <div className="flex items-center gap-4">
                                        <div className="bg-brand-soft flex size-14 items-center justify-center rounded-2xl">
                                            <CelebreLogo
                                                variant="symbol"
                                                decorative
                                                className="size-12"
                                            />
                                        </div>
                                        <div>
                                            <p className="text-muted-foreground text-sm">
                                                Tudo pronto para
                                            </p>
                                            <p className="font-serif text-2xl">
                                                Uma celebração inesquecível
                                            </p>
                                        </div>
                                    </div>
                                    <div className="grid gap-3">
                                        {[
                                            'Página personalizada para o evento',
                                            'Lista de presentes integrada',
                                            'Confirmações em tempo real',
                                        ].map((item) => (
                                            <div
                                                key={item}
                                                className="bg-background/70 flex items-center gap-3 rounded-xl border p-4"
                                            >
                                                <CheckCircle2 className="text-brand-success size-5 shrink-0" />
                                                <span className="font-medium">
                                                    {item}
                                                </span>
                                            </div>
                                        ))}
                                    </div>
                                </CardContent>
                            </Card>
                        </div>
                    </section>

                    <section className="bg-card px-5 py-16 sm:px-8 sm:py-20">
                        <div className="mx-auto max-w-7xl">
                            <div className="mx-auto max-w-2xl text-center">
                                <p className="text-primary text-xs font-bold tracking-[0.18em] uppercase">
                                    Simples de usar
                                </p>
                                <h2 className="mt-3 font-serif text-4xl sm:text-5xl">
                                    Tudo conversa, tudo fica organizado
                                </h2>
                            </div>
                            <div className="mt-10 grid gap-5 md:grid-cols-3">
                                {benefits.map((benefit, index) => (
                                    <Card
                                        key={benefit.title}
                                        className="border-primary/10"
                                    >
                                        <CardContent className="grid gap-4">
                                            <div className="flex items-center justify-between">
                                                <div className="bg-brand-soft text-primary flex size-12 items-center justify-center rounded-2xl">
                                                    <benefit.icon className="size-6" />
                                                </div>
                                                <span className="text-brand-orange/70 font-serif text-3xl">
                                                    0{index + 1}
                                                </span>
                                            </div>
                                            <div>
                                                <h3 className="font-serif text-2xl">
                                                    {benefit.title}
                                                </h3>
                                                <p className="text-muted-foreground mt-2 text-sm leading-6">
                                                    {benefit.description}
                                                </p>
                                            </div>
                                        </CardContent>
                                    </Card>
                                ))}
                            </div>
                        </div>
                    </section>
                </main>

                <footer className="border-primary/10 border-t px-5 py-8 sm:px-8">
                    <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-4 sm:flex-row">
                        <CelebreLogo className="h-auto w-28" />
                        <p className="text-muted-foreground text-center text-sm">
                            Celebre seus momentos, do convite à confirmação.
                        </p>
                    </div>
                </footer>
            </div>
        </>
    );
}
