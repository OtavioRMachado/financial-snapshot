import { useId, useLayoutEffect, useMemo, useRef, useState } from 'react';
import { ZoomIn, ZoomOut, Maximize2 } from 'lucide-react';
import type { CurrencyCode } from '../types';
import {
  formatCurrency,
  formatCurrencyShort,
  formatDateAxis,
  formatDateFull,
} from '../utils';
import { useLocale, useT } from '../i18n';

export interface ChartPoint {
  date: Date;
  value: number;
}

export interface ChartSeries {
  key: string;
  label: string;
  color: string;
  dashed?: boolean;
  showDots?: boolean;
  points: ChartPoint[];
}

interface Props {
  series: ChartSeries[];
  currency: CurrencyCode;
  height?: number;
}

const MOBILE_BREAKPOINT = 640;
const MS_PER_DAY = 24 * 60 * 60 * 1000;
const MIN_VISIBLE_MS = 30 * MS_PER_DAY; // don't zoom in tighter than ~1 month

export default function InvestmentChart({ series, currency, height = 340 }: Props) {
  const locale = useLocale();
  const t = useT();
  const clipId = useId();
  const containerRef = useRef<HTMLDivElement>(null);
  // Start at 0 so the SVG doesn't render at some guessed size and cause
  // horizontal overflow on the initial paint (which on Android Chrome would
  // trigger an auto-fit zoom-out of the whole page).
  const [width, setWidth] = useState(0);
  const [hoverX, setHoverX] = useState<number | null>(null);
  // Zoom range in ms; null = full domain.
  const [zoom, setZoom] = useState<[number, number] | null>(null);
  // Brush-select state during a drag.
  const [drag, setDrag] = useState<{ startX: number; currentX: number } | null>(null);
  // Minimum pixel drag to count as a brush zoom (below this, it's just a click/hover).
  const DRAG_THRESHOLD = 12;

  // Measure synchronously before paint so the SVG never renders with a bad
  // width (which would cause horizontal overflow and mobile browsers to
  // auto-scale the whole page).
  useLayoutEffect(() => {
    if (!containerRef.current) return;
    const el = containerRef.current;
    const update = () => setWidth(el.clientWidth);
    update();
    const ro = new ResizeObserver(update);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  const isMobile = width < MOBILE_BREAKPOINT;
  const effectiveHeight = isMobile ? Math.min(height, 240) : height;
  const PADDING = isMobile
    ? { top: 12, right: 12, bottom: 26, left: 46 }
    : { top: 16, right: 24, bottom: 32, left: 64 };

  const plotW = Math.max(1, width - PADDING.left - PADDING.right);
  const plotH = Math.max(1, effectiveHeight - PADDING.top - PADDING.bottom);

  // Full domain across all series
  const { fullXMin, fullXMax, fullYMax } = useMemo(() => {
    const all = series.flatMap((s) => s.points);
    if (all.length === 0) return { fullXMin: 0, fullXMax: 1, fullYMax: 1 };
    const xs = all.map((p) => p.date.getTime());
    const ys = all.map((p) => p.value);
    const xMinRaw = Math.min(...xs);
    const xMaxRaw = Math.max(...xs);
    return {
      fullXMin: xMinRaw,
      fullXMax: xMaxRaw === xMinRaw ? xMinRaw + 1 : xMaxRaw,
      fullYMax: Math.max(...ys),
    };
  }, [series]);

  // Effective domain: zoom overrides x; y auto-scales to points visible in x range
  const { xMin, xMax, yMin, yMax } = useMemo(() => {
    const [zMin, zMax] = zoom ?? [fullXMin, fullXMax];
    let visibleMax = 0;
    for (const s of series) {
      for (const p of s.points) {
        const t = p.date.getTime();
        if (t >= zMin && t <= zMax && p.value > visibleMax) visibleMax = p.value;
      }
    }
    // If nothing falls into the zoom window (thin data), fall back to fullYMax to keep the axis sane
    const yTop = visibleMax > 0 ? visibleMax * 1.08 : fullYMax > 0 ? fullYMax * 1.08 : 1;
    return { xMin: zMin, xMax: zMax, yMin: 0, yMax: yTop };
  }, [zoom, fullXMin, fullXMax, fullYMax, series]);

  const x = (t: number) => PADDING.left + ((t - xMin) / (xMax - xMin)) * plotW;
  const y = (v: number) => PADDING.top + (1 - (v - yMin) / (yMax - yMin)) * plotH;

  const yTicks = useMemo(() => niceTicks(yMin, yMax, isMobile ? 4 : 5), [yMin, yMax, isMobile]);
  const xTicks = useMemo(
    () => timeTicks(new Date(xMin), new Date(xMax), isMobile ? 4 : 6),
    [xMin, xMax, isMobile]
  );

  // Build path strings for each series
  const paths = useMemo(() => {
    return series.map((s) => {
      const pts = s.points;
      if (pts.length === 0) return { key: s.key, d: '', s };
      const d = pts
        .map((p, i) => `${i === 0 ? 'M' : 'L'} ${x(p.date.getTime()).toFixed(2)} ${y(p.value).toFixed(2)}`)
        .join(' ');
      return { key: s.key, d, s };
    });
  }, [series, x, y]);

  // Hover: find nearest point per series based on mouse X
  const hover = useMemo(() => {
    if (hoverX === null) return null;
    if (hoverX < PADDING.left || hoverX > PADDING.left + plotW) return null;
    const tHover = xMin + ((hoverX - PADDING.left) / plotW) * (xMax - xMin);
    const perSeries = series
      .map((s) => {
        if (s.points.length === 0) return null;
        // Only consider points within the visible range for nearest-neighbor
        const visible = s.points.filter((p) => {
          const t = p.date.getTime();
          return t >= xMin && t <= xMax;
        });
        const pool = visible.length > 0 ? visible : s.points;
        let closest = pool[0];
        let bestDist = Math.abs(pool[0].date.getTime() - tHover);
        for (const p of pool) {
          const d = Math.abs(p.date.getTime() - tHover);
          if (d < bestDist) {
            bestDist = d;
            closest = p;
          }
        }
        return { series: s, point: closest };
      })
      .filter(Boolean) as { series: ChartSeries; point: ChartPoint }[];
    if (perSeries.length === 0) return null;
    const closestOverall = perSeries.reduce((a, b) =>
      Math.abs(a.point.date.getTime() - tHover) < Math.abs(b.point.date.getTime() - tHover) ? a : b
    );
    return { perSeries, guidelineDate: closestOverall.point.date };
  }, [hoverX, series, xMin, xMax, plotW]);

  const anySeriesHasPoints = series.some((s) => s.points.length > 0);

  // Zoom controls
  const zoomedIn = zoom !== null;
  const currentSpan = xMax - xMin;
  const canZoomIn = currentSpan / 2 >= MIN_VISIBLE_MS && anySeriesHasPoints;
  const canZoomOut = zoomedIn;

  const zoomIn = () => {
    const mid = (xMin + xMax) / 2;
    const q = currentSpan / 4;
    const newMin = Math.max(fullXMin, mid - q);
    const newMax = Math.min(fullXMax, mid + q);
    if (newMax - newMin < MIN_VISIBLE_MS) return;
    setZoom([newMin, newMax]);
  };
  const zoomOut = () => {
    const mid = (xMin + xMax) / 2;
    const newMin = Math.max(fullXMin, mid - currentSpan);
    const newMax = Math.min(fullXMax, mid + currentSpan);
    if (newMin <= fullXMin && newMax >= fullXMax) setZoom(null);
    else setZoom([newMin, newMax]);
  };
  const resetZoom = () => setZoom(null);

  /** Clamp an SVG x-coordinate to the plot area. */
  const clampToPlot = (px: number) =>
    Math.max(PADDING.left, Math.min(PADDING.left + plotW, px));

  /** Convert an SVG x-coordinate to a time in ms using the current x scale. */
  const xToTime = (px: number) =>
    xMin + ((clampToPlot(px) - PADDING.left) / plotW) * (xMax - xMin);

  const beginDrag = (px: number) => {
    const clamped = clampToPlot(px);
    setDrag({ startX: clamped, currentX: clamped });
    setHoverX(clamped);
  };
  const updateDrag = (px: number) => {
    const clamped = clampToPlot(px);
    setHoverX(clamped);
    setDrag((prev) => (prev ? { ...prev, currentX: clamped } : null));
  };
  const endDrag = () => {
    if (drag) {
      const dist = Math.abs(drag.currentX - drag.startX);
      if (dist >= DRAG_THRESHOLD) {
        const t1 = xToTime(drag.startX);
        const t2 = xToTime(drag.currentX);
        const [zMin, zMax] = t1 < t2 ? [t1, t2] : [t2, t1];
        if (zMax - zMin >= MIN_VISIBLE_MS) setZoom([zMin, zMax]);
      }
    }
    setDrag(null);
  };

  return (
    <div ref={containerRef} className="relative w-full select-none">
      {/* Zoom toolbar */}
      {anySeriesHasPoints && (
        <div className="absolute top-1 right-1 flex items-center gap-0.5 z-10">
          <button
            onClick={zoomIn}
            disabled={!canZoomIn}
            aria-label={t('chart.zoomIn')}
            title={t('chart.zoomIn')}
            className="btn-ghost !p-1.5 opacity-60 hover:opacity-100 disabled:opacity-25 disabled:cursor-not-allowed"
          >
            <ZoomIn size={13} />
          </button>
          <button
            onClick={zoomOut}
            disabled={!canZoomOut}
            aria-label={t('chart.zoomOut')}
            title={t('chart.zoomOut')}
            className="btn-ghost !p-1.5 opacity-60 hover:opacity-100 disabled:opacity-25 disabled:cursor-not-allowed"
          >
            <ZoomOut size={13} />
          </button>
          {zoomedIn && (
            <button
              onClick={resetZoom}
              aria-label={t('chart.resetZoom')}
              title={t('chart.resetZoom')}
              className="btn-ghost !p-1.5 opacity-60 hover:opacity-100"
            >
              <Maximize2 size={13} />
            </button>
          )}
        </div>
      )}

      {!anySeriesHasPoints ? (
        <div
          className="w-full flex items-center justify-center text-slate-500 text-sm"
          style={{ height: effectiveHeight }}
        >
          {t('chart.emptyState')}
        </div>
      ) : (
        <svg
          width={width}
          height={effectiveHeight}
          className="block touch-none cursor-crosshair"
          onMouseDown={(e) => {
            const rect = e.currentTarget.getBoundingClientRect();
            beginDrag(e.clientX - rect.left);
          }}
          onMouseMove={(e) => {
            const rect = e.currentTarget.getBoundingClientRect();
            const px = e.clientX - rect.left;
            if (drag) updateDrag(px);
            else setHoverX(px);
          }}
          onMouseUp={endDrag}
          onMouseLeave={() => {
            setHoverX(null);
            setDrag(null);
          }}
          onTouchStart={(e) => {
            const rect = e.currentTarget.getBoundingClientRect();
            beginDrag(e.touches[0].clientX - rect.left);
          }}
          onTouchMove={(e) => {
            const rect = e.currentTarget.getBoundingClientRect();
            updateDrag(e.touches[0].clientX - rect.left);
          }}
          onTouchEnd={() => {
            endDrag();
            setHoverX(null);
          }}
        >
          <defs>
            <clipPath id={`plot-${clipId}`}>
              <rect x={PADDING.left} y={PADDING.top} width={plotW} height={plotH} />
            </clipPath>
          </defs>

          {/* Y gridlines + labels */}
          {yTicks.map((t) => (
            <g key={`y-${t}`}>
              <line
                x1={PADDING.left}
                x2={PADDING.left + plotW}
                y1={y(t)}
                y2={y(t)}
                stroke="var(--chart-grid)"
              />
              <text
                x={PADDING.left - 8}
                y={y(t)}
                textAnchor="end"
                dominantBaseline="central"
                fill="var(--chart-text)"
                fontSize="11"
              >
                {formatCurrencyShort(t, currency, locale)}
              </text>
            </g>
          ))}

          {/* X ticks + labels */}
          {xTicks.map((d) => (
            <g key={`x-${d.getTime()}`}>
              <line
                x1={x(d.getTime())}
                x2={x(d.getTime())}
                y1={PADDING.top + plotH}
                y2={PADDING.top + plotH + 4}
                stroke="var(--chart-tick)"
              />
              <text
                x={x(d.getTime())}
                y={PADDING.top + plotH + 18}
                textAnchor="middle"
                fill="var(--chart-text)"
                fontSize="11"
              >
                {formatDateAxis(d, locale)}
              </text>
            </g>
          ))}

          {/* Clipped plot content: paths + dots */}
          <g clipPath={`url(#plot-${clipId})`}>
            {paths.map(({ key, d, s }) => (
              <path
                key={key}
                d={d}
                fill="none"
                stroke={s.color}
                strokeWidth={2}
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeDasharray={s.dashed ? '6 5' : undefined}
                opacity={s.dashed ? 0.9 : 1}
              />
            ))}

            {series.map((s) =>
              s.showDots
                ? s.points.map((p, i) => (
                    <circle
                      key={`${s.key}-dot-${i}`}
                      cx={x(p.date.getTime())}
                      cy={y(p.value)}
                      r={3.5}
                      fill="var(--chart-dot-inner)"
                      stroke={s.color}
                      strokeWidth={2}
                    />
                  ))
                : null
            )}

            {/* Brush-select band while dragging */}
            {drag && Math.abs(drag.currentX - drag.startX) >= 2 && (
              <rect
                x={Math.min(drag.startX, drag.currentX)}
                y={PADDING.top}
                width={Math.abs(drag.currentX - drag.startX)}
                height={plotH}
                fill="rgb(124, 92, 255)"
                fillOpacity={0.15}
                stroke="rgb(124, 92, 255)"
                strokeOpacity={0.4}
                strokeWidth={1}
                pointerEvents="none"
              />
            )}

            {/* Hover guideline + tooltip dots (clipped so they don't extend outside) */}
            {hover && (
              <>
                <line
                  x1={x(hover.guidelineDate.getTime())}
                  x2={x(hover.guidelineDate.getTime())}
                  y1={PADDING.top}
                  y2={PADDING.top + plotH}
                  stroke="var(--chart-guideline)"
                  strokeDasharray="3 3"
                />
                {hover.perSeries.map((h) => (
                  <circle
                    key={`hover-${h.series.key}`}
                    cx={x(h.point.date.getTime())}
                    cy={y(h.point.value)}
                    r={4.5}
                    fill={h.series.color}
                    stroke="var(--chart-dot-inner)"
                    strokeWidth={2}
                  />
                ))}
              </>
            )}
          </g>
        </svg>
      )}

      {/* Tooltip */}
      {hover && (
        <div
          className={`pointer-events-none absolute z-10 card p-2.5 sm:p-3 text-xs shadow-soft animate-fade-in ${
            isMobile ? 'min-w-[140px]' : 'min-w-[180px]'
          }`}
          style={{
            left: clampLeft(
              x(hover.guidelineDate.getTime()) + 12,
              width,
              isMobile ? 160 : 200
            ),
            top: 8,
          }}
        >
          <div className="text-slate-600 dark:text-slate-400 mb-1.5 font-medium">
            {formatDateFull(hover.guidelineDate, locale)}
          </div>
          {hover.perSeries.map((h) => (
            <div key={h.series.key} className="flex items-center justify-between gap-4 py-0.5">
              <span className="flex items-center gap-1.5 text-slate-700 dark:text-slate-300">
                <span
                  className="w-2 h-2 rounded-full"
                  style={{ backgroundColor: h.series.color }}
                />
                {h.series.label}
              </span>
              <span className="tabular-nums font-medium">
                {formatCurrency(h.point.value, currency, { locale })}
              </span>
            </div>
          ))}
        </div>
      )}

      {/* Legend */}
      <div className="flex items-center justify-end gap-4 mt-2 px-2">
        {series
          .filter((s) => s.points.length > 0)
          .map((s) => (
            <div key={s.key} className="flex items-center gap-1.5 text-xs text-slate-600 dark:text-slate-400">
              <span
                className="inline-block w-6 h-0.5 rounded"
                style={{
                  backgroundColor: s.color,
                  backgroundImage: s.dashed
                    ? `linear-gradient(to right, ${s.color} 60%, transparent 40%)`
                    : undefined,
                  backgroundSize: s.dashed ? '6px 100%' : undefined,
                }}
              />
              {s.label}
            </div>
          ))}
      </div>
    </div>
  );
}

function clampLeft(desired: number, width: number, tooltipWidth: number): number {
  const max = width - tooltipWidth - 8;
  return Math.max(8, Math.min(desired, max));
}

/** "Nice" round tick values covering [min, max] with ~n intervals. */
function niceTicks(min: number, max: number, targetCount: number): number[] {
  const range = niceNumber(max - min, false);
  const step = niceNumber(range / (targetCount - 1), true);
  const niceMin = Math.floor(min / step) * step;
  const niceMax = Math.ceil(max / step) * step;
  const ticks: number[] = [];
  for (let v = niceMin; v <= niceMax + 1e-9; v += step) ticks.push(Number(v.toFixed(6)));
  return ticks;
}

function niceNumber(x: number, round: boolean): number {
  if (x === 0) return 1;
  const exp = Math.floor(Math.log10(x));
  const f = x / Math.pow(10, exp);
  let nf: number;
  if (round) {
    if (f < 1.5) nf = 1;
    else if (f < 3) nf = 2;
    else if (f < 7) nf = 5;
    else nf = 10;
  } else {
    if (f <= 1) nf = 1;
    else if (f <= 2) nf = 2;
    else if (f <= 5) nf = 5;
    else nf = 10;
  }
  return nf * Math.pow(10, exp);
}

/** Evenly-spaced time ticks between two dates, snapped to month starts. */
function timeTicks(start: Date, end: Date, targetCount: number): Date[] {
  const startT = start.getTime();
  const endT = end.getTime();
  if (endT <= startT) return [start];
  const monthsSpan =
    (end.getFullYear() - start.getFullYear()) * 12 + (end.getMonth() - start.getMonth());
  const stepMonths = Math.max(1, Math.round(monthsSpan / (targetCount - 1)));
  const ticks: Date[] = [];
  const cursor = new Date(start.getFullYear(), start.getMonth(), 1);
  while (cursor.getTime() <= endT) {
    ticks.push(new Date(cursor));
    cursor.setMonth(cursor.getMonth() + stepMonths);
  }
  // Always include the final endpoint
  if (ticks[ticks.length - 1].getTime() < endT - 15 * MS_PER_DAY) {
    ticks.push(new Date(endT));
  }
  return ticks;
}
