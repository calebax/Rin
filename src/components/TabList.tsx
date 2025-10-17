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

  // 初始化：创建首页
  useEffect(() => {
    console.log("TabList useEffect");
    let unlisten: (() => void) | null = null;
    (async () => {
      // 监听 WebView 标题变化
      const off = await listen("tauri://webview/title-changed", (event) => {
        const payload = event.payload as { tabId: string; title: string };
        setTabs((prev) =>
          prev.map((t) =>
            t.id === payload.tabId ? { ...t, title: payload.title } : t
          )
        );
      });
      unlisten = off;
    })();

    return () => {
      if (unlisten) unlisten();
    };
  }, []);

  return (
    <div className="flex items-center h-8 bg-gray-900 px-2 text-white">
      <div
        className="flex items-center justify-center w-6 h-6 rounded cursor-pointer ml-1 hover:bg-gray-700"
        onClick={() => addTab()}
      >
        +
      </div>
      {tabs.map((t) => (
        <div
          key={t.id}
          className={`flex items-center h-6 px-3 mx-0.5 rounded text-sm cursor-pointer ${
            activeId === t.id ? "bg-gray-700" : "hover:bg-gray-800"
          }`}
          onClick={() => selectTab(t.id)}
        >
          <span>{t.title}</span>
          <div
            className="flex items-center justify-center w-4 h-4 ml-2 rounded hover:bg-gray-600"
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
  );
}
