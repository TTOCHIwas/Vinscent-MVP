
import { useState, useEffect, useRef, useCallback, useMemo } from 'react';

export interface SlideTimerState {
  isRunning: boolean;
  isPaused: boolean;
  currentProgress: number; // 0-100 percentage
  elapsedTime: number; // milliseconds
  remainingTime: number; // milliseconds
}

export interface SlideTimerActions {
  start: () => void;
  pause: () => void;
  resume: () => void;
  reset: () => void;
  resetImmediate: () => void;
  stop: () => void;
}

export interface UseSlideTimerOptions {
  interval: number; // milliseconds
  onComplete?: () => void;
  autoStart?: boolean;
  enabled?: boolean;
}

export interface UseSlideTimerReturn {
  state: SlideTimerState;
  actions: SlideTimerActions;
}

export const useSlideTimer = ({
  interval,
  onComplete,
  autoStart = false,
  enabled = true,
}: UseSlideTimerOptions): UseSlideTimerReturn => {
  const [isRunning, setIsRunning] = useState(autoStart && enabled);
  const [isPaused, setIsPaused] = useState(false);
  const [elapsedTime, setElapsedTime] = useState(0);

  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const startTimeRef = useRef<number>(0);
  const pausedTimeRef = useRef<number>(0);
  const lastUpdateRef = useRef<number>(0);

  const currentProgress = Math.min((elapsedTime / interval) * 100, 100);
  const remainingTime = Math.max(interval - elapsedTime, 0);

  const clearTimer = useCallback(() => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
  }, []);

  const start = useCallback(() => {
    if (!enabled) return;
    
    clearTimer();
    setIsRunning(true);
    setIsPaused(false);
    
    startTimeRef.current = Date.now();
    lastUpdateRef.current = Date.now();
    
    timerRef.current = setInterval(() => {
      const now = Date.now();
      const totalElapsed = now - startTimeRef.current - pausedTimeRef.current;
      
      setElapsedTime(totalElapsed);
      lastUpdateRef.current = now;
      
      // 완료 체크
      if (totalElapsed >= interval) {
        clearTimer();
        setIsRunning(false);
        setElapsedTime(interval); // 정확히 100%로 설정
        onComplete?.();
      }
    }, 16); // 60fps for smooth progress
  }, [enabled, interval, onComplete, clearTimer]);

  const pause = useCallback(() => {
    if (!isRunning || isPaused) return;
    
    clearTimer();
    setIsPaused(true);
    
    const pauseStartTime = Date.now();
    pausedTimeRef.current += 0; // 아직 추가하지 않음 (resume에서 계산)
    lastUpdateRef.current = pauseStartTime;
  }, [isRunning, isPaused, clearTimer]);

  const resume = useCallback(() => {
    if (!isPaused || !enabled) return;
    
    setIsPaused(false);
    
    const pauseDuration = Date.now() - lastUpdateRef.current;
    pausedTimeRef.current += pauseDuration;
    
    timerRef.current = setInterval(() => {
      const now = Date.now();
      const totalElapsed = now - startTimeRef.current - pausedTimeRef.current;
      
      setElapsedTime(totalElapsed);
      lastUpdateRef.current = now;
      
      if (totalElapsed >= interval) {
        clearTimer();
        setIsRunning(false);
        setElapsedTime(interval);
        onComplete?.();
      }
    }, 16);
  }, [isPaused, enabled, interval, onComplete, clearTimer]);

  const reset = useCallback(() => {
    clearTimer();
    setElapsedTime(0);
    setIsRunning(false);
    setIsPaused(false);
    startTimeRef.current = 0;
    pausedTimeRef.current = 0;
    lastUpdateRef.current = 0;
  }, [clearTimer]);

  const resetImmediate = useCallback(() => {
    clearTimer();
    setElapsedTime(0); // 즉시 0으로 설정
    setIsRunning(false);
    setIsPaused(false);
    startTimeRef.current = 0;
    pausedTimeRef.current = 0;
    lastUpdateRef.current = 0;
  }, [clearTimer]);

  const stop = useCallback(() => {
    clearTimer();
    setIsRunning(false);
    setIsPaused(false);
  }, [clearTimer]);

  useEffect(() => {
    if (!enabled && isRunning) {
      stop();
    }
  }, [enabled, isRunning, stop]);

  useEffect(() => {
    return () => {
      clearTimer();
    };
  }, [clearTimer]);

  useEffect(() => {
    if (autoStart && enabled && !isRunning && !isPaused) {
      start();
    }
  }, [autoStart, enabled, isRunning, isPaused, start]);

  const state: SlideTimerState = {
    isRunning,
    isPaused,
    currentProgress,
    elapsedTime,
    remainingTime,
  };

  const actions: SlideTimerActions = useMemo(() => ({
    start,
    pause,
    resume,
    reset,
    resetImmediate,
    stop,
  }), [start, pause, resume, reset, resetImmediate, stop]);

  return { state, actions };
};

export interface UseSlideCarouselOptions {
  slidesCount: number;
  interval: number;
  onSlideChange?: (newIndex: number, direction: 'next' | 'prev') => void;
  autoStart?: boolean;
  enabled?: boolean;
  currentIndex?: number;
}

export interface UseSlideCarouselReturn extends UseSlideTimerReturn {
  currentIndex: number;
  goToNext: () => void;
  goToPrev: () => void;
  goToSlide: (index: number) => void;
}

export const useSlideCarousel = ({
  slidesCount,
  interval,
  onSlideChange,
  autoStart = true,
  enabled = true,
  currentIndex: externalIndex,
}: UseSlideCarouselOptions): UseSlideCarouselReturn => {
  const [internalIndex, setInternalIndex] = useState(0);
  const currentIndex = externalIndex ?? internalIndex;
  
  const prevIndexRef = useRef(-1); // 초기값을 -1로 설정하여 첫 렌더링에서도 리셋 수행

  const goToNext = useCallback(() => {
    const newIndex = (currentIndex + 1) % slidesCount;
    if (externalIndex === undefined) {
      setInternalIndex(newIndex);
    }
    onSlideChange?.(newIndex, 'next');
  }, [currentIndex, slidesCount, onSlideChange, externalIndex]);

  const goToPrev = useCallback(() => {
    const newIndex = currentIndex === 0 ? slidesCount - 1 : currentIndex - 1;
    if (externalIndex === undefined) {
      setInternalIndex(newIndex);
    }
    onSlideChange?.(newIndex, 'prev');
  }, [currentIndex, slidesCount, onSlideChange, externalIndex]);

  const goToSlide = useCallback((index: number) => {
    if (index >= 0 && index < slidesCount) {
      if (externalIndex === undefined) {
        setInternalIndex(index);
      }
      onSlideChange?.(index, index > currentIndex ? 'next' : 'prev');
    }
  }, [currentIndex, slidesCount, onSlideChange, externalIndex]);

  const timer = useSlideTimer({
    interval,
    onComplete: goToNext,
    autoStart: autoStart && slidesCount > 1,
    enabled: enabled && slidesCount > 1,
  });

  useEffect(() => {
    if (prevIndexRef.current !== currentIndex) {
      timer.actions.resetImmediate();
      prevIndexRef.current = currentIndex;
    }
    
    if (enabled && slidesCount > 1) {
      const startTimer = setTimeout(() => {
        timer.actions.start();
      }, 16); // 16ms 지연으로 더 안정적
      
      return () => clearTimeout(startTimer);
    }
  }, [currentIndex, enabled, slidesCount]); // 안전한 의존성 배열

  return {
    ...timer,
    currentIndex,
    goToNext,
    goToPrev,
    goToSlide,
  };
};

export default useSlideTimer;