import { useEffect, useRef, useState, type FormEvent } from 'react';
import { Head, Link, router, useForm } from '@inertiajs/react';
import {
    ArrowLeft,
    Gift,
    ImageIcon,
    Pencil,
    Plus,
    ShoppingBag,
    Trash2,
} from 'lucide-react';
import { toast } from 'sonner';
import EventAppearanceController from '@/actions/App/Http/Controllers/EventAppearanceController';
import EventController from '@/actions/App/Http/Controllers/EventController';
import GiftController from '@/actions/App/Http/Controllers/GiftController';
import { EventCreationProgress } from '@/components/event-creation-progress';
import { EmptyState } from '@/components/celebre/empty-state';
import { EventSelector } from '@/components/celebre/event-selector';
import { PageHeader } from '@/components/celebre/page-header';
import InputError from '@/components/input-error';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { create, edit, index } from '@/routes/events';
import { index as giftsIndex } from '@/routes/gifts';
import { index as guestsIndex } from '@/routes/guests';

type GiftItem = {
    id: number;
    name: string;
    description: string | null;
    priceCents: number | null;
    purchaseUrl: string | null;
    imageUrl: string | null;
    quantityTotal: number;
    quantityReserved: number;
    quantityAvailable: number;
    archived: boolean;
    reservations?: { guestName: string; quantity: number }[];
};

type EventOption = { id: number; title: string };

const currencyFormatter = new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
});

export default function Gifts({
    event,
    events = [],
    gifts,
    standalone = false,
    creationFlow = false,
}: {
    event: EventOption | null;
    events?: EventOption[];
    gifts: GiftItem[];
    standalone?: boolean;
    creationFlow?: boolean;
}) {
    const [creatingGift, setCreatingGift] = useState(false);
    const [editingGift, setEditingGift] = useState<GiftItem | null>(null);
    const [deletingGift, setDeletingGift] = useState<GiftItem | null>(null);

    return (
        <>
            <Head title={event ? `Presentes — ${event.title}` : 'Presentes'} />
            <div className="flex flex-1 flex-col gap-6 p-4 md:p-6">
                <PageHeader
                    eyebrow={creationFlow ? 'Criação do evento' : 'Organização'}
                    title="Presentes"
                    description={
                        creationFlow
                            ? 'Esta etapa é opcional. Você poderá adicionar ou alterar presentes depois pelo painel.'
                            : (event?.title ??
                              'Selecione um evento para gerenciar sua lista.')
                    }
                    actions={
                        event &&
                        !creationFlow && (
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
                                    <Link href={edit(event.id)}>
                                        Abrir evento
                                    </Link>
                                </Button>
                            </div>
                        )
                    }
                />

                {creationFlow && <EventCreationProgress currentStep={2} />}

                {standalone && events.length > 0 && (
                    <Card>
                        <CardContent className="grid gap-2 pt-6">
                            <EventSelector
                                events={events}
                                selectedEventId={event?.id ?? null}
                                onChange={(eventId) => {
                                    setCreatingGift(false);
                                    setEditingGift(null);
                                    setDeletingGift(null);
                                    router.get(
                                        giftsIndex({
                                            query: eventId
                                                ? { event: eventId }
                                                : {},
                                        }).url,
                                    );
                                }}
                            />
                        </CardContent>
                    </Card>
                )}

                {standalone && events.length === 0 && (
                    <EmptyState
                        icon={Gift}
                        title="Sua primeira lista começa com um evento"
                        description="Crie um evento para cadastrar presentes e receber reservas."
                        action={
                            <Button asChild>
                                <Link href={create()}>
                                    Criar meu primeiro evento
                                </Link>
                            </Button>
                        }
                    />
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
                            <Button
                                type="button"
                                onClick={() => setCreatingGift(true)}
                            >
                                <Plus /> Adicionar presente
                            </Button>
                        </div>

                        {gifts.length > 0 ? (
                            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4">
                                {gifts.map((gift) => (
                                    <GiftCard
                                        key={gift.id}
                                        gift={gift}
                                        onEdit={() => setEditingGift(gift)}
                                        onDelete={() => setDeletingGift(gift)}
                                    />
                                ))}
                            </div>
                        ) : (
                            <EmptyState
                                icon={Gift}
                                title="Nenhum presente cadastrado"
                                description="Use o botão Adicionar presente para começar sua lista."
                            />
                        )}

                        {creatingGift && (
                            <GiftEditorDialog
                                key="create-gift"
                                event={event}
                                gift={null}
                                onClose={() => setCreatingGift(false)}
                            />
                        )}
                        {editingGift && (
                            <GiftEditorDialog
                                key={`edit-gift-${editingGift.id}`}
                                event={event}
                                gift={editingGift}
                                onClose={() => setEditingGift(null)}
                            />
                        )}
                        {deletingGift && (
                            <DeleteGiftDialog
                                event={event}
                                gift={deletingGift}
                                onClose={() => setDeletingGift(null)}
                            />
                        )}

                        {creationFlow && (
                            <Card>
                                <CardContent className="flex flex-col gap-4 pt-6 sm:flex-row sm:items-center sm:justify-between">
                                    <Button asChild variant="outline">
                                        <Link
                                            href={EventController.edit(
                                                event.id,
                                                {
                                                    query: { creation: 1 },
                                                },
                                            )}
                                        >
                                            <ArrowLeft /> Voltar
                                        </Link>
                                    </Button>
                                    <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
                                        {gifts.length === 0 && (
                                            <Button asChild variant="ghost">
                                                <Link
                                                    href={EventAppearanceController.edit(
                                                        event.id,
                                                        {
                                                            query: {
                                                                creation: 1,
                                                            },
                                                        },
                                                    )}
                                                >
                                                    Pular por enquanto
                                                </Link>
                                            </Button>
                                        )}
                                        <Button asChild>
                                            <Link
                                                href={EventAppearanceController.edit(
                                                    event.id,
                                                    {
                                                        query: { creation: 1 },
                                                    },
                                                )}
                                            >
                                                Continuar
                                            </Link>
                                        </Button>
                                    </div>
                                </CardContent>
                            </Card>
                        )}
                    </>
                )}
            </div>
        </>
    );
}

