'use client';

import { createContext, useCallback, useContext, useReducer, ReactNode } from 'react';

type Toast = { id: string; message: string; type?: 'info' | 'success' | 'error' };

type State = { toasts: Toast[] };
type Action = { type: 'add'; toast: Toast } | { type: 'remove'; id: string };

function reducer(state: State, action: Action): State {
  switch (action.type) {
    case 'add':
      return { toasts: [...state.toasts.slice(-4), action.toast] };
    case 'remove':
      return { toasts: state.toasts.filter((t) => t.id !== action.id) };
    default:
      return state;
  }
}

const ToastContext = createContext<((message: string, type?: 'info' | 'success' | 'error') => void) | null>(null);

export function useToast() {
  const add = useContext(ToastContext);
  if (!add) return (message: string) => {}; // no-op if outside provider
  return add;
}

export function ToasterProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(reducer, { toasts: [] });
  const addToast = useCallback((message: string, type: 'info' | 'success' | 'error' = 'info') => {
    const id = Math.random().toString(36).slice(2);
    dispatch({ type: 'add', toast: { id, message, type } });
    setTimeout(() => dispatch({ type: 'remove', id }), 4000);
  }, []);
  return (
    <ToastContext.Provider value={addToast}>
      {children}
      <div className="fixed bottom-4 left-4 right-4 z-[100] flex flex-col gap-2 pointer-events-none md:left-auto md:right-4 md:max-w-sm">
        {state.toasts.map((t) => (
          <div
            key={t.id}
            className="pointer-events-auto rounded-lg border px-4 py-3 shadow-lg bg-club-card border-club-border text-sm animate-in fade-in slide-in-from-bottom-2"
            data-type={t.type}
          >
            {t.message}
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}
