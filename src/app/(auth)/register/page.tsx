'use client';

import { useState } from "react";
import { useRouter } from "next/navigation";
import { RegisterForm, type RegisterFormData } from "@/components/auth";
import { signUp } from "@/lib/auth-client";

export default function Register() {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [errorMessage, setErrorMessage] = useState('');

    const handleSubmit = async (data: RegisterFormData) => {
        setLoading(true);
        setErrorMessage('');
        
        try {
            const res = await signUp.email({
                email: data.email,
                password: data.password,
                name: data.email
            });

            if (res.error) {
                setErrorMessage(res.error.message || 'Registration failed');
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
            <RegisterForm onSubmit={handleSubmit} loading={loading} errorMessage={errorMessage} />
        </>
    )
}