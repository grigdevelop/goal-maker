'use client';

import Link from 'next/link';
import { useForm, useWatch } from 'react-hook-form';

export type RegisterFormData = {
    email: string;
    password: string;
    confirmPassword: string;
};

type Props = {
    onSubmit: (data: RegisterFormData) => void;
    errorMessage?: string;
    loading?: boolean;
}

export function RegisterForm({ onSubmit, errorMessage, loading }: Props) {
    const { register, handleSubmit, formState: { errors }, control } = useForm<RegisterFormData>();
    const passwordValue = useWatch({ control, name: 'password' });

    const onSubmitHandler = (data: RegisterFormData) => {
        onSubmit(data);
    };

    return (
        <>
            <form onSubmit={handleSubmit(onSubmitHandler)}>
                <fieldset className="fieldset bg-base-200 border-base-300 rounded-box w-xs border p-4" disabled={loading}>
                    <legend className="fieldset-legend">Register</legend>

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

                    <label className="label">Confirm Password</label>
                    <input
                        type="password"
                        className="input"
                        placeholder="confirm password"
                        {...register('confirmPassword', {
                            required: 'Please confirm your password',
                            validate: (value) => value === passwordValue || 'Passwords do not match'
                        })}
                    />
                    {errors.confirmPassword && <span className="text-error text-sm">{errors.confirmPassword.message}</span>}

                    <button type="submit" className="btn btn-primary mt-4" disabled={loading}>
                        {loading ? <span className="loading loading-spinner loading-sm"></span> : 'Register'}
                    </button>

                    <p className="text-center mt-4">
                        Already have an account? <Link href="/login" className="link link-primary">Login</Link>
                    </p>
                </fieldset>
            </form>
        </>
    )
}