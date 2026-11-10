import { useEffect, useState } from 'react';

export const useRejectionPresentation = ({ stage, arLastWhisper, rejectedSpeechText, rejectionEventId, rejectFlashVisible }) => {
  const [speech, setSpeech] = useState({ event: 0, stage, baseline: arLastWhisper, text: "" });
  const [paintedEvent, setPaintedEvent] = useState(0);
  let current = speech;
  if (rejectionEventId !== speech.event) {
    current = { event: rejectionEventId, stage, baseline: arLastWhisper, text: rejectedSpeechText };
    setSpeech(current);
  } else if (speech.text && ((stage === 1 && speech.stage !== 1) || arLastWhisper !== speech.baseline)) {
    current = { ...speech, baseline: arLastWhisper, text: "" };
    setSpeech(current);
  }
  const arSpeechText = current.text || arLastWhisper;
  useEffect(() => {
    if (!rejectFlashVisible || !rejectedSpeechText || !rejectionEventId) return undefined;
    let secondFrame;
    // The first callback runs before paint; the second follows the bubble's paint.
    const firstFrame = window.requestAnimationFrame(() => {
      secondFrame = window.requestAnimationFrame(() => setPaintedEvent(rejectionEventId));
    });
    return () => {
      window.cancelAnimationFrame(firstFrame);
      if (secondFrame !== undefined) window.cancelAnimationFrame(secondFrame);
    };
  }, [rejectionEventId, rejectedSpeechText, rejectFlashVisible]);
  return { arSpeechText, intentRejectVisible: rejectFlashVisible && paintedEvent === rejectionEventId && Boolean(arSpeechText) };
};
