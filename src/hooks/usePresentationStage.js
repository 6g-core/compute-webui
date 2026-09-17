import { useCallback, useEffect, useState } from 'react';
import { normalizeStage } from '../config/runtimeUrls.js';

export const PRESENTATION_STAGES = [1, 2, 4, 5, 6, 7, 8, 9, 10, 21, 22, 23, 24];
const readStage = () => normalizeStage(new URLSearchParams(window.location.search).get('stage'));

export function usePresentationStage(backendStage) {
  const [manualStage, setManualStage] = useState(readStage);

  useEffect(() => {
    const readLocation = () => setManualStage(readStage());
    window.addEventListener('popstate', readLocation);
    return () => {
      window.removeEventListener('popstate', readLocation);
    };
  }, []);

  const raw = manualStage ?? backendStage ?? 1;
  const stage = (raw === 2 || raw === 4) ? 4 : raw;

  const selectStage = useCallback((value) => {
    const nextStage = normalizeStage(value);
    const url = new URL(window.location.href);
    if (nextStage === null) url.searchParams.delete('stage');
    else url.searchParams.set('stage', String(nextStage));
    window.history.replaceState(null, '', url);
    setManualStage(nextStage);
  }, []);

  const moveStage = useCallback((offset) => {
    const current = PRESENTATION_STAGES.indexOf(stage);
    selectStage(PRESENTATION_STAGES[Math.max(0, Math.min(PRESENTATION_STAGES.length - 1, current + offset))]);
  }, [stage, selectStage]);

  return {
    stage,
    followingBackend: manualStage === null,
    selectStage,
    moveStage,
  };
}
