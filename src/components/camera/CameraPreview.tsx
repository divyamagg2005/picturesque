import Image from "next/image";

type CameraPreviewProps = {
  src: string;
};

export function CameraPreview({ src }: CameraPreviewProps) {
  return (
    <Image
      alt="Captured photograph"
      className="captured-photo-image"
      fill
      loading="eager"
      sizes="(max-width: 760px) 100vw, 560px"
      src={src}
      unoptimized
    />
  );
}