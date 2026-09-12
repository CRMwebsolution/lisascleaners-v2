"use client";

import { useCallback, useEffect, useRef, useState } from "react";

export default function BeforeAfterSlider({
  beforeUrl,
  afterUrl,
  alt,
}: {
  beforeUrl: string;
  afterUrl: string;
  alt: string;
}) {
  const [sliderPosition, setSliderPosition] = useState(50);
  const [isDragging, setIsDragging] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const handleMove = useCallback((clientX: number) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = clientX - rect.left;
    const percentage = Math.max(0, Math.min(100, (x / rect.width) * 100));
    setSliderPosition(percentage);
  }, []);

  const handleMouseMove = useCallback((event: MouseEvent) => {
    if (isDragging) handleMove(event.clientX);
  }, [handleMove, isDragging]);

  const handleTouchMove = useCallback((event: TouchEvent) => {
    if (isDragging && event.touches[0]) handleMove(event.touches[0].clientX);
  }, [handleMove, isDragging]);

  useEffect(() => {
    if (!isDragging) return;
    const stop = () => setIsDragging(false);
    document.addEventListener("mousemove", handleMouseMove);
    document.addEventListener("touchmove", handleTouchMove, { passive: true });
    document.addEventListener("mouseup", stop);
    document.addEventListener("touchend", stop);
    return () => {
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("touchmove", handleTouchMove);
      document.removeEventListener("mouseup", stop);
      document.removeEventListener("touchend", stop);
    };
  }, [handleMouseMove, handleTouchMove, isDragging]);

  return (
    <div
      ref={containerRef}
      className="relative aspect-[4/3] w-full cursor-col-resize select-none overflow-hidden rounded-2xl"
      onMouseDown={() => setIsDragging(true)}
      onTouchStart={() => setIsDragging(true)}
      onClick={(event) => handleMove(event.clientX)}
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={afterUrl} alt={`${alt} after`} className="absolute inset-0 h-full w-full object-cover" draggable={false} />
      <div className="absolute inset-0 overflow-hidden" style={{ clipPath: `inset(0 ${100 - sliderPosition}% 0 0)` }}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={beforeUrl} alt={`${alt} before`} className="absolute inset-0 h-full w-full object-cover" draggable={false} />
      </div>
      <div className="pointer-events-none absolute top-0 bottom-0 z-10 w-1 bg-white shadow-[0_0_10px_rgba(255,255,255,0.9)]" style={{ left: `${sliderPosition}%` }}>
        <div className="absolute -left-4 top-1/2 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full border-4 border-white bg-white shadow-xl">
          <span className="text-lg font-bold text-purple-mid">⇄</span>
        </div>
      </div>
      <span className="pointer-events-none absolute left-3 top-3 z-20 rounded-full bg-black/70 px-3 py-1 text-xs text-white">BEFORE</span>
      <span className="pointer-events-none absolute right-3 top-3 z-20 rounded-full bg-black/70 px-3 py-1 text-xs text-white">AFTER</span>
    </div>
  );
}
