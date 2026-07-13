import { useCallback, useEffect, useRef, useState, type ReactNode } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useT } from '../i18n';

export interface CarouselSlide {
  id: string;
  label: string;
  content: ReactNode;
}

interface Props {
  slides: CarouselSlide[];
  className?: string;
}

export default function Carousel({ slides, className }: Props) {
  const t = useT();
  const containerRef = useRef<HTMLDivElement>(null);
  const [activeIndex, setActiveIndex] = useState(0);

  const scrollToIndex = useCallback((index: number) => {
    const container = containerRef.current;
    if (!container) return;
    const target = Math.max(0, Math.min(slides.length - 1, index));
    container.scrollTo({ left: container.clientWidth * target, behavior: 'smooth' });
  }, [slides.length]);

  const handleScroll = () => {
    const container = containerRef.current;
    if (!container) return;
    const width = container.clientWidth;
    if (width === 0) return;
    const next = Math.round(container.scrollLeft / width);
    setActiveIndex((prev) => (prev === next ? prev : next));
  };

  // Keep the active slide anchored when the viewport resizes (e.g. rotation,
  // desktop window resize). Without this, scrollLeft goes stale relative to the
  // new clientWidth and the wrong slide appears.
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;
    const observer = new ResizeObserver(() => {
      container.scrollLeft = container.clientWidth * activeIndex;
    });
    observer.observe(container);
    return () => observer.disconnect();
  }, [activeIndex]);

  const canPrev = activeIndex > 0;
  const canNext = activeIndex < slides.length - 1;

  return (
    <div className={className}>
      <div className="relative">
        <div
          ref={containerRef}
          onScroll={handleScroll}
          className="flex overflow-x-auto snap-x snap-mandatory scrollbar-none items-stretch"
          style={{ scrollBehavior: 'smooth' }}
        >
          {slides.map((s) => (
            <div
              key={s.id}
              className="min-w-full snap-start flex [&>*]:w-full [&>*]:h-full [&>.card]:!px-11 sm:[&>.card]:!px-12"
              aria-roledescription="slide"
            >
              {s.content}
            </div>
          ))}
        </div>

        {slides.length > 1 && (
          <>
            <button
              type="button"
              onClick={() => scrollToIndex(activeIndex - 1)}
              disabled={!canPrev}
              aria-label={t('carousel.previous')}
              className={`flex absolute left-1 top-1/2 -translate-y-1/2 items-center justify-center
                w-9 h-9 rounded-full bg-surface-raised/90 backdrop-blur border border-surface-border
                shadow-soft text-slate-700 dark:text-slate-200 transition-opacity
                ${canPrev ? 'opacity-90 hover:opacity-100' : 'opacity-0 pointer-events-none'}`}
            >
              <ChevronLeft size={18} />
            </button>
            <button
              type="button"
              onClick={() => scrollToIndex(activeIndex + 1)}
              disabled={!canNext}
              aria-label={t('carousel.next')}
              className={`flex absolute right-1 top-1/2 -translate-y-1/2 items-center justify-center
                w-9 h-9 rounded-full bg-surface-raised/90 backdrop-blur border border-surface-border
                shadow-soft text-slate-700 dark:text-slate-200 transition-opacity
                ${canNext ? 'opacity-90 hover:opacity-100' : 'opacity-0 pointer-events-none'}`}
            >
              <ChevronRight size={18} />
            </button>
          </>
        )}
      </div>

      {slides.length > 1 && (
        <div className="flex items-center justify-center gap-1.5 mt-3">
          {slides.map((s, i) => {
            const isActive = i === activeIndex;
            return (
              <button
                key={s.id}
                type="button"
                onClick={() => scrollToIndex(i)}
                aria-label={t('carousel.goToSlide', { label: s.label })}
                aria-current={isActive ? 'true' : undefined}
                className={`h-1.5 rounded-full transition-all ${
                  isActive
                    ? 'w-5 bg-accent'
                    : 'w-1.5 bg-slate-300 dark:bg-slate-600 hover:bg-slate-400 dark:hover:bg-slate-500'
                }`}
              />
            );
          })}
        </div>
      )}
    </div>
  );
}
