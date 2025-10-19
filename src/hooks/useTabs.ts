// src/hooks/useTabs.ts
import { useState, useEffect } from "react";
import { invoke } from "@tauri-apps/api/core";
import { listen } from "@tauri-apps/api/event";
import { window } from "@tauri-apps/api";
import { CMD } from "../constants/cmd";

export type TabItem = {
  id: string;
  name: string;
  url: string;
  index: number;
  is_active: boolean;
};

export function useTabs() {
  const [windowLabel, setWindowLabel] = useState<string | null>(null);
  const [tabs, setTabs] = useState<TabItem[]>([]);
  const [activeId, setActiveId] = useState<string | null>(null);

  useEffect(() => {
    const currentWindow = window.getCurrentWindow();
    setWindowLabel(currentWindow.label);
  }, []);

  useEffect(() => {
    console.log("tabs updated:", tabs);
  }, [tabs]);

  /** 新增标签 */
  const addTab = async (
    url = "https://www.google.com.hk/",
    name = "New Tab"
  ) => {
    const tabId: string = await invoke(CMD.TAB_ADD, {
      windowLabel,
      url,
      name,
    });

    console.log("新增 Tab，ID:", tabId);

    setTabs((prev) => [
      ...prev,
      // TODO is_active属性后期维护
      { id: tabId, name: name, url, index: prev.length, is_active: true },
    ]);

    await invoke(CMD.TAB_SWITCH, { windowLabel, tabId });
    setActiveId(tabId);
  };

  /** 关闭标签 */
  const removeTab = async (id: string) => {
    await invoke(CMD.TAB_CLOSE, { windowLabel, tabId: id });
    console.log("关闭 Tab，ID:", id);

    setTabs((prevTabs) => {
      // 删除目标 Tab
      const newTabs = prevTabs.filter((t) => t.id !== id);

      // 找到关闭的 Tab
      const closedTab = prevTabs.find((t) => t.id === id);
      if (!closedTab) {
        console.log(`Tab ${id} 不存在`);
        return newTabs;
      }

      const closedIndex = closedTab.index;
      // 更新 index
      const updatedTabs = newTabs.map((t) => ({
        ...t,
        index: t.index >= closedIndex ? t.index - 1 : t.index,
      }));

      if (updatedTabs.length === 0) {
        return updatedTabs;
      }

      let newActiveId;
      if (closedIndex > updatedTabs.length - 1) {
        newActiveId = updatedTabs[updatedTabs.length - 1].id;
      } else {
        newActiveId = updatedTabs[closedIndex].id;
      }

      selectTab(newActiveId);

      return updatedTabs;
    });
  };

  /** 切换标签 */
  const selectTab = async (id: string) => {
    console.log("切换 Tab，ID:", id);
    await invoke(CMD.TAB_SWITCH, { windowLabel, tabId: id });
    setActiveId(id);
  };

  /** 根据 URL 获取 favicon */
  const getFaviconUrl = (url: string) => {
    try {
      const host = new URL(url).hostname;
      return `https://www.google.com/s2/favicons?domain=${host}&sz=64`;
    } catch {
      return `https://www.google.com/s2/favicons?domain=example.com&sz=64`;
    }
  };

  useEffect(() => {
    let unlisten: (() => void) | null = null;

    (async () => {
      try {
        // 获取后端 Tab 列表
        const initialTabs: TabItem[] = await invoke(CMD.TAB_GET_INFO_LIST, {
          windowLabel,
        });
        console.log("初始化 Tab 列表:", initialTabs);

        if (initialTabs.length === 0) return;

        // 1️⃣ 根据 index 从小到大排序
        const sortedTabs = [...initialTabs].sort((a, b) => a.index - b.index);

        // 2️⃣ 设置 activeId
        const activeTab = sortedTabs.find((t) => (t as TabItem).is_active); // 后端字段 is_active
        const activeIdValue = activeTab ? activeTab.id : sortedTabs[0].id;

        setTabs(sortedTabs);
        setActiveId(activeIdValue);

        // 监听 Tauri 标题变化事件
        // listen<DownloadStarted>('download-started', (event) => {
        const off = await listen<{
          tabId: string;
          title: string;
          loaded: boolean;
        }>("tab_update", (event) => {
          console.log("listen event:", event);
          const payload = event.payload;
          setTabs((prev) =>
            prev.map((t) =>
              t.id === payload.tabId
                ? { ...t, title: payload.title, name: payload.title }
                : t
            )
          );
        });
        unlisten = off;
      } catch (e) {
        console.warn("非 Tauri 环境或初始化失败:", e);
      }
    })();

    // 清理监听
    return () => {
      if (unlisten) unlisten();
    };
  }, [windowLabel]);

  return {
    tabs,
    activeId,
    addTab,
    removeTab,
    selectTab,
    getFaviconUrl,
  };
}
