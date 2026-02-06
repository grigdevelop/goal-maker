import Link from 'next/link';

export default function NotFound() {
    return (
        <div className="min-h-screen flex items-center justify-center">
            <div className="text-center">
                <h1 className="text-9xl font-bold text-base-content/20">404</h1>
                <h2 className="text-2xl font-semibold mt-4">Page Not Found</h2>
                <p className="text-base-content/60 mt-2">
                    The page you are looking for doesn&apos;t exist or has been moved.
                </p>
                <Link href="/" className="btn btn-primary mt-6">
                    Go Home
                </Link>
            </div>
        </div>
    );
}
