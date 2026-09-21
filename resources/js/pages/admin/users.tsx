import { Form, Head, Link } from '@inertiajs/react';
import { Search, Users } from 'lucide-react';
import SuspendedUserController from '@/actions/App/Http/Controllers/Admin/SuspendedUserController';
import { EmptyState } from '@/components/celebre/empty-state';
import { PageHeader } from '@/components/celebre/page-header';
import { Pagination, type PaginationLink } from '@/components/pagination';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { dashboard as adminDashboard } from '@/routes/admin';
import { index as usersIndex } from '@/routes/admin/users';

type Organizer = {
    id: number;
    name: string;
    email: string;
    eventsCount: number;
    suspended: boolean;
    createdAt: string | null;
};

export default function AdminUsers({
    users,
    filters,
}: {
    users: { data: Organizer[]; links: PaginationLink[]; total: number };
    filters: { search: string };
}) {
    return (
        <>
            <Head title="Organizadores" />
            <div className="flex flex-1 flex-col gap-6 p-4 md:p-6">
                <PageHeader
                    eyebrow="Administração"
                    title="Organizadores"
                    description="Consulte contas e controle o acesso à plataforma."
                />

                <Card>
                    <CardContent className="pt-6">
                        <Form
                            action={usersIndex()}
                            options={{ preserveState: true, replace: true }}
                            className="flex flex-col gap-3 sm:flex-row"
                        >
                            <div className="relative flex-1">
                                <Search className="text-muted-foreground absolute top-1/2 left-3 size-4 -translate-y-1/2" />
                                <Input
                                    name="search"
                                    defaultValue={filters.search}
                                    placeholder="Buscar por nome ou e-mail"
                                    className="pl-9"
                                />
                            </div>
                            <Button>Buscar</Button>
                            {filters.search && (
                                <Button asChild variant="outline">
                                    <Link href={usersIndex()}>Limpar</Link>
                                </Button>
                            )}
                        </Form>
                    </CardContent>
                </Card>

                <div className="grid gap-4 lg:grid-cols-2">
                    {users.data.map((user) => (
                        <Card key={user.id}>
                            <CardHeader className="flex-row items-start justify-between gap-3">
                                <div className="min-w-0">
                                    <CardTitle className="truncate text-lg">
                                        {user.name}
                                    </CardTitle>
                                    <p className="text-muted-foreground truncate text-sm">
                                        {user.email}
                                    </p>
                                </div>
                                <Badge
                                    variant={
                                        user.suspended
                                            ? 'destructive'
                                            : 'success'
                                    }
                                >
                                    {user.suspended ? 'Suspensa' : 'Ativa'}
                                </Badge>
                            </CardHeader>
                            <CardContent className="flex flex-wrap items-center justify-between gap-4">
                                <p className="text-sm">
                                    <span className="font-semibold tabular-nums">
                                        {user.eventsCount}
                                    </span>{' '}
                                    {user.eventsCount === 1
                                        ? 'evento'
                                        : 'eventos'}
                                </p>
                                <Form
                                    action={
                                        user.suspended
                                            ? SuspendedUserController.destroy(
                                                  user.id,
                                              )
                                            : SuspendedUserController.store(
                                                  user.id,
                                              )
                                    }
                                    options={{ preserveScroll: true }}
                                >
                                    {({ processing }) => (
                                        <Button
                                            variant={
                                                user.suspended
                                                    ? 'outline'
                                                    : 'destructive'
                                            }
                                            disabled={processing}
                                        >
                                            {user.suspended
                                                ? 'Reativar conta'
                                                : 'Suspender conta'}
                                        </Button>
                                    )}
                                </Form>
                            </CardContent>
                        </Card>
                    ))}
                </div>

                {users.data.length === 0 && (
                    <EmptyState
                        icon={Users}
                        title="Nenhum organizador encontrado"
                        description="Ajuste a busca para encontrar outra conta."
                    />
                )}

                <Pagination links={users.links} />
            </div>
        </>
    );
}

AdminUsers.layout = {
    breadcrumbs: [
        { title: 'Administração', href: adminDashboard() },
        { title: 'Organizadores', href: usersIndex() },
    ],
};
