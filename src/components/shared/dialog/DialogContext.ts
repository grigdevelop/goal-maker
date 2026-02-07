import { createContext, ReactNode } from 'react';

interface DialogContextType {
    isOpen: boolean;
    content: ReactNode;
    openDialog: (content: ReactNode) => void;
    closeDialog: () => void;
}

export const DialogContext = createContext<DialogContextType | undefined>(undefined);