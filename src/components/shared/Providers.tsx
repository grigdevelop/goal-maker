'use client';

import { QueryProvider } from './QueryProvider';
import { ToastProvider } from '@/components/ui/toast';
import { DialogProvider } from './dialog';

export const Providers = ({ children }: { children: React.ReactNode }) => {
    return (
        <QueryProvider>
            <ToastProvider>
                <DialogProvider>
                    {children}
                </DialogProvider>
            </ToastProvider>
        </QueryProvider>
    );
};