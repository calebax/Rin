import React from "react";

// 在 Tauri v2 多 Webview 模式下，实际 Webview 由后端创建并附加到窗口。
// 该组件仅作为布局占位，提供容器样式，同时保留 props 以便调试或数据属性使用。
export default function BrowserView() {
  return <div className="webview-container" />;
}
