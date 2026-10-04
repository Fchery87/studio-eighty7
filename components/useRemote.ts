import { useCallback, useEffect, useState } from 'react';
import type { Remote } from '@/types';

export const useRemote = <T,>(fetcher: () => Promise<T>): [Remote<T>, () => void] => {
  const [remote, setRemote] = useState<Remote<T>>({ status: 'loading' });
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    let cancelled = false;
    setRemote({ status: 'loading' });
    fetcher()
      .then((data) => {
        if (!cancelled) setRemote({ status: 'ready', data });
      })
      .catch((error) => {
        console.warn('[WordPress]', error);
        if (!cancelled) setRemote({ status: 'error' });
      });
    return () => {
      cancelled = true;
    };
  }, [fetcher, attempt]);

  const retry = useCallback(() => setAttempt((n) => n + 1), []);
  return [remote, retry];
};
