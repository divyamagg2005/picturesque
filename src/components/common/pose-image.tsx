"use client";

import Image from "next/image";
import { useState } from "react";

type PoseImageProps = {
  src: string;
  alt: string;
  sizes: string;
  eager?: boolean;
};

export function PoseImage({ src, alt, sizes, eager = false }: PoseImageProps) {
  const [failed, setFailed] = useState(false);

  if (failed) {
    return (
      <div aria-label={`${alt}. Reference image unavailable.`} className="image-fallback" role="img">
        <span>Reference image unavailable</span>
      </div>
    );
  }

  return (
    <Image
      alt={alt}
      className="pose-image"
      fill
      onError={() => setFailed(true)}
      loading={eager ? "eager" : "lazy"}
      sizes={sizes}
      src={src}
    />
  );
}