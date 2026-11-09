import React from 'react';
import { CheckCircle2, AlertCircle, Info } from 'lucide-react';
import { useStore } from '../context/StoreContext';

export const ToastContainer: React.FC = () => {
  const { toasts } = useStore();

  if (toasts.length === 0) return null;

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col gap-2 max-w-sm pointer-events-none">
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className={`pointer-events-auto p-4 rounded-2xl shadow-xl border flex items-center gap-3 text-xs font-semibold animate-in slide-in-from-bottom-2 duration-200 ${
            toast.type === 'success'
              ? 'bg-zinc-900 text-white border-zinc-800'
              : toast.type === 'error'
              ? 'bg-red-600 text-white border-red-700'
              : 'bg-white text-zinc-900 border-pink-100 shadow-pink-100/50'
          }`}
        >
          {toast.type === 'success' && <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />}
          {toast.type === 'error' && <AlertCircle className="w-4 h-4 text-white shrink-0" />}
          {toast.type === 'info' && <Info className="w-4 h-4 text-[#E6007A] shrink-0" />}
          <span className="flex-1 leading-snug">{toast.message}</span>
        </div>
      ))}
    </div>
  );
};
