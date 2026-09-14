import { useCallback, useEffect, useState } from 'react';
import { normalizeStage } from '../config/runtimeUrls.js';

export const PRESENTATION_STAGES = [1, 2, 4, 5, 6, 7, 8, 9, 10, 21, 22, 23, 24];
const readStage = () => normalizeStage(new URLSearchParams(window.location.search).get('stage'));

export function usePresentationStage(backendStage) {
  const [manualStage, setManualStage] = useState(readStage);
  const stage = manualStage ?? backendStage;
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

  useEffect(() => {
    const readLocation = () => setManualStage(readStage());
    const onKey = (event) => {
      if (event.ctrlKey || event.metaKey || event.altKey || event.target.closest('input, textarea, select, [contenteditable="true"]')) return;
      if (event.key === 'ArrowLeft') { event.preventDefault(); moveStage(-1); }
      if (event.key === 'ArrowRight') { event.preventDefault(); moveStage(1); }
      if (event.key === 'Home') { event.preventDefault(); selectStage(1); }
    };
    window.addEventListener('popstate', readLocation);
    window.addEventListener('keydown', onKey);
    return () => {
      window.removeEventListener('popstate', readLocation);
      window.removeEventListener('keydown', onKey);
    };
  }, [moveStage, selectStage]);

  return { stage, followingBackend: manualStage === null, selectStage, moveStage };
}
