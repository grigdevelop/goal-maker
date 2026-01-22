'use client';

import { RegisterForm, type RegisterFormData } from "@/components/auth";
import { signUp } from "@/lib/auth-client";

export default function Register() {
    const handleSubmit = async (data: RegisterFormData) => {
        console.log(data);
        const res = await signUp.email({
            email: data.email,
            password: data.password,
            name: data.email
        });

        if (res.error) {
            console.error(res.error);
        } else {
            console.log(res.data);
        }
    }

    return (
        <>
            <RegisterForm onSubmit={handleSubmit} />
        </>
    )
}