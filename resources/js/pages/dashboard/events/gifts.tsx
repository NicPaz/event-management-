import { useEffect, useRef, useState, type FormEvent } from 'react';
import { Form, Head, Link, router, useForm } from '@inertiajs/react';
import { ImageIcon, Plus } from 'lucide-react';
import GiftController from '@/actions/App/Http/Controllers/GiftController';
import InputError from '@/components/input-error';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '@/components/ui/dialog';
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
                        <div className="flex justify-end">
                            <AddGiftDialog event={event} />
                        </div>

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

type GiftFormData = {
    name: string;
    quantity_total: string;
    purchase_url: string;
    description: string;
    image: File | null;
};

function AddGiftDialog({ event }: { event: EventOption }) {
    const [open, setOpen] = useState(false);
    const [discardOpen, setDiscardOpen] = useState(false);
    const [imageInputKey, setImageInputKey] = useState(0);
    const submitting = useRef(false);
    const form = useForm<GiftFormData>({
        name: '',
        quantity_total: '1',
        purchase_url: '',
        description: '',
        image: null,
    });
    const [imagePreview, setImagePreview] = useState<string | null>(null);

    useEffect(() => {
        if (!form.data.image) {
            setImagePreview(null);

            return;
        }

        const objectUrl = URL.createObjectURL(form.data.image);
        setImagePreview(objectUrl);

        return () => URL.revokeObjectURL(objectUrl);
    }, [form.data.image]);

    const resetForm = () => {
        form.resetAndClearErrors();
        setImageInputKey((key) => key + 1);
    };

    const openCleanForm = () => {
        resetForm();
        setOpen(true);
    };

    const requestClose = () => {
        if (form.processing) {
            return;
        }

        if (form.isDirty) {
            setDiscardOpen(true);

            return;
        }

        setOpen(false);
    };

    const submit = (submitEvent: FormEvent<HTMLFormElement>) => {
        submitEvent.preventDefault();

        if (submitting.current || form.processing) {
            return;
        }

        submitting.current = true;
        form.post(GiftController.store(event.id).url, {
            forceFormData: true,
            preserveScroll: true,
            onSuccess: () => {
                setOpen(false);
                resetForm();
            },
            onFinish: () => {
                submitting.current = false;
            },
        });
    };

    return (
        <>
            <Dialog
                open={open}
                onOpenChange={(nextOpen) => {
                    if (nextOpen) {
                        openCleanForm();
                    } else {
                        requestClose();
                    }
                }}
            >
                <DialogTrigger asChild>
                    <Button type="button">
                        <Plus /> Adicionar presente
                    </Button>
                </DialogTrigger>
                <DialogContent className="max-h-[calc(100dvh-2rem)] overflow-y-auto sm:max-w-2xl">
                    <DialogHeader>
                        <DialogTitle>Adicionar presente</DialogTitle>
                        <DialogDescription>
                            O presente será adicionado ao evento{' '}
                            <strong>{event.title}</strong>.
                        </DialogDescription>
                    </DialogHeader>
                    <form onSubmit={submit} className="grid gap-5">
                        <div className="grid gap-4 sm:grid-cols-2">
                            <div className="grid gap-2">
                                <Label htmlFor="new-gift-name">Nome</Label>
                                <Input
                                    id="new-gift-name"
                                    value={form.data.name}
                                    onChange={(inputEvent) =>
                                        form.setData(
                                            'name',
                                            inputEvent.target.value,
                                        )
                                    }
                                    maxLength={120}
                                    required
                                    autoFocus
                                />
                                <InputError message={form.errors.name} />
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="new-gift-quantity">
                                    Quantidade
                                </Label>
                                <Input
                                    id="new-gift-quantity"
                                    type="number"
                                    min={1}
                                    max={100000}
                                    value={form.data.quantity_total}
                                    onChange={(inputEvent) =>
                                        form.setData(
                                            'quantity_total',
                                            inputEvent.target.value,
                                        )
                                    }
                                    required
                                />
                                <InputError
                                    message={form.errors.quantity_total}
                                />
                            </div>
                            <div className="grid gap-2 sm:col-span-2">
                                <Label htmlFor="new-gift-url">
                                    Link de compra (opcional)
                                </Label>
                                <Input
                                    id="new-gift-url"
                                    type="url"
                                    value={form.data.purchase_url}
                                    onChange={(inputEvent) =>
                                        form.setData(
                                            'purchase_url',
                                            inputEvent.target.value,
                                        )
                                    }
                                />
                                <InputError
                                    message={form.errors.purchase_url}
                                />
                            </div>
                            <div className="grid gap-2 sm:col-span-2">
                                <Label htmlFor="new-gift-image">
                                    Foto (opcional)
                                </Label>
                                <Input
                                    key={imageInputKey}
                                    id="new-gift-image"
                                    type="file"
                                    accept="image/jpeg,image/png,image/webp"
                                    onChange={(inputEvent) =>
                                        form.setData(
                                            'image',
                                            inputEvent.target.files?.[0] ??
                                                null,
                                        )
                                    }
                                />
                                <InputError message={form.errors.image} />
                                {imagePreview ? (
                                    <img
                                        src={imagePreview}
                                        alt="Prévia da foto do presente"
                                        className="h-44 w-full rounded-lg border object-cover"
                                    />
                                ) : (
                                    <div className="bg-muted text-muted-foreground flex h-28 items-center justify-center rounded-lg border border-dashed">
                                        <ImageIcon className="size-7" />
                                    </div>
                                )}
                            </div>
                            <div className="grid gap-2 sm:col-span-2">
                                <Label htmlFor="new-gift-description">
                                    Descrição
                                </Label>
                                <textarea
                                    id="new-gift-description"
                                    rows={4}
                                    value={form.data.description}
                                    onChange={(inputEvent) =>
                                        form.setData(
                                            'description',
                                            inputEvent.target.value,
                                        )
                                    }
                                    maxLength={5000}
                                    className="border-input focus-visible:border-ring focus-visible:ring-ring/50 min-h-24 rounded-md border bg-transparent p-3 text-sm outline-none focus-visible:ring-3"
                                />
                                <InputError message={form.errors.description} />
                            </div>
                        </div>
                        <DialogFooter>
                            <Button
                                type="button"
                                variant="outline"
                                disabled={form.processing}
                                onClick={requestClose}
                            >
                                Cancelar
                            </Button>
                            <Button type="submit" disabled={form.processing}>
                                {form.processing
                                    ? 'Salvando...'
                                    : 'Salvar presente'}
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>

            <Dialog open={discardOpen} onOpenChange={setDiscardOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Descartar alterações?</DialogTitle>
                        <DialogDescription>
                            Os dados preenchidos para este presente serão
                            perdidos.
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter>
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => setDiscardOpen(false)}
                        >
                            Continuar editando
                        </Button>
                        <Button
                            type="button"
                            variant="destructive"
                            onClick={() => {
                                setDiscardOpen(false);
                                setOpen(false);
                                resetForm();
                            }}
                        >
                            Descartar
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
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
