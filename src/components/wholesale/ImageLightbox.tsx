"use client";

import React, { useCallback, useEffect, useRef } from "react";
import { X } from "lucide-react";

interface ImageLightboxProps {
  images: string[];
  index: number | null;
  onIndexChange: (index: number | null) => void;
}

export const ImageLightbox: React.FC<ImageLightboxProps> = ({
  images,
  index,
  onIndexChange,
}) => {
  const closeRef = useRef<HTMLButtonElement>(null);
  const isOpen = index !== null && images[index] !== undefined;

  const step = useCallback(
    (delta: number) => {
      if (index === null) return;
      onIndexChange((index + delta + images.length) % images.length);
    },
    [index, images.length, onIndexChange]
  );

  useEffect(() => {
    if (!isOpen) return;

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") onIndexChange(null);
      if (event.key === "ArrowLeft") step(-1);
      if (event.key === "ArrowRight") step(1);
    };

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    document.addEventListener("keydown", onKeyDown);
    closeRef.current?.focus();

    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [isOpen, onIndexChange, step]);

  if (!isOpen || index === null) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={`Photo ${index + 1} of ${images.length}`}
      className="fixed inset-0 z-[60] flex items-center justify-center bg-slate-950/85 p-4"
      onClick={() => onIndexChange(null)}
    >
      <button
        ref={closeRef}
        type="button"
        onClick={() => onIndexChange(null)}
        aria-label="Close photo"
        className="absolute top-4 right-4 p-2 rounded-full bg-white/10 hover:bg-white/20 text-white cursor-pointer"
      >
        <X className="w-5 h-5" />
      </button>

      {images.length > 1 && (
        <>
          <button
            type="button"
            onClick={(event) => {
              event.stopPropagation();
              step(-1);
            }}
            aria-label="Previous photo"
            className="absolute left-3 sm:left-6 w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 text-white text-2xl leading-none cursor-pointer"
          >
            &lsaquo;
          </button>
          <button
            type="button"
            onClick={(event) => {
              event.stopPropagation();
              step(1);
            }}
            aria-label="Next photo"
            className="absolute right-3 sm:right-6 w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 text-white text-2xl leading-none cursor-pointer"
          >
            &rsaquo;
          </button>
        </>
      )}

      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={images[index]}
        alt={`Listing photo ${index + 1}`}
        onClick={(event) => event.stopPropagation()}
        className="max-w-full max-h-[90vh] object-contain rounded-xl"
      />

      <p className="absolute bottom-4 left-1/2 -translate-x-1/2 text-xs font-bold text-white/80">
        {index + 1} / {images.length}
      </p>
    </div>
  );
};
