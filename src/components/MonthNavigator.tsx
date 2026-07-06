import { ChevronLeft, ChevronRight, Calendar } from 'lucide-react';
import { formatMonthLong, formatMonthShort, currentMonthKey } from '../utils';
import { useT, useLocale } from '../i18n';

interface Props {
  monthId: string;
  onPrev: () => void;
  onNext: () => void;
  onJumpToday: () => void;
}

export default function MonthNavigator({ monthId, onPrev, onNext, onJumpToday }: Props) {
  const t = useT();
  const locale = useLocale();
  const isCurrent = monthId === currentMonthKey();
  return (
    <div className="flex items-center gap-2">
      <button className="btn-ghost !p-2 rounded-lg" onClick={onPrev} aria-label={t('monthNav.prev')}>
        <ChevronLeft size={18} />
      </button>
      <div className="min-w-[120px] sm:min-w-[180px] text-center">
        <div className="text-base sm:text-lg font-semibold tracking-tight capitalize whitespace-nowrap">
          <span className="sm:hidden">{formatMonthShort(monthId, locale)}</span>
          <span className="hidden sm:inline">{formatMonthLong(monthId, locale)}</span>
        </div>
        {!isCurrent && (
          <button
            onClick={onJumpToday}
            className="text-xs text-slate-600 dark:text-slate-400 hover:text-accent-soft inline-flex items-center gap-1 mt-0.5"
          >
            <Calendar size={11} />
            {t('monthNav.jumpToday')}
          </button>
        )}
      </div>
      <button className="btn-ghost !p-2 rounded-lg" onClick={onNext} aria-label={t('monthNav.next')}>
        <ChevronRight size={18} />
      </button>
    </div>
  );
}
