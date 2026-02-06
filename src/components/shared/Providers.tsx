'use client';

import { QueryProvider } from './QueryProvider';
import { ToastProvider } from '@/components/ui/toast';

export const Providers = ({ children }: { children: React.ReactNode }) => {
    return (
        <QueryProvider>
            <ToastProvider>
                {children}
            </ToastProvider>
        </QueryProvider>
    );
};