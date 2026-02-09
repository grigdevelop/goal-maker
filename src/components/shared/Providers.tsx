'use client';

import { QueryProvider } from './QueryProvider';
import { ToastProvider } from '@/components/ui/toast';
import { DialogProvider } from './dialog';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';

export const Providers = ({ children }: { children: React.ReactNode }) => {
    return (
        <QueryProvider>
            <ToastProvider>
                <DialogProvider>
                    {children}
                </DialogProvider>
            </ToastProvider>
            <ReactQueryDevtools />
        </QueryProvider>
    );
};