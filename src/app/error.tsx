'use client';

import { useEffect } from 'react';
import Link from 'next/link';

type Props = {
    error: Error & { digest?: string };
    reset: () => void;
};

export default function Error({ error, reset }: Props) {
    useEffect(() => {
        console.error('Application error:', error);
    }, [error]);

    return (
        <div className="min-h-screen flex items-center justify-center">
            <div className="text-center max-w-md">
                <h1 className="text-6xl font-bold text-error">Error</h1>
                <h2 className="text-xl font-semibold mt-4">Something went wrong</h2>
                <p className="text-base-content/60 mt-2">
                    {error.message || 'An unexpected error occurred.'}
                </p>
                {process.env.NODE_ENV === 'development' && error.stack && (
                    <pre className="mt-4 p-4 bg-base-200 rounded-lg text-left text-xs overflow-auto max-h-48">
                        {error.stack}
                    </pre>
                )}
                <div className="flex gap-2 justify-center mt-6">
                    <button onClick={reset} className="btn btn-primary">
                        Try Again
                    </button>
                    <Link href="/" className="btn btn-ghost">
                        Go Home
                    </Link>
                </div>
            </div>
        </div>
    );
}
