import { DialogContext } from "./DialogContext";
import { ReactNode, useCallback, useRef, useState } from "react";

export function DialogProvider({ children }: { children: ReactNode }) {
    const dialogRef = useRef<HTMLDialogElement>(null);
    const [isOpen, setIsOpen] = useState(false);
    const [content, setContent] = useState<ReactNode>(null);

    const openDialog = useCallback((dialogContent: ReactNode) => {
        setContent(dialogContent);
        setIsOpen(true);
        dialogRef.current?.showModal();
    }, []);

    const closeDialog = useCallback(() => {
        dialogRef.current?.close();
        setIsOpen(false);
    }, []);

    const handleBackdropClick = (e: React.MouseEvent<HTMLDialogElement>) => {
        const dialog = dialogRef.current;
        if (dialog && e.target === dialog) {
            closeDialog();
        }
    };

    return (
        <DialogContext.Provider value={{ isOpen, content, openDialog, closeDialog }}>
            {children}
            <dialog ref={dialogRef} className="modal" onClick={handleBackdropClick}>
                <div className="modal-box">
                    {content}
                </div>
            </dialog>
        </DialogContext.Provider>
    );
}