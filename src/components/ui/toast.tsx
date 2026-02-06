'use client';

import React, { createContext, useContext, useState, useCallback, useRef } from 'react';
import { X } from 'lucide-react';

type ToastType = 'success' | 'error' | 'info' | 'warning';

type Toast = {
    id: string;
    message: string;
    type: ToastType;
};

type ToastContextType = {
    toast: (message: string, type?: ToastType) => void;
    success: (message: string) => void;
    error: (message: string) => void;
    info: (message: string) => void;
    warning: (message: string) => void;
};

const ToastContext = createContext<ToastContextType | null>(null);

const TOAST_DURATION = 4000;

const alertClass: Record<ToastType, string> = {
    success: 'alert-success',
    error: 'alert-error',
    info: 'alert-info',
    warning: 'alert-warning',
};

export function ToastProvider({ children }: { children: React.ReactNode }) {
    const [toasts, setToasts] = useState<Toast[]>([]);
    const timersRef = useRef<Map<string, ReturnType<typeof setTimeout>>>(new Map());

    const removeToast = useCallback((id: string) => {
        setToasts((prev) => prev.filter((t) => t.id !== id));
        const timer = timersRef.current.get(id);
        if (timer) {
            clearTimeout(timer);
            timersRef.current.delete(id);
        }
    }, []);

    const addToast = useCallback((message: string, type: ToastType = 'info') => {
        const id = crypto.randomUUID();
        setToasts((prev) => [...prev, { id, message, type }]);

        const timer = setTimeout(() => {
            removeToast(id);
        }, TOAST_DURATION);
        timersRef.current.set(id, timer);
    }, [removeToast]);

    const contextValue: ToastContextType = {
        toast: addToast,
        success: useCallback((msg: string) => addToast(msg, 'success'), [addToast]),
        error: useCallback((msg: string) => addToast(msg, 'error'), [addToast]),
        info: useCallback((msg: string) => addToast(msg, 'info'), [addToast]),
        warning: useCallback((msg: string) => addToast(msg, 'warning'), [addToast]),
    };

    return (
        <ToastContext.Provider value={contextValue}>
            {children}
            <div className="toast toast-top toast-end z-50">
                {toasts.map((t) => (
                    <div key={t.id} className={`alert ${alertClass[t.type]} flex justify-between gap-2 shadow-lg`}>
                        <span>{t.message}</span>
                        <button
                            className="btn btn-ghost btn-xs btn-square"
                            onClick={() => removeToast(t.id)}
                        >
                            <X className="h-3 w-3" />
                        </button>
                    </div>
                ))}
            </div>
        </ToastContext.Provider>
    );
}

export function useToast() {
    const ctx = useContext(ToastContext);
    if (!ctx) {
        throw new Error('useToast must be used within a ToastProvider');
    }
    return ctx;
}
