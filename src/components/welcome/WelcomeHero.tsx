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
        <div className="hero bg-base-200">
            <div className="hero-content">
                <div>
                    <p className="py-2">
                        Welcome to your personal goal tracking platform, {session.user.name}! Here you can create goals, develop skills, and manage tasks to help you achieve success.
                    </p>
                </div>
            </div>
        </div>
    );
}