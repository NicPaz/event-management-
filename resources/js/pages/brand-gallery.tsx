import { useState } from 'react';
import { Head } from '@inertiajs/react';
import { CalendarDays, Gift, Sparkles } from 'lucide-react';
import { CelebreLogo } from '@/components/celebre-logo';
import { EmptyState } from '@/components/celebre/empty-state';
import { PageHeader } from '@/components/celebre/page-header';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Skeleton } from '@/components/ui/skeleton';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import { gallery } from '@/routes/brand';

const colors = [
    ['Violeta', '#5938B8'],
    ['Laranja', '#F47B45'],
    ['Amarelo', '#F2C94C'],
    ['Lavanda', '#EDE7FA'],
    ['Marfim', '#FFF9F0'],
    ['Texto', '#292334'],
] as const;

export default function BrandGallery() {
    const [modalOpen, setModalOpen] = useState(false);

    return (
        <>
            <Head title="Galeria de componentes" />
            <div className="flex flex-1 flex-col gap-8 p-4 md:p-6">
                <PageHeader
                    eyebrow="Referência interna"
                    title="Galeria Celebre"
                    description="Tokens e componentes reais utilizados na interface da plataforma."
                />

                <section className="grid gap-4 lg:grid-cols-[1fr_1.4fr]">
                    <Card>
                        <CardHeader>
                            <CardTitle>Marca e tipografia</CardTitle>
                            <CardDescription>
                                Aplicações principal, clara e compacta.
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="grid gap-6">
                            <CelebreLogo className="h-auto w-44" />
                            <div className="bg-primary w-fit rounded-xl p-4">
                                <CelebreLogo
                                    variant="light"
                                    className="h-auto w-40"
                                />
                            </div>
                            <div className="flex items-center gap-4">
                                <CelebreLogo
                                    variant="symbol"
                                    className="size-12"
                                />
                                <div>
                                    <p className="font-serif text-2xl">
                                        DM Serif Display
                                    </p>
                                    <p className="text-muted-foreground text-sm">
                                        DM Sans para textos e controles
                                    </p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle>Paleta</CardTitle>
                            <CardDescription>
                                Cores centralizadas nos tokens da aplicação.
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                            {colors.map(([name, color]) => (
                                <div
                                    key={name}
                                    className="overflow-hidden rounded-xl border"
                                >
                                    <div
                                        className="h-20"
                                        style={{ backgroundColor: color }}
                                    />
                                    <div className="bg-card p-3 text-sm">
                                        <p className="font-semibold">{name}</p>
                                        <p className="text-muted-foreground font-mono text-xs">
                                            {color}
                                        </p>
                                    </div>
                                </div>
                            ))}
                        </CardContent>
                    </Card>
                </section>

                <section className="grid gap-4 lg:grid-cols-2">
                    <Card>
                        <CardHeader>
                            <CardTitle>Botões e estados</CardTitle>
                        </CardHeader>
                        <CardContent className="flex flex-wrap gap-3">
                            <Button>Primário</Button>
                            <Button variant="outline">Secundário</Button>
                            <Button variant="ghost">Discreto</Button>
                            <Button variant="destructive">Destrutivo</Button>
                            <Button disabled>Desabilitado</Button>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle>Badges e seletores</CardTitle>
                        </CardHeader>
                        <CardContent className="grid gap-5">
                            <div className="flex flex-wrap gap-2">
                                <Badge>Publicado</Badge>
                                <Badge variant="secondary">Rascunho</Badge>
                                <Badge variant="success">Confirmado</Badge>
                                <Badge variant="warning">Pendente</Badge>
                                <Badge variant="destructive">Suspenso</Badge>
                            </div>
                            <div className="flex flex-wrap gap-6">
                                <Label className="flex items-center gap-2">
                                    <Checkbox defaultChecked /> Lista pública
                                </Label>
                                <Label className="flex items-center gap-2">
                                    <Switch defaultChecked /> Evento ativo
                                </Label>
                            </div>
                        </CardContent>
                    </Card>
                </section>

                <Card>
                    <CardHeader>
                        <CardTitle>Campos e validação</CardTitle>
                    </CardHeader>
                    <CardContent className="grid gap-5 md:grid-cols-2">
                        <div className="grid gap-2">
                            <Label htmlFor="gallery-name">Nome do evento</Label>
                            <Input
                                id="gallery-name"
                                placeholder="Uma celebração especial"
                            />
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="gallery-error">
                                Campo com erro
                            </Label>
                            <Input
                                id="gallery-error"
                                aria-invalid
                                defaultValue="Valor inválido"
                            />
                            <p className="text-destructive text-sm">
                                Revise esta informação.
                            </p>
                        </div>
                        <div className="grid gap-2 md:col-span-2">
                            <Label htmlFor="gallery-message">Mensagem</Label>
                            <Textarea
                                id="gallery-message"
                                placeholder="Escreva uma mensagem de boas-vindas"
                            />
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex-row items-center justify-between">
                        <div>
                            <CardTitle>Lista de convidados</CardTitle>
                            <CardDescription>
                                Exemplo compacto para dados operacionais.
                            </CardDescription>
                        </div>
                        <Badge variant="success">2 confirmados</Badge>
                    </CardHeader>
                    <CardContent className="overflow-hidden rounded-xl border p-0">
                        <table className="w-full text-left text-sm">
                            <thead className="bg-muted/60">
                                <tr>
                                    <th className="px-4 py-3 font-semibold">
                                        Nome
                                    </th>
                                    <th className="hidden px-4 py-3 font-semibold sm:table-cell">
                                        Telefone
                                    </th>
                                    <th className="px-4 py-3 font-semibold">
                                        Status
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="divide-y">
                                <tr>
                                    <td className="px-4 py-3 font-medium">
                                        Ana Martins
                                    </td>
                                    <td className="text-muted-foreground hidden px-4 py-3 sm:table-cell">
                                        (11) 99999-0000
                                    </td>
                                    <td className="px-4 py-3">
                                        <Badge variant="success">
                                            Confirmada
                                        </Badge>
                                    </td>
                                </tr>
                                <tr>
                                    <td className="px-4 py-3 font-medium">
                                        João Costa
                                    </td>
                                    <td className="text-muted-foreground hidden px-4 py-3 sm:table-cell">
                                        (21) 98888-0000
                                    </td>
                                    <td className="px-4 py-3">
                                        <Badge variant="warning">
                                            Sem resposta
                                        </Badge>
                                    </td>
                                </tr>
                            </tbody>
                        </table>
                    </CardContent>
                </Card>

                <section className="grid gap-4 lg:grid-cols-2">
                    <EmptyState
                        icon={CalendarDays}
                        title="Nenhum evento por aqui"
                        description="Estados vazios orientam a próxima ação sem competir com os dados."
                        action={<Button>Criar evento</Button>}
                    />
                    <Card>
                        <CardHeader>
                            <CardTitle>Carregamento e modal</CardTitle>
                        </CardHeader>
                        <CardContent className="grid gap-5">
                            <div className="grid gap-2">
                                <Skeleton className="h-5 w-2/3" />
                                <Skeleton className="h-4 w-full" />
                                <Skeleton className="h-4 w-4/5" />
                            </div>
                            <Dialog
                                open={modalOpen}
                                onOpenChange={setModalOpen}
                            >
                                <DialogTrigger asChild>
                                    <Button className="justify-self-start">
                                        <Gift /> Abrir modal
                                    </Button>
                                </DialogTrigger>
                                <DialogContent>
                                    <DialogHeader>
                                        <DialogTitle>
                                            Adicionar presente
                                        </DialogTitle>
                                        <DialogDescription>
                                            Modal real com foco, teclado e
                                            retorno ao acionador.
                                        </DialogDescription>
                                    </DialogHeader>
                                    <div className="grid gap-2">
                                        <Label htmlFor="gallery-gift">
                                            Nome do presente
                                        </Label>
                                        <Input id="gallery-gift" autoFocus />
                                    </div>
                                    <DialogFooter>
                                        <Button
                                            variant="outline"
                                            onClick={() => setModalOpen(false)}
                                        >
                                            Cancelar
                                        </Button>
                                        <Button
                                            onClick={() => setModalOpen(false)}
                                        >
                                            <Sparkles /> Salvar presente
                                        </Button>
                                    </DialogFooter>
                                </DialogContent>
                            </Dialog>
                        </CardContent>
                    </Card>
                </section>
            </div>
        </>
    );
}

BrandGallery.layout = {
    breadcrumbs: [{ title: 'Galeria Celebre', href: gallery() }],
};
