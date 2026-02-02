import { auth } from '@/lib/auth';
import { headers } from 'next/headers';
import type { NextRequest } from 'next/server';

type SessionHandler<T = void> = (
    request: NextRequest,
    session: NonNullable<Awaited<ReturnType<typeof auth.api.getSession>>>,
    ctx: T
) => Promise<Response>;

type SessionHandlerWithoutContext = (
    request: NextRequest,
    session: NonNullable<Awaited<ReturnType<typeof auth.api.getSession>>>
) => Promise<Response>;

export function withSession<T>(handler: SessionHandler<T>): (request: NextRequest, ctx: T) => Promise<Response>;
export function withSession(handler: SessionHandlerWithoutContext): (request: NextRequest) => Promise<Response>;
export function withSession<T>(handler: SessionHandler<T> | SessionHandlerWithoutContext) {
    return async (request: NextRequest, ctx?: T) => {
        const session = await auth.api.getSession({
            headers: await headers(),
        });

        if (!session) {
            return Response.json({ error: 'Unauthorized' }, { status: 401 });
        }

        if (ctx !== undefined) {
            return (handler as SessionHandler<T>)(request, session, ctx);
        }
        return (handler as SessionHandlerWithoutContext)(request, session);
    };
}