function GiftCard({
    gift,
    onEdit,
    onDelete,
}: {
    gift: GiftItem;
    onEdit: () => void;
    onDelete: () => void;
}) {
    const soldOut = gift.quantityAvailable === 0;

    return (
        <Card className="group overflow-hidden p-0">
            <div className="bg-muted relative aspect-[4/3] overflow-hidden">
                {gift.imageUrl ? (
                    <img
                        src={gift.imageUrl}
                        alt={`Foto de ${gift.name}`}
                        className="size-full object-cover transition-transform duration-300 group-hover:scale-[1.02] motion-reduce:transition-none motion-reduce:group-hover:scale-100"
                    />
                ) : (
                    <div className="text-muted-foreground flex size-full flex-col items-center justify-center gap-2">
                        <ShoppingBag className="size-10" />
                        <span className="text-sm">Sem foto</span>
                    </div>
                )}
                <Badge
                    variant={soldOut ? 'secondary' : 'success'}
                    className="absolute top-3 right-3 shadow-sm"
                >
                    {soldOut ? 'Sem disponibilidade' : 'Disponível'}
                </Badge>
            </div>
            <CardContent className="flex flex-1 flex-col gap-4 p-5">
                <div className="grid gap-1.5">
                    <h2 className="text-base font-semibold text-balance">
                        {gift.name}
                    </h2>
                    {gift.description && (
                        <p className="text-muted-foreground line-clamp-3 text-sm">
                            {gift.description}
                        </p>
                    )}
                    {gift.priceCents !== null && (
                        <p className="text-primary pt-1 font-semibold tabular-nums">
                            {currencyFormatter.format(gift.priceCents / 100)}
                        </p>
                    )}
                </div>

                <dl className="bg-muted/60 grid grid-cols-3 gap-2 rounded-xl p-3 text-center">
                    <Quantity label="Total" value={gift.quantityTotal} />
                    <Quantity label="Reservada" value={gift.quantityReserved} />
                    <Quantity
                        label="Disponível"
                        value={gift.quantityAvailable}
                    />
                </dl>

                {gift.reservations && gift.reservations.length > 0 && (
                    <div className="grid gap-2">
                        <p className="text-sm font-medium">Quem reservou</p>
                        <div className="flex flex-wrap gap-1.5">
                            {gift.reservations.map((reservation) => (
                                <Badge
                                    key={`${reservation.guestName}-${reservation.quantity}`}
                                    variant="secondary"
                                >
                                    {reservation.guestName} ×{' '}
                                    {reservation.quantity}
                                </Badge>
                            ))}
                        </div>
                    </div>
                )}

                <div className="mt-auto grid grid-cols-2 gap-2 pt-1">
                    <Button type="button" variant="outline" onClick={onEdit}>
                        <Pencil /> Editar
                    </Button>
                    <Button
                        type="button"
                        variant="destructive"
                        onClick={onDelete}
                    >
                        <Trash2 /> Excluir
                    </Button>
                </div>
            </CardContent>
        </Card>
    );
}

