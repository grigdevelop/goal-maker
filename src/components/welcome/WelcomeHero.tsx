import Link from "next/link";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";

export async function WelcomeHero() {
    const session = await auth.api.getSession({
        headers: await headers(),
    });

    if (!session?.user) {
        return null;
    }

    return (
        <div className="hero bg-base-200 py-10">
            <div className="hero-content max-w-2xl text-center">
                <div>
                    <h1 className="text-2xl font-bold mb-4">
                        Welcome back, {session.user.name}!
                    </h1>
                    <p className="text-base leading-relaxed opacity-80">
                        This is your personal space to turn ambitions into achievements. Define
                        {' '}<Link href="/goals" className="text-primary hover:underline font-medium">goals</Link>{' '}
                        to set your direction, build
                        {' '}<Link href="/skills" className="text-primary hover:underline font-medium">skills</Link>{' '}
                        to grow your abilities, and break everything down into actionable
                        {' '}<Link href="/tasks" className="text-primary hover:underline font-medium">tasks</Link>{' '}
                        you can tackle every day. Track your progress visually, get personalized
                        recommendations, and stay focused on what matters most.
                    </p>
                    <div className="mt-6">
                        <Link href="/goals" className="btn btn-primary">
                            Get Started
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
}