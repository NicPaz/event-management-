import { Link } from '@inertiajs/react';
import { Button } from '@/components/ui/button';

export type PaginationLink = {
    url: string | null;
    label: string;
    active: boolean;
};

export function Pagination({ links }: { links: PaginationLink[] }) {
    if (links.length <= 3) {
        return null;
    }

    return (
        <nav aria-label="Paginação" className="flex flex-wrap gap-2">
            {links.map((link, index) => {
                const label =
                    index === 0
                        ? 'Anterior'
                        : index === links.length - 1
                          ? 'Próxima'
                          : link.label;

                return (
                    <Button
                        key={`${link.label}-${index}`}
                        asChild={link.url !== null}
                        variant={link.active ? 'default' : 'outline'}
                        size="sm"
                        disabled={link.url === null}
                    >
                        {link.url === null ? (
                            <span>{label}</span>
                        ) : (
                            <Link href={link.url} preserveScroll>
                                {label}
                            </Link>
                        )}
                    </Button>
                );
            })}
        </nav>
    );
}
