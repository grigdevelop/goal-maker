import Link from 'next/link';

type EntityCardProps = {
    id: string | number;
    entityType: string;
    children: React.ReactNode;
};

export const EntityCard = ({ id, entityType, children }: EntityCardProps) => {
    return (
        <Link
            href={`/${entityType}/${id}`}
            className="card bg-base-300 border border-base-300 shadow-md w-96 cursor-pointer transition-all duration-200 hover:shadow-lg hover:scale-[1.02] active:scale-[0.98]"
            aria-label={`Open ${entityType}: ${id}`}
        >
            {children}
        </Link>
    );
};
