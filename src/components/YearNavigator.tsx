import { ChevronLeft, ChevronRight, Calendar } from 'lucide-react';
import { useT } from '../i18n';

interface Props {
  year: number;
  onPrev: () => void;
  onNext: () => void;
  onJumpToday: () => void;
}

export default function YearNavigator({ year, onPrev, onNext, onJumpToday }: Props) {
  const t = useT();
  const currentYear = new Date().getFullYear();
  const isCurrent = year === currentYear;
  return (
    <div className="flex items-center gap-2">
      <button className="btn-ghost !p-2 rounded-lg" onClick={onPrev} aria-label={t('yearNav.prev')}>
        <ChevronLeft size={18} />
      </button>
      <div className="min-w-[100px] text-center">
        <div className="text-lg font-semibold tracking-tight">{year}</div>
        {!isCurrent && (
          <button
            onClick={onJumpToday}
            className="text-xs text-slate-500 hover:text-accent-soft inline-flex items-center gap-1 mt-0.5"
          >
            <Calendar size={11} />
            {t('yearNav.jumpToday')}
          </button>
        )}
      </div>
      <button className="btn-ghost !p-2 rounded-lg" onClick={onNext} aria-label={t('yearNav.next')}>
        <ChevronRight size={18} />
      </button>
    </div>
  );
}
