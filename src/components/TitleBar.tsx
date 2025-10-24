import React, { useEffect } from "react";
import { getCurrentWindow } from "@tauri-apps/api/window";

type WindowLike = {
  minimize: () => Promise<void>;
  toggleMaximize: () => Promise<void>;
  close: () => Promise<void>;
  startDragging: () => Promise<void>;
};

export default function TitleBar() {
  const getAppWindowSafe = (): WindowLike => {
    try {
      return getCurrentWindow() as unknown as WindowLike;
    } catch {
      return {
        minimize: async () => {},
        toggleMaximize: async () => {},
        close: async () => {},
        startDragging: async () => {},
      };
    }
  };

  useEffect(() => {
    const handleMouseDown = (e: MouseEvent) => {
      // 如果点击在控制区，跳过拖拽
      const controls = document.getElementById("titlebar-controls");
      if (
        controls &&
        (e.target as HTMLElement)?.closest("#titlebar-controls")
      ) {
        return;
      }
      if (e.button === 0) {
        if (e.detail === 2) {
          getAppWindowSafe().toggleMaximize();
        } else {
          getAppWindowSafe().startDragging();
        }
      }
    };

    const titlebar = document.getElementById("titlebar");
    titlebar?.addEventListener("mousedown", handleMouseDown);

    return () => {
      titlebar?.removeEventListener("mousedown", handleMouseDown);
    };
  }, []);

  return (
    <div
      id="titlebar"
      className="h-[var(--titlebar-height)] w-full flex-shrink-0 flex items-center select-none"
      data-tauri-drag-region
    >
      <div className="flex-1 h-full" data-tauri-drag-region />
    </div>
  );
}
