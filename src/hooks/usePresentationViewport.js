import { useLayoutEffect, useRef, useState } from 'react';

export function usePresentationViewport() {
  const viewportRef = useRef(null);
  const [layout, setLayout] = useState({ scale: 1, width: 1920, height: 1080, left: 0, top: 0 });
  const scaleRef = useRef(1);

  const readScroll = () => {
    const element = viewportRef.current;
    if (!element) return;
    setLayout({ scale: scaleRef.current, width: element.clientWidth, height: element.clientHeight, left: element.scrollLeft, top: element.scrollTop });
  };

  useLayoutEffect(() => {
    let deviceScale = window.devicePixelRatio || 1;
    let frame;
    try {
      const key = `presentation-device-scale:${screen.width}x${screen.height}`;
      const saved = Number(sessionStorage.getItem(key));
      if (saved > 0 && Number.isFinite(saved)) deviceScale = saved;
      else sessionStorage.setItem(key, String(deviceScale));
    } catch { /* Browser storage is optional. */ }
    const resize = () => {
      const bounds = viewportRef.current.getBoundingClientRect();
      // Account for both CSS viewport size and DPR so fitting cannot cancel
      // the user's native browser zoom. No keyboard or wheel interception.
      scaleRef.current = Math.min(bounds.width / 1920, bounds.height / 1080) * (window.devicePixelRatio || 1) / deviceScale;
      readScroll();
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(readScroll);
    };
    const observer = new ResizeObserver(resize);
    observer.observe(viewportRef.current);
    window.addEventListener('resize', resize);
    resize();
    return () => {
      observer.disconnect();
      cancelAnimationFrame(frame);
      window.removeEventListener('resize', resize);
    };
  }, []);

  const { scale, width, height, left, top } = layout;
  return {
    viewportRef, scale, readScroll,
    backgroundStyle: {
      backgroundSize: `${3840 * scale}px ${2160 * scale}px`,
      backgroundPosition: `${Math.max(0, (width - 1920 * scale) / 2) - left}px ${Math.max(0, (height - 1080 * scale) / 2) - top}px`,
    },
  };
}
