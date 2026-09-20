import { Form, Head, Link, router } from '@inertiajs/react';
import GiftController from '@/actions/App/Http/Controllers/GiftController';
import InputError from '@/components/input-error';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { create, edit, index } from '@/routes/events';
import { index as giftsIndex } from '@/routes/gifts';
import { index as guestsIndex } from '@/routes/guests';

type GiftItem = {
    id: number;
    name: string;
    description: string | null;
    purchaseUrl: string | null;
    imageUrl: string | null;
    quantityTotal: number;
    quantityReserved: number;
    quantityAvailable: number;
    archived: boolean;
    reservations?: { guestName: string; quantity: number }[];
};

type EventOption = { id: number; title: string };

export default function Gifts({
    event,
    events = [],
    gifts,
    standalone = false,
}: {
    event: EventOption | null;
    events?: EventOption[];
    gifts: GiftItem[];
    standalone?: boolean;
}) {
    return (
        <>
            <Head title={event ? `Presentes — ${event.title}` : 'Presentes'} />
            <div className="flex flex-1 flex-col gap-6 p-4 md:p-6">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                        <h1 className="text-2xl font-semibold">Presentes</h1>
                        <p className="text-muted-foreground text-sm">
                            {event?.title ??
                                'Selecione um evento para gerenciar sua lista.'}
                        </p>
                    </div>
                    {event && (
                        <div className="flex flex-wrap gap-2">
                            {standalone && (
                                <Button asChild variant="outline">
                                    <Link
                                        href={guestsIndex({
                                            query: { event: event.id },
                                        })}
                                    >
                                        Ver convidados
                                    </Link>
                                </Button>
                            )}
                            <Button asChild variant="outline">
                                <Link href={edit(event.id)}>Abrir evento</Link>
                            </Button>
                        </div>
                    )}
                </div>

                {standalone && events.length > 0 && (
                    <Card>
                        <CardContent className="grid gap-2 pt-6">
                            <Label htmlFor="selected-event">
                                Evento selecionado
                            </Label>
                            <select
                                id="selected-event"
                                value={event?.id ?? ''}
                                onChange={(inputEvent) => {
                                    const value = inputEvent.target.value;
                                    router.get(
                                        giftsIndex({
                                            query: value
                                                ? { event: Number(value) }
                                                : {},
                                        }).url,
                                    );
                                }}
                                className="border-input h-11 rounded-md border bg-transparent px-3 font-medium"
                            >
                                {events.length > 1 && (
                                    <option value="">
                                        Selecione um evento
                                    </option>
                                )}
                                {events.map((option) => (
                                    <option key={option.id} value={option.id}>
                                        {option.title}
                                    </option>
                                ))}
                            </select>
                        </CardContent>
                    </Card>
                )}

                {standalone && events.length === 0 && (
                    <div className="grid justify-items-center gap-4 rounded-xl border border-dashed p-10 text-center">
                        <p className="text-muted-foreground">
                            Você ainda não possui eventos.
                        </p>
                        <Button asChild>
                            <Link href={create()}>
                                Criar meu primeiro evento
                            </Link>
                        </Button>
                    </div>
                )}

                {standalone && events.length > 1 && event === null && (
                    <p className="text-muted-foreground rounded-xl border border-dashed p-10 text-center">
                        Selecione um evento acima. Nenhum presente pode ser
                        cadastrado sem um evento definido.
                    </p>
                )}

                {event && (
                    <>
                        <Card>
                            <CardHeader>
                                <CardTitle>Adicionar presente</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <Form
                                    action={GiftController.store(event.id)}
                                    options={{ preserveScroll: true }}
                                    resetOnSuccess
                                >
                                    {({ errors, processing }) => (
                                        <div className="grid gap-4 sm:grid-cols-2">
                                            <Field
                                                label="Nome"
                                                name="name"
                                                error={errors.name}
                                                required
                                            />
                                            <Field
                                                label="Quantidade"
                                                name="quantity_total"
                                                error={errors.quantity_total}
                                                type="number"
                                                min={1}
                                                required
                                            />
                                            <Field
                                                label="Link de compra (opcional)"
                                                name="purchase_url"
                                                error={errors.purchase_url}
                                                type="url"
                                            />
                                            <div className="grid gap-2">
                                                <Label htmlFor="image">
                                                    Imagem (opcional)
                                                </Label>
                                                <Input
                                                    id="image"
                                                    name="image"
                                                    type="file"
                                                    accept="image/jpeg,image/png,image/webp"
                                                />
                                                <InputError
                                                    message={errors.image}
                                                />
                                            </div>
                                            <div className="grid gap-2 sm:col-span-2">
                                                <Label htmlFor="description">
                                                    Descrição
                                                </Label>
                                                <textarea
                                                    id="description"
                                                    name="description"
                                                    rows={3}
                                                    className="rounded-md border bg-transparent p-3 text-sm"
                                                />
                                                <InputError
                                                    message={errors.description}
                                                />
                                            </div>
                                            <Button
                                                disabled={processing}
                                                className="justify-self-start"
                                            >
                                                Adicionar
                                            </Button>
                                        </div>
                                    )}
                                </Form>
                            </CardContent>
                        </Card>

                        <div className="grid gap-4 lg:grid-cols-2">
                            {gifts.map((gift) => (
                                <Card
                                    key={gift.id}
                                    className={
                                        gift.archived ? 'opacity-60' : ''
                                    }
                                >
                                    <CardContent className="grid gap-4 pt-6">
                                        <div className="flex gap-4">
                                            {gift.imageUrl && (
                                                <img
                                                    src={gift.imageUrl}
                                                    alt=""
                                                    className="size-20 rounded-lg object-cover"
                                                />
                                            )}
                                            <div>
                                                <h2 className="font-semibold">
                                                    {gift.name}
                                                </h2>
                                                <p className="text-muted-foreground text-sm">
                                                    {gift.quantityReserved}{' '}
                                                    reservadas ·{' '}
                                                    {gift.quantityAvailable}{' '}
                                                    disponíveis
                                                </p>
                                                {gift.archived && (
                                                    <p className="text-sm font-medium">
                                                        Arquivado
                                                    </p>
                                                )}
                                            </div>
                                        </div>

                                        {gift.reservations && (
                                            <div>
                                                <p className="mb-2 text-sm font-medium">
                                                    Quem reservou
                                                </p>
                                                <div className="flex flex-wrap gap-2">
                                                    {gift.reservations.map(
                                                        (reservation) => (
                                                            <Badge
                                                                key={`${reservation.guestName}-${reservation.quantity}`}
                                                                variant="secondary"
                                                            >
                                                                {
                                                                    reservation.guestName
                                                                }{' '}
                                                                ×{' '}
                                                                {
                                                                    reservation.quantity
                                                                }
                                                            </Badge>
                                                        ),
                                                    )}
                                                    {gift.reservations
                                                        .length === 0 && (
                                                        <span className="text-muted-foreground text-sm">
                                                            Nenhuma reserva
                                                            ativa.
                                                        </span>
                                                    )}
                                                </div>
                                            </div>
                                        )}

                                        {!gift.archived && (
                                            <Form
                                                action={GiftController.update({
                                                    event: event.id,
                                                    gift: gift.id,
                                                })}
                                                options={{
                                                    preserveScroll: true,
                                                }}
                                            >
                                                {({ errors, processing }) => (
                                                    <div className="grid gap-3 sm:grid-cols-2">
                                                        <Field
                                                            label="Nome"
                                                            name="name"
                                                            defaultValue={
                                                                gift.name
                                                            }
                                                            error={errors.name}
                                                            required
                                                        />
                                                        <Field
                                                            label="Quantidade total"
                                                            name="quantity_total"
                                                            defaultValue={
                                                                gift.quantityTotal
                                                            }
                                                            error={
                                                                errors.quantity_total
                                                            }
                                                            type="number"
                                                            min={1}
                                                            required
                                                        />
                                                        <Field
                                                            label="Link de compra"
                                                            name="purchase_url"
                                                            defaultValue={
                                                                gift.purchaseUrl ??
                                                                ''
                                                            }
                                                            error={
                                                                errors.purchase_url
                                                            }
                                                            type="url"
                                                        />
                                                        <div className="grid gap-2">
                                                            <Label>
                                                                Nova imagem
                                                            </Label>
                                                            <Input
                                                                name="image"
                                                                type="file"
                                                                accept="image/jpeg,image/png,image/webp"
                                                            />
                                                        </div>
                                                        <div className="grid gap-2 sm:col-span-2">
                                                            <Label>
                                                                Descrição
                                                            </Label>
                                                            <textarea
                                                                name="description"
                                                                defaultValue={
                                                                    gift.description ??
                                                                    ''
                                                                }
                                                                rows={3}
                                                                className="rounded-md border bg-transparent p-3 text-sm"
                                                            />
                                                        </div>
                                                        <Button
                                                            disabled={
                                                                processing
                                                            }
                                                            className="justify-self-start"
                                                        >
                                                            Salvar
                                                        </Button>
                                                    </div>
                                                )}
                                            </Form>
                                        )}
                                        {!gift.archived && (
                                            <Form
                                                action={GiftController.destroy({
                                                    event: event.id,
                                                    gift: gift.id,
                                                })}
                                            >
                                                <Button variant="outline">
                                                    Arquivar
                                                </Button>
                                            </Form>
                                        )}
                                    </CardContent>
                                </Card>
                            ))}
                            {gifts.length === 0 && (
                                <p className="text-muted-foreground rounded-lg border border-dashed p-8 text-center text-sm lg:col-span-2">
                                    Nenhum presente cadastrado.
                                </p>
                            )}
                        </div>
                    </>
                )}
            </div>
        </>
    );
}

function Field({
    label,
    name,
    error,
    ...props
}: React.ComponentProps<typeof Input> & {
    label: string;
    name: string;
    error?: string;
}) {
    return (
        <div className="grid gap-2">
            <Label htmlFor={name}>{label}</Label>
            <Input id={name} name={name} {...props} />
            <InputError message={error} />
        </div>
    );
}

Gifts.layout = { breadcrumbs: [{ title: 'Eventos', href: index() }] };
