"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  deleteGalleryReference,
  readGalleryReference,
  saveGalleryReference,
} from "@/lib/camera/gallery-reference-storage";

export function GalleryReferenceAction() {
  const router = useRouter();
  const [savedName, setSavedName] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    let active = true;
    void readGalleryReference().then((reference) => {
      if (active) setSavedName(reference?.name ?? null);
    }).catch(() => {
      if (active) setMessage("Local gallery storage is unavailable in this browser.");
    });

    return () => {
      active = false;
    };
  }, []);

  async function handleSelect(file: File) {
    if (file.type && !file.type.startsWith("image/")) {
      setMessage("Choose an image file to use as your reference.");
      return;
    }

    setBusy(true);
    setMessage("");
    try {
      await saveGalleryReference(file);
      router.push("/camera");
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "The image could not be saved on this device.");
    } finally {
      setBusy(false);
    }
  }

  async function handleRemove() {
    setBusy(true);
    setMessage("");
    try {
      await deleteGalleryReference();
      setSavedName(null);
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "The saved image could not be removed.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="gallery-entry-action">
      <label className={`gallery-reference-picker${busy ? " is-busy" : ""}`}>
        <span>{busy ? "Saving reference..." : "Recreate from Gallery"}</span>
        <input
          accept="image/*"
          aria-label="Choose a reference image from your gallery"
          disabled={busy}
          onChange={(event) => {
            const file = event.currentTarget.files?.[0];
            if (file) void handleSelect(file);
            event.currentTarget.value = "";
          }}
          type="file"
        />
      </label>
      {savedName && (
        <div className="gallery-entry-saved">
          <span className="gallery-entry-name" title={savedName}>Saved: {savedName}</span>
          <button className="gallery-reference-remove" disabled={busy} onClick={() => void handleRemove()} type="button">
            Remove
          </button>
        </div>
      )}
      {message && <p className="gallery-entry-message" role="status">{message}</p>}
    </div>
  );
}