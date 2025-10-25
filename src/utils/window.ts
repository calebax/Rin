// utils/window.ts
import { getCurrentWindow } from "@tauri-apps/api/window";

export function getCurrentWindowLabel(): string | undefined {
  const currentWindow = getCurrentWindow();
  return currentWindow.label;
}
