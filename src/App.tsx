import { useEffect } from "react";
import { invoke } from "@tauri-apps/api/core";
import TitleBar from "@/components/sidebar/TitleBar";
import TabList from "@/components/sidebar/TabList";
import WebviewContainer from "@/components/webview/WebviewContainer";

export default function App() {
  useEffect(() => {
    // 从后端获取侧栏宽度并更新 CSS 变量；非 Tauri 环境下静默失败，使用默认值
    (async () => {
      try {
        const width = await invoke<number>("get_sidebar_width_cmd", {
          windowLabel: "main",
        });
        if (typeof width === "number" && !Number.isNaN(width)) {
          document.documentElement.style.setProperty(
            "--sidebar-width",
            `${Math.round(width)}px`
          );
        }
      } catch {
        // 预览环境（非 Tauri）忽略错误，沿用默认 --sidebar-width
      }
    })();
  }, []);

  return (
    <div className="relative w-full h-full flex flex-col overflow-hidden shadow-lg">
      <TitleBar />
      {/* WebviewContainer 无需传参，内部管理 Webview 的绝对定位 */}
      <TabList />
      <WebviewContainer />
    </div>
  );
}
