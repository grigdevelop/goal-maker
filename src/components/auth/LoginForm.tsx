'use client';

import Link from 'next/link';
import { useForm } from 'react-hook-form';

export type LoginFormData = {
    email: string;
    password: string;
};

type Props = {
    onSubmit: (data: LoginFormData) => void;
    errorMessage?: string;
    loading?: boolean;
}

export function LoginForm({ onSubmit, errorMessage, loading }: Props) {
    const { register, handleSubmit, formState: { errors } } = useForm<LoginFormData>();

    const onSubmitHandler = (data: LoginFormData) => {
        onSubmit(data);
    };

    return (
        <>
            <form onSubmit={handleSubmit(onSubmitHandler)}>
                <fieldset className="fieldset bg-base-200 border-base-300 rounded-box w-xs border p-4" disabled={loading}>
                    <legend className="fieldset-legend">Login</legend>

                    {errorMessage && <div className="alert alert-error mb-4">{errorMessage}</div>}

                    <label className="label">Email</label>
                    <input
                        type="email"
                        className="input"
                        placeholder="email"
                        {...register('email', {
                            required: 'Email is required',
                            pattern: {
                                value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                                message: 'Invalid email address'
                            }
                        })}
                    />
                    {errors.email && <span className="text-error text-sm">{errors.email.message}</span>}

                    <label className="label">Password</label>
                    <input
                        type="password"
                        className="input"
                        placeholder="password"
                        {...register('password', {
                            required: 'Password is required',
                            minLength: {
                                value: 8,
                                message: 'Password must be at least 8 characters'
                            }
                        })}
                    />
                    {errors.password && <span className="text-error text-sm">{errors.password.message}</span>}

                    <button type="submit" className="btn btn-primary mt-4" disabled={loading}>
                        {loading ? <span className="loading loading-spinner loading-sm"></span> : 'Login'}
                    </button>

                    <p className="text-center mt-4">
                        Don&apos;t have an account? <Link href="/register" className="link link-primary">Register</Link>
                    </p>
                </fieldset>
            </form>
        </>
    )
}