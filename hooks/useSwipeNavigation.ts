"use client";

import { useRef, useCallback } from "react";

const SWIPE_THRESHOLD = 50;
const MAX_VERTICAL_DRIFT = 80;

export function useSwipeNavigation({
  onPrevious,
  onNext,
  enabled = true,
}: {
  onPrevious: () => void;
  onNext: () => void;
  enabled?: boolean;
}) {
  const touchStart = useRef<{ x: number; y: number } | null>(null);

  const onTouchStart = useCallback(
    (e: React.TouchEvent) => {
      if (!enabled) return;
      const t = e.touches[0];
      touchStart.current = { x: t.clientX, y: t.clientY };
    },
    [enabled]
  );

  const onTouchEnd = useCallback(
    (e: React.TouchEvent) => {
      if (!enabled || !touchStart.current) return;

      const t = e.changedTouches[0];
      const deltaX = t.clientX - touchStart.current.x;
      const deltaY = t.clientY - touchStart.current.y;
      touchStart.current = null;

      if (Math.abs(deltaY) > MAX_VERTICAL_DRIFT) return;
      if (Math.abs(deltaX) < SWIPE_THRESHOLD) return;

      if (deltaX < 0) onNext();
      else onPrevious();
    },
    [enabled, onNext, onPrevious]
  );

  return { onTouchStart, onTouchEnd };
}
