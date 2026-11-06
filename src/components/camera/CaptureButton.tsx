type CaptureButtonProps = {
  disabled?: boolean;
  onCapture: () => void;
};

export function CaptureButton({ disabled = false, onCapture }: CaptureButtonProps) {
  return (
    <button
      aria-label="Take photo"
      className="capture-button"
      disabled={disabled}
      onClick={onCapture}
      type="button"
    >
      <span aria-hidden="true" />
    </button>
  );
}