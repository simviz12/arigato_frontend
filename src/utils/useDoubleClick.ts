import { useCallback, useRef } from 'react';

/**
 * Custom hook to detect a double click or double tap within a specific timeframe.
 * This is much more reliable on touch devices (POS terminals, iPads) than the native onDoubleClick.
 */
export function useDoubleClick(callback: () => void, delay: number = 400) {
  const lastClickTime = useRef(0);

  return useCallback((e: React.MouseEvent | React.TouchEvent) => {
    e.preventDefault(); // Prevent default double-tap zoom behavior on iOS if needed
    const currentTime = new Date().getTime();
    const timeDiff = currentTime - lastClickTime.current;

    if (timeDiff < delay) {
      callback();
      lastClickTime.current = 0; // Reset to prevent triple-clicks firing twice
    } else {
      lastClickTime.current = currentTime;
    }
  }, [callback, delay]);
}