function Quantity({ label, value }: { label: string; value: number }) {
    return (
        <div>
            <dt className="text-muted-foreground text-[0.7rem]">{label}</dt>
            <dd className="font-semibold tabular-nums">{value}</dd>
        </div>
    );
}

type GiftFormData = {
    name: string;
    quantity_total: string;
    price: string;
    purchase_url: string;
    description: string;
    image: File | null;
    remove_image: boolean;
    _method?: 'PATCH';
};

function GiftEditorDialog({
    event,
    gift,
    onClose,
}: {
    event: EventOption;
    gift: GiftItem | null;
    onClose: () => void;
}) {
    const [discardOpen, setDiscardOpen] = useState(false);
    const [imageInputKey, setImageInputKey] = useState(0);
    const submitting = useRef(false);
    const form = useForm<GiftFormData>({
        name: gift?.name ?? '',
        quantity_total: String(gift?.quantityTotal ?? 1),
        price:
            gift?.priceCents == null ? '' : (gift.priceCents / 100).toFixed(2),
        purchase_url: gift?.purchaseUrl ?? '',
        description: gift?.description ?? '',
        image: null,
        remove_image: false,
        _method: gift ? 'PATCH' : undefined,
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

    const visibleImage =
        imagePreview ?? (!form.data.remove_image ? gift?.imageUrl : null);

    const requestClose = () => {
        if (form.processing) return;
        if (form.isDirty) {
            setDiscardOpen(true);
            return;
        }
        onClose();
    };

    const removeImage = () => {
        form.setData('image', null);
        form.setData('remove_image', gift?.imageUrl != null);
        form.clearErrors('image');
        setImageInputKey((key) => key + 1);
    };

    const submit = (submitEvent: FormEvent<HTMLFormElement>) => {
        submitEvent.preventDefault();
        if (submitting.current || form.processing) return;

        submitting.current = true;
        const action = gift
            ? GiftController.update({ event: event.id, gift: gift.id }).url
            : GiftController.store(event.id).url;

        form.post(action, {
            forceFormData: true,
            preserveScroll: true,
            onSuccess: () => {
                toast.success(
                    gift ? 'Presente atualizado.' : 'Presente adicionado.',
                );
                onClose();
            },
            onFinish: () => {
                submitting.current = false;
            },
        });
    };

    const idPrefix = gift ? `gift-${gift.id}` : 'new-gift';

    return (
        <>
            <Dialog
                open
                onOpenChange={(open) => {
                    if (!open) requestClose();
                }}
            >
                <DialogContent className="max-h-[calc(100dvh-2rem)] overflow-y-auto sm:max-w-2xl">
                    <DialogHeader>
                        <DialogTitle>
                            {gift ? 'Editar presente' : 'Adicionar presente'}
                        </DialogTitle>
                        <DialogDescription>
                            {gift ? 'Edite' : 'Cadastre'} o presente do evento{' '}
                            <strong>{event.title}</strong>.
                        </DialogDescription>
                    </DialogHeader>
                    <form onSubmit={submit} className="grid gap-5">
                        <div className="grid gap-4 sm:grid-cols-2">
                            <FormField
                                id={`${idPrefix}-name`}
                                label="Nome"
                                value={form.data.name}
                                onChange={(value) =>
                                    form.setData('name', value)
                                }
                                error={form.errors.name}
                                maxLength={120}
                                required
                                autoFocus
                            />
                            <FormField
                                id={`${idPrefix}-quantity`}
                                label="Quantidade"
                                type="number"
                                min={Math.max(1, gift?.quantityReserved ?? 1)}
                                max={100000}
                                value={form.data.quantity_total}
                                onChange={(value) =>
                                    form.setData('quantity_total', value)
                                }
                                error={form.errors.quantity_total}
                                required
                            />
                            <FormField
                                id={`${idPrefix}-price`}
                                label="Preço (opcional)"
                                type="number"
                                min={0}
                                max={99999999.99}
                                step="0.01"
                                value={form.data.price}
                                onChange={(value) =>
                                    form.setData('price', value)
                                }
                                error={form.errors.price}
                            />
                            <FormField
                                id={`${idPrefix}-url`}
                                label="Link de compra (opcional)"
                                type="url"
                                value={form.data.purchase_url}
                                onChange={(value) =>
                                    form.setData('purchase_url', value)
                                }
                                error={form.errors.purchase_url}
                            />
                            <div className="grid gap-2 sm:col-span-2">
                                <Label htmlFor={`${idPrefix}-image`}>
                                    Foto (opcional)
                                </Label>
                                <Input
                                    key={imageInputKey}
                                    id={`${idPrefix}-image`}
                                    type="file"
                                    accept="image/jpeg,image/png,image/webp"
                                    onChange={(inputEvent) => {
                                        form.setData(
                                            'image',
                                            inputEvent.target.files?.[0] ??
                                                null,
                                        );
                                        form.setData('remove_image', false);
                                    }}
                                />
                                <InputError message={form.errors.image} />
                                {visibleImage ? (
                                    <div className="grid gap-2">
                                        <img
                                            src={visibleImage}
                                            alt="Prévia da foto do presente"
                                            className="h-44 w-full rounded-xl border object-cover"
                                        />
                                        <Button
                                            type="button"
                                            variant="outline"
                                            className="justify-self-start"
                                            onClick={removeImage}
                                        >
                                            <Trash2 /> Remover foto
                                        </Button>
                                    </div>
                                ) : (
                                    <div className="bg-muted text-muted-foreground flex h-28 items-center justify-center rounded-xl border border-dashed">
                                        <ImageIcon className="size-7" />
                                    </div>
                                )}
                            </div>
                            <div className="grid gap-2 sm:col-span-2">
                                <Label htmlFor={`${idPrefix}-description`}>
                                    Descrição
                                </Label>
                                <Textarea
                                    id={`${idPrefix}-description`}
                                    rows={4}
                                    value={form.data.description}
                                    onChange={(inputEvent) =>
                                        form.setData(
                                            'description',
                                            inputEvent.target.value,
                                        )
                                    }
                                    maxLength={5000}
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
                            Os dados preenchidos não serão salvos. A foto atual
                            continuará preservada.
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
                            onClick={onClose}
                        >
                            Descartar
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </>
    );
}

function FormField({
    id,
    label,
    error,
    onChange,
    ...props
}: Omit<React.ComponentProps<typeof Input>, 'onChange'> & {
    label: string;
    error?: string;
    onChange: (value: string) => void;
}) {
    return (
        <div className="grid gap-2">
            <Label htmlFor={id}>{label}</Label>
            <Input
                id={id}
                onChange={(inputEvent) => onChange(inputEvent.target.value)}
                {...props}
            />
            <InputError message={error} />
        </div>
    );
}

function DeleteGiftDialog({
    event,
    gift,
    onClose,
}: {
    event: EventOption;
    gift: GiftItem;
    onClose: () => void;
}) {
    const form = useForm({});

    const remove = () => {
        form.delete(
            GiftController.destroy({ event: event.id, gift: gift.id }).url,
            {
                preserveScroll: true,
                onSuccess: () => {
                    toast.success('Presente excluído da lista ativa.');
                    onClose();
                },
            },
        );
    };

    return (
        <Dialog open onOpenChange={(open) => !open && onClose()}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Excluir “{gift.name}”?</DialogTitle>
                    <DialogDescription>
                        {gift.quantityReserved > 0
                            ? `O presente será retirado do catálogo, mas as ${gift.quantityReserved} unidade(s) reservada(s) e o histórico serão preservados. Nenhuma reserva será cancelada.`
                            : 'O presente será retirado do catálogo. O registro será arquivado para preservar o histórico do evento.'}
                    </DialogDescription>
                </DialogHeader>
                <DialogFooter>
                    <Button
                        type="button"
                        variant="outline"
                        disabled={form.processing}
                        onClick={onClose}
                    >
                        Cancelar
                    </Button>
                    <Button
                        type="button"
                        variant="destructive"
                        disabled={form.processing}
                        onClick={remove}
                    >
                        {form.processing ? 'Excluindo...' : 'Excluir'}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}

Gifts.layout = { breadcrumbs: [{ title: 'Eventos', href: index() }] };
