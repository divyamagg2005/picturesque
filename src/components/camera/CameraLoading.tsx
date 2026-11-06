import { Button } from "@/components/common/button";

type CameraLoadingProps = {
  requesting: boolean;
  onStart: () => void;
};

export function CameraLoading({ requesting, onStart }: CameraLoadingProps) {
  return (
    <div className="camera-state-panel" role="status">
      <p className="camera-state-kicker">On-device camera</p>
      <h2>{requesting ? "Starting your camera" : "Ready when you are"}</h2>
      <p>
        {requesting
          ? "Allow camera access in your browser to continue."
          : "Your camera stays on this device. Nothing is uploaded."}
      </p>
      {!requesting && (
        <Button onClick={onStart} type="button">Enable camera</Button>
      )}
    </div>
  );
}