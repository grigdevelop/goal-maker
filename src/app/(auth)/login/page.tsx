'use client';

import { useState } from "react";
import { useRouter } from "next/navigation";
import { LoginForm, type LoginFormData } from "@/components/auth";
import { signIn } from "@/lib/auth-client";

export default function Login() {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [errorMessage, setErrorMessage] = useState('');

    const handleSubmit = async (data: LoginFormData) => {
        setLoading(true);
        setErrorMessage('');

        try {
            const res = await signIn.email({
                email: data.email,
                password: data.password
            });

            if (res.error) {
                setErrorMessage(res.error.message || 'Sign in failed');
            } else {
                router.push('/');
            }
        } catch (error) {
            setErrorMessage('An unexpected error occurred');
        } finally {
            setLoading(false);
        }
    }

    return (
        <>
            <LoginForm onSubmit={handleSubmit} loading={loading} errorMessage={errorMessage} />
        </>
    )
}