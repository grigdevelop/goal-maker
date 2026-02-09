'use client';

import { useState } from 'react';
import { QueryClientProvider, QueryClient } from '@tanstack/react-query';

export const QueryProvider = ({ children }: { children: React.ReactNode }) => {
    // TODO: Add query client configuration
    const [queryClient] = useState(() => new QueryClient());
    return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>;
};