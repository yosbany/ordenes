import { useCallback, useRef } from 'react';

interface LongPressOptions {
  onLongPress: () => void;
  onEnd?: () => void;
  ms?: number;
}

export function useLongPress({ onLongPress, onEnd, ms = 500 }: LongPressOptions) {
  const timerRef = useRef<NodeJS.Timeout>();
  const isLongPress = useRef(false);

  const startPressTimer = useCallback(() => {
    isLongPress.current = false;
    timerRef.current = setTimeout(() => {
      isLongPress.current = true;
      onLongPress();
    }, ms);
  }, [onLongPress, ms]);

  const handleOnClick = useCallback((e: React.MouseEvent) => {
    if (isLongPress.current) {
      e.preventDefault();
      e.stopPropagation();
    }
  }, []);

  const handleOnMouseDown = useCallback(() => {
    startPressTimer();
  }, [startPressTimer]);

  const handleOnMouseUp = useCallback(() => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
    }
    if (isLongPress.current && onEnd) {
      onEnd();
    }
  }, [onEnd]);

  const handleOnTouchStart = useCallback(() => {
    startPressTimer();
  }, [startPressTimer]);

  const handleOnTouchEnd = useCallback(() => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
    }
    if (isLongPress.current && onEnd) {
      onEnd();
    }
  }, [onEnd]);

  return {
    onClick: handleOnClick,
    onMouseDown: handleOnMouseDown,
    onMouseUp: handleOnMouseUp,
    onTouchStart: handleOnTouchStart,
    onTouchEnd: handleOnTouchEnd,
    onMouseLeave: handleOnMouseUp,
    onTouchCancel: handleOnTouchEnd
  };
}