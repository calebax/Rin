import React, { useState, useEffect } from "react";
import { invoke } from "@tauri-apps/api/core";
import { listen } from "@tauri-apps/api/event";

export type TabItem = {
  id: string;
  title: string;
  url: string;
};

export default function TabList() {
  const [tabs, setTabs] = useState<TabItem[]>([]);
  const [activeId, setActiveId] = useState<string | null>(null);

  // 创建新标签
  const addTab = async (
    url = "https://www.google.com.hk/",
    title = "New Tab"
  ) => {
    const tabId: string = await invoke("create_tab", {
      windowLabel: "main",
      url,
      title,
    });
    setTabs((prev) => [...prev, { id: tabId, title, url }]);
    await invoke("switch_tab", { windowLabel: "main", tabId });
    setActiveId(tabId);
  };

  // 关闭标签
  const removeTab = async (id: string) => {
    await invoke("close_tab", { windowLabel: "main", tabId: id });

    setTabs((prev) => prev.filter((t) => t.id !== id));
    setActiveId((curr) => {
      if (curr === id) {
        const first = tabs.find((t) => t.id !== id);
        return first ? first.id : null;
      }
      return curr;
    });
  };

  // 切换标签
  const selectTab = async (id: string) => {
    await invoke("switch_tab", { windowLabel: "main", tabId: id });
    setActiveId(id);
  };

  // 初始化：创建首页 & 监听标题变化（Tauri）
  useEffect(() => {
    let unlisten: (() => void) | null = null;
    (async () => {
      try {
        const off = await listen("tauri://webview/title-changed", (event) => {
          const payload = event.payload as { tabId: string; title: string };
          setTabs((prev) =>
            prev.map((t) =>
              t.id === payload.tabId ? { ...t, title: payload.title } : t
            )
          );
        });
        unlisten = off;
      } catch {
        // 非 Tauri 环境（预览），跳过事件监听
      }
    })();

    return () => {
      if (unlisten) unlisten();
    };
  }, []);

  return (
    <aside
      className="absolute left-0 bottom-0 backdrop-blur-md overflow-y-auto overflow-x-hidden flex-shrink-0"
      style={{ top: "var(--titlebar-height)", width: "var(--sidebar-width)" }}
    >
      <div className="px-4 py-4 min-h-full">
        <div
          className="flex items-center justify-center w-8 h-8 rounded cursor-pointer hover:bg-gray-700 mb-2"
          onClick={() => addTab()}
        >
          <span className="text-lg">+</span>
        </div>
        {tabs.map((t) => (
          <div
            key={t.id}
            className={`flex items-center justify-between px-3 py-2 mb-1 rounded-md cursor-pointer transition-all duration-200 text-white/80 bg-white/5 hover:bg-white/10 hover:text-white ${
              activeId === t.id ? "bg-blue-500/30 text-white" : ""
            }`}
            onClick={() => selectTab(t.id)}
          >
            <span className="flex-1 text-sm truncate">{t.title}</span>
            <div
              className="w-4 h-4 flex items-center justify-center rounded-full text-xs ml-2 opacity-70 transition-all duration-200 hover:bg-white/20 hover:opacity-100"
              onClick={(e) => {
                e.stopPropagation();
                removeTab(t.id);
              }}
            >
              ×
            </div>
          </div>
        ))}
      </div>
    </aside>
  );
}
