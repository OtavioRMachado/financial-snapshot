import { CheckCircle2 } from 'lucide-react';

interface ToastProps {
  message: string | null;
}

export default function Toast({ message }: ToastProps) {
  if (!message) return null;
  return (
    <div className="pointer-events-none fixed bottom-6 left-1/2 -translate-x-1/2 z-[60]">
      <div
        key={message}
        className="animate-toast card px-4 py-2.5 flex items-center gap-2 text-sm shadow-soft"
      >
        <CheckCircle2 size={16} className="text-emerald-400" />
        <span>{message}</span>
      </div>
    </div>
  );
}
