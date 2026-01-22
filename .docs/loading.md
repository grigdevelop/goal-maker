stack
- Next.js 
- TailwindCSS
- DaisyUI

Best practices for implementing a reusable loading framework across the application:

1. Create a centralized loading context/provider
2. Build reusable loading components (spinners, skeletons, overlays)
3. Implement loading states in data fetching hooks
4. Use Suspense boundaries for async components
5. Design consistent loading UI patterns with TailwindCSS and DaisyUI


// lib/contexts/LoadingContext.tsx
'use client';

import { createContext, useContext, useState, ReactNode } from 'react';

interface LoadingContextType {
  isLoading: boolean;
  setLoading: (loading: boolean) => void;
}

const LoadingContext = createContext<LoadingContextType | undefined>(undefined);

export function LoadingProvider({ children }: { children: ReactNode }) {
  const [isLoading, setLoading] = useState(false);
  return (
    <LoadingContext.Provider value={{ isLoading, setLoading }}>
      {children}
    </LoadingContext.Provider>
  );
}

export const useLoading = () => {
  const context = useContext(LoadingContext);
  if (!context) throw new Error('useLoading must be used within LoadingProvider');
  return context;
};

// components/loading/Spinner.tsx
export function Spinner({ size = 'md' }: { size?: 'sm' | 'md' | 'lg' }) {
  const sizeClasses = {
    sm: 'loading-spinner loading-sm',
    md: 'loading-spinner loading-md',
    lg: 'loading-spinner loading-lg'
  };
  return <span className={`loading ${sizeClasses[size]}`} />;
}

// components/loading/Skeleton.tsx
export function Skeleton({ className = '' }: { className?: string }) {
  return <div className={`skeleton ${className}`} />;
}

// components/loading/LoadingOverlay.tsx
export function LoadingOverlay({ show }: { show: boolean }) {
  if (!show) return null;
  return (
    <div className="fixed inset-0 bg-base-300/50 backdrop-blur-sm flex items-center justify-center z-50">
      <Spinner size="lg" />
    </div>
  );
}

// hooks/useAsync.ts
import { useState, useEffect } from 'react';

export function useAsync<T>(asyncFn: () => Promise<T>, deps: any[] = []) {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    setLoading(true);
    asyncFn()
      .then(setData)
      .catch(setError)
      .finally(() => setLoading(false));
  }, deps);

  return { data, loading, error };
}

// Example usage in app/layout.tsx
import { LoadingProvider } from '@/lib/contexts/LoadingContext';

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html>
      <body>
        <LoadingProvider>
          {children}
        </LoadingProvider>
      </body>
    </html>
  );
}

// Example: Page with loading state
'use client';
import { useAsync } from '@/hooks/useAsync';
import { Spinner, Skeleton } from '@/components/loading';

export default function GoalsPage() {
  const { data: goals, loading, error } = useAsync(async () => {
    const res = await fetch('/api/goals');
    return res.json();
  }, []);

  if (loading) return <div className="space-y-4">{[...Array(3)].map((_, i) => <Skeleton key={i} className="h-20 w-full" />)}</div>;
  if (error) return <div className="alert alert-error">Error loading goals</div>;

  return (
    <div>
      {goals?.map((goal: any) => <div key={goal.id}>{goal.title}</div>)}
    </div>
  );
}

// Example: Button with loading state
'use client';
import { useState } from 'react';
import { Spinner } from '@/components/loading';

export function CreateGoalButton() {
  const [loading, setLoading] = useState(false);

  const handleCreate = async () => {
    setLoading(true);
    try {
      await fetch('/api/goals', { method: 'POST', body: JSON.stringify({}) });
    } finally {
      setLoading(false);
    }
  };

  return (
    <button className="btn btn-primary" disabled={loading} onClick={handleCreate}>
      {loading ? <Spinner size="sm" /> : 'Create Goal'}
    </button>
  );
}

// Example: Global loading overlay
'use client';
import { useLoading } from '@/lib/contexts/LoadingContext';
import { LoadingOverlay } from '@/components/loading';

export function AppContent() {
  const { isLoading, setLoading } = useLoading();

  const handleAction = async () => {
    setLoading(true);
    await someAsyncOperation();
    setLoading(false);
  };

  return (
    <>
      <LoadingOverlay show={isLoading} />
      <button onClick={handleAction}>Perform Action</button>
    </>
  );
}
