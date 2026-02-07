import { createContext, useContext, useState, useCallback, ReactNode } from 'react';

interface DialogContextType {
  isOpen: boolean;
  title: string;
  content: ReactNode;
  openDialog: (title: string, content: ReactNode) => void;
  closeDialog: () => void;
}

const DialogContext = createContext<DialogContextType | undefined>(undefined);

export function DialogProvider({ children }: { children: ReactNode }) {
  const [isOpen, setIsOpen] = useState(false);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState<ReactNode>(null);

  const openDialog = useCallback((dialogTitle: string, dialogContent: ReactNode) => {
    setTitle(dialogTitle);
    setContent(dialogContent);
    setIsOpen(true);
  }, []);

  const closeDialog = useCallback(() => {
    setIsOpen(false);
  }, []);

  return (
    <DialogContext.Provider value={{ isOpen, title, content, openDialog, closeDialog }}>
      {children}
      {isOpen && (
        <dialog className="modal modal-open">
          <div className="modal-box">
            <h3 className="font-bold text-lg">{title}</h3>
            <div className="py-4">{content}</div>
            <div className="modal-action">
              <button className="btn" onClick={closeDialog}>Close</button>
            </div>
          </div>
        </dialog>
      )}
    </DialogContext.Provider>
  );
}

export function useDialog() {
  const context = useContext(DialogContext);
  if (!context) {
    throw new Error('useDialog must be used within a DialogProvider');
  }
  return context;
}

// Example usage:
// import { DialogProvider, useDialog } from './DialogContext';
//
// function App() {
//   return (
//     <DialogProvider>
//       <YourComponent />
//     </DialogProvider>
//   );
// }
//
// function YourComponent() {
//   const { openDialog } = useDialog();
//
//   const handleClick = () => {
//     openDialog('Confirm Action', <p>Are you sure you want to proceed?</p>);
//   };
//
//   return <button onClick={handleClick}>Open Dialog</button>;
// }
