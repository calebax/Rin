import { useEffect, useState } from "react";
import { invoke } from "@tauri-apps/api/core";
import { getCurrentWindowLabel } from "@/utils/window";
import { CMD } from "@/constants/cmd";

export function useSidebarWidth(
  windowLabel = getCurrentWindowLabel(),
  defaultWidth = 220
) {
  const [width, setWidth] = useState<number>(defaultWidth);

  // 私有函数：统一设置宽度
  const applyWidth = (w: number) => {
    const rounded = Math.round(w);
    document.documentElement.style.setProperty(
      "--sidebar-width",
      `${rounded}px`
    );
    return rounded;
  };

  useEffect(() => {
    const fetchWidth = async () => {
      try {
        const w = await invoke<number>(CMD.WINDOW_GET_SIDEBAR_WIDTH, {
          windowLabel,
        });
        if (typeof w === "number" && !Number.isNaN(w)) {
          const rounded = applyWidth(w);
          setWidth(rounded);
        }
      } catch {
        // 非 Tauri 环境或异常，使用默认值
        const rounded = applyWidth(defaultWidth);
        setWidth(rounded);
      }
    };

    fetchWidth();
  }, [windowLabel, defaultWidth]);

  const setSidebarWidth = (w: number) => {
    const rounded = applyWidth(w);
    if (rounded === width) return;
    setWidth(rounded);
    console.log("设置侧栏宽度为:", rounded);
  };

  return { width, setSidebarWidth };
}
