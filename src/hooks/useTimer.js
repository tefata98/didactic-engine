import { useState, useRef, useCallback, useEffect } from 'react';
import { formatDuration } from '../utils/dateHelpers';

export default function useTimer(initialSeconds = 0, { countdown = false, onComplete } = {}) {
  const [time, setTime] = useState(initialSeconds);
  const [isRunning, setIsRunning] = useState(false);
  const intervalRef = useRef(null);
  const onCompleteRef = useRef(onComplete);
  onCompleteRef.current = onComplete;

  const clear = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  }, []);

  const start = useCallback(() => {
    clear();
    setIsRunning(true);
    intervalRef.current = setInterval(() => {
      setTime(prev => {
        if (countdown) {
          if (prev <= 1) {
            clearInterval(intervalRef.current);
            intervalRef.current = null;
            setIsRunning(false);
            onCompleteRef.current?.();
            return 0;
          }
          return prev - 1;
        }
        return prev + 1;
      });
    }, 1000);
  }, [countdown, clear]);

  const pause = useCallback(() => {
    clear();
    setIsRunning(false);
  }, [clear]);

  const reset = useCallback((newTime) => {
    clear();
    setIsRunning(false);
    setTime(newTime !== undefined ? newTime : initialSeconds);
  }, [clear, initialSeconds]);

  useEffect(() => clear, [clear]);

  return {
    time,
    isRunning,
    start,
    pause,
    reset,
    formatted: formatDuration(time),
  };
}
