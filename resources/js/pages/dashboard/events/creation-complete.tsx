import { useState } from 'react';
import { Head, Link } from '@inertiajs/react';
import { Check, Copy, Eye, LockKeyhole, PartyPopper } from 'lucide-react';
import PublicEventController from '@/actions/App/Http/Controllers/PublicEventController';
import { PageHeader } from '@/components/celebre/page-header';
import { Button } from '@/components/ui/button';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { useClipboard } from '@/hooks/use-clipboard';
import { index } from '@/routes/events';

type CompletedEvent = {
    id: number;
    title: string;
    isPublished: boolean;
    publicUrl: string | null;
};

export default function EventCreationComplete({
    event,
}: {
    event: CompletedEvent;
}) {
    const [copiedText, copy] = useClipboard();
    const [copyFailed, setCopyFailed] = useState(false);
    const copied = event.publicUrl !== null && copiedText === event.publicUrl;

    const copyLink = async () => {
        if (event.publicUrl === null) {
            return;
        }

        setCopyFailed(!(await copy(event.publicUrl)));
    };

    return (
        <>
            <Head
                title={
                    event.isPublished ? 'Evento publicado' : 'Evento privado'
                }
            />
            <div className="flex flex-1 flex-col gap-6 p-4 md:p-6">
                <PageHeader
                    eyebrow="Evento concluído"
                    title={event.title}
                    description="As informações foram salvas com sucesso."
                />

                <Card className="mx-auto w-full max-w-2xl">
                    <CardHeader className="text-center">
                        <div className="bg-primary/10 text-primary mx-auto flex size-14 items-center justify-center rounded-full">
                            {event.isPublished ? (
                                <PartyPopper className="size-7" />
                            ) : (
                                <LockKeyhole className="size-7" />
                            )}
                        </div>
                        <CardTitle className="text-2xl">
                            {event.isPublished
                                ? 'Seu evento foi publicado!'
                                : 'Evento salvo como privado'}
                        </CardTitle>
                        <CardDescription>
                            {event.isPublished
                                ? 'O convite já está disponível no endereço público abaixo.'
                                : 'A prévia continua restrita ao organizador. Você poderá publicar depois pelo painel.'}
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="grid gap-5">
                        {event.isPublished && event.publicUrl ? (
                            <>
                                <div className="grid gap-2">
                                    <label
                                        htmlFor="public-url"
                                        className="text-sm font-medium"
                                    >
                                        Link público
                                    </label>
                                    <Input
                                        id="public-url"
                                        readOnly
                                        value={event.publicUrl}
                                        onFocus={(inputEvent) =>
                                            inputEvent.currentTarget.select()
                                        }
                                    />
                                    {copied && (
                                        <p
                                            className="text-sm text-emerald-700"
                                            role="status"
                                        >
                                            Link copiado para a área de
                                            transferência.
                                        </p>
                                    )}
                                    {copyFailed && (
                                        <p
                                            className="text-muted-foreground text-sm"
                                            role="status"
                                        >
                                            Não foi possível copiar
                                            automaticamente. Selecione a URL
                                            acima para copiá-la manualmente.
                                        </p>
                                    )}
                                </div>
                                <div className="flex flex-col gap-3 sm:flex-row">
                                    <Button
                                        type="button"
                                        onClick={() => void copyLink()}
                                    >
                                        {copied ? <Check /> : <Copy />}
                                        {copied
                                            ? 'Link copiado'
                                            : 'Copiar link'}
                                    </Button>
                                    <Button asChild variant="outline">
                                        <Link
                                            href={event.publicUrl}
                                            target="_blank"
                                        >
                                            <Eye /> Ver convite
                                        </Link>
                                    </Button>
                                    <Button asChild variant="ghost">
                                        <Link href={index()}>
                                            Voltar aos eventos
                                        </Link>
                                    </Button>
                                </div>
                            </>
                        ) : (
                            <div className="flex flex-col gap-3 sm:flex-row sm:justify-center">
                                <Button asChild>
                                    <Link
                                        href={PublicEventController.preview(
                                            event.id,
                                        )}
                                        target="_blank"
                                    >
                                        <Eye /> Ver prévia
                                    </Link>
                                </Button>
                                <Button asChild variant="outline">
                                    <Link href={index()}>
                                        Voltar aos eventos
                                    </Link>
                                </Button>
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>
        </>
    );
}

EventCreationComplete.layout = {
    breadcrumbs: [{ title: 'Meus eventos', href: index() }],
};
