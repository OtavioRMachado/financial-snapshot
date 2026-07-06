import { CheckCircle2 } from 'lucide-react';

export interface ToastAction {
  label: string;
  onClick: () => void;
}

interface ToastProps {
  message: string | null;
  action?: ToastAction | null;
}

export default function Toast({ message, action }: ToastProps) {
  if (!message) return null;
  return (
    <div className="pointer-events-none fixed bottom-6 left-1/2 -translate-x-1/2 z-[60] px-4 max-w-full">
      <div
        key={message}
        className="animate-toast card px-4 py-2.5 flex items-center gap-3 text-sm shadow-soft pointer-events-auto"
      >
        <CheckCircle2 size={16} className="text-emerald-400 flex-shrink-0" />
        <span className="truncate">{message}</span>
        {action && (
          <button
            onClick={action.onClick}
            className="ml-1 text-accent-soft hover:text-accent font-medium text-xs uppercase tracking-wide"
          >
            {action.label}
          </button>
        )}
      </div>
    </div>
  );
}
