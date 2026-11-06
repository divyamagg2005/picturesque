"use client";

import Image from "next/image";
import { useState } from "react";

type ReferenceImageOverlayProps = {
  src: string;
  alt: string;
  opacity: number;
  scale: number;
  offsetX: number;
  offsetY: number;
  mirrored: boolean;
};

export function ReferenceImageOverlay({
  src,
  alt,
  opacity,
  scale,
  offsetX,
  offsetY,
  mirrored,
}: ReferenceImageOverlayProps) {
  const [failed, setFailed] = useState(false);

  if (failed) {
    return (
      <div aria-hidden="true" className="reference-image-fallback" style={{ opacity }}>
        Reference image unavailable
      </div>
    );
  }

  return (
    <div
      aria-hidden="true"
      className="reference-image-overlay"
      style={{
        height: `${scale * 100}%`,
        left: `calc(50% + ${offsetX * 100}%)`,
        opacity,
        top: `calc(50% + ${offsetY * 100}%)`,
        transform: `translate(-50%, -50%) scaleX(${mirrored ? -1 : 1})`,
        width: `${scale * 100}%`,
      }}
    >
      <Image
        alt={alt}
        className="reference-image-overlay-img"
        fill
        onError={() => setFailed(true)}
        sizes="(max-width: 760px) 100vw, 560px"
        src={src}
      />
    </div>
  );
}