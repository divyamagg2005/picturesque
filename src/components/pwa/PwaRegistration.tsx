"use client";

import { useEffect, useRef, useState } from "react";

export function PwaRegistration() {
  const [isVisible, setIsVisible] = useState(false);
  const promptRef = useRef<BeforeInstallPromptEvent | null>(null);

  useEffect(() => {
    if (!("serviceWorker" in navigator)) return;

    navigator.serviceWorker.register("/sw.js").catch((error) => {
      console.error("Service worker registration failed", error);
    });

    const handleBeforeInstallPrompt = (event: Event) => {
      event.preventDefault();
      promptRef.current = event as BeforeInstallPromptEvent;
      setIsVisible(true);
    };

    window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
    return () => {
      window.removeEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
    };
  }, []);

  async function handleInstall() {
    if (!promptRef.current) return;

    promptRef.current.prompt();
    const choice = await promptRef.current.userChoice;
    if (choice.outcome === "accepted") {
      setIsVisible(false);
    }
    promptRef.current = null;
    setIsVisible(false);
  }

  if (!isVisible) return null;

  return (
    <div className="pwa-install-banner" role="status" aria-live="polite">
      <span>Install Picturesque on your home screen.</span>
      <button type="button" onClick={handleInstall}>Install</button>
    </div>
  );
}

type BeforeInstallPromptEvent = Event & {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed"; platform: string }>;
};
