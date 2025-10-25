import { useEventListener } from "ahooks";
import { useCallback } from "react";
import { getCurrentWindow } from "@tauri-apps/api/window";

/**
 * Hook: 给指定 class 的标题栏添加窗口拖拽和双击最大化功能
 * @param titlebarClass - 标题栏的 class 名称（不带 .）
 */
export const useWindowDragAndMaximize = (titlebarClass: string) => {
  const handleMouseDown = useCallback((e: MouseEvent) => {
    if (e.button !== 0) return;

    const window = getCurrentWindow();
    if (e.detail === 2) {
      window.toggleMaximize();
    } else {
      window.startDragging();
    }
  }, []);

  useEventListener("mousedown", handleMouseDown, {
    target: () => document.querySelector(`.${titlebarClass}`),
  });
};
