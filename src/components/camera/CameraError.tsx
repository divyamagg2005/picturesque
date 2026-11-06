import Link from "next/link";
import { Button } from "@/components/common/button";
import type { CameraErrorCode } from "@/lib/camera/camera-utils";

type CameraErrorProps = {
  errorCode: CameraErrorCode | null;
  message: string;
  onRetry: () => void;
};

export function CameraError({ errorCode, message, onRetry }: CameraErrorProps) {
  return (
    <div aria-live="assertive" className="camera-state-panel camera-error-panel" data-error-code={errorCode ?? undefined} role="alert">
      <p className="camera-state-kicker">Camera unavailable</p>
      <h2>The camera could not start.</h2>
      <p>{message}</p>
      <div className="camera-error-actions">
        <Button onClick={onRetry} type="button">Try again</Button>
        <Link className="camera-text-link" href="/explore">Back to poses</Link>
      </div>
    </div>
  );
}