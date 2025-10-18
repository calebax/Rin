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

  const minimizeWindow = () => {
    console.log("Minimizing window...");
    getAppWindowSafe().minimize();
    console.log("Window minimized.");
  };

  const maximizeWindow = () => {
    console.log("Toggling maximize window...");
    getAppWindowSafe().toggleMaximize();
    console.log("Window maximize toggled.");
  };

  const closeWindow = () => {
    console.log("Closing window...");
    getAppWindowSafe().close();
    console.log("Window closed.");
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
      <div
        id="titlebar-controls"
        className="flex items-center h-full gap-2 pl-4 group"
      >
        {/* 红色关闭 */}
        <div
          className="relative w-3 h-3 rounded-full bg-[#ff605c] cursor-pointer"
          onClick={closeWindow}
        >
          <span className="absolute inset-0 flex items-center justify-center text-black text-[8px] opacity-0 group-hover:opacity-100 transition-opacity duration-200">
            ✕
          </span>
        </div>

        {/* 黄色最小化 */}
        <div
          className="relative w-3 h-3 rounded-full bg-[#ffbd44] cursor-pointer"
          onClick={minimizeWindow}
        >
          <span className="absolute inset-0 flex items-center justify-center text-black text-[8px] opacity-0 group-hover:opacity-100 transition-opacity duration-200">
            ―
          </span>
        </div>

        {/* 绿色最大化 */}
        <div
          className="relative w-3 h-3 rounded-full bg-[#00ca4e] cursor-pointer"
          onClick={maximizeWindow}
        >
          <span className="absolute inset-0 flex items-center justify-center text-black text-[8px] opacity-0 group-hover:opacity-100 transition-opacity duration-200">
            ⬜
          </span>
        </div>
      </div>

      <div className="flex-1 h-full" data-tauri-drag-region />
    </div>
  );
}
