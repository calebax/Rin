// src/hooks/useTabs.ts
import { useState, useCallback, useEffect } from "react";
import { invoke } from "@tauri-apps/api/core";
import { listen } from "@tauri-apps/api/event";
import { window } from "@tauri-apps/api";
import { CMD } from "@/constants/cmd";
import { useAsyncEffect, useRequest } from "ahooks";

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

  // 初始化 windowLabel
  useAsyncEffect(async () => {
    const currentWindow = window.getCurrentWindow();
    setWindowLabel(currentWindow.label);
  }, []);

  // 异步初始化 Tabs & 监听 tab_update 事件
  useEffect(() => {
    if (!windowLabel) return;

    let unlisten: (() => void) | null = null;

    (async () => {
      try {
        // 获取后端 Tab 列表
        const initialTabs: TabItem[] = await invoke(CMD.TAB_GET_INFO_LIST, {
          windowLabel,
        });
        if (!initialTabs || initialTabs.length === 0) return;

        // 根据 index 排序
        const sortedTabs = [...initialTabs].sort((a, b) => a.index - b.index);

        // 设置 activeId
        const activeTab = sortedTabs.find((t) => t.is_active);
        const activeIdValue = activeTab?.id ?? sortedTabs[0].id;

        setTabs(sortedTabs);
        setActiveId(activeIdValue);

        // 监听 Tauri 后端 tab_update 事件
        unlisten = await listen<{
          tabId: string;
          title: string;
          loaded: boolean;
        }>("tab_update", (event) => {
          const payload = event.payload;
          setTabs((prev) =>
            prev.map((t) =>
              t.id === payload.tabId ? { ...t, name: payload.title } : t
            )
          );
        });
      } catch (e) {
        console.warn("非 Tauri 环境或初始化失败:", e);
      }
    })();

    return () => {
      if (unlisten) unlisten();
    };
  }, [windowLabel]);

  // useEffect(() => {
  //   console.log("tabs updated:", tabs);
  // }, [tabs]);

  const { run: addTab } = useRequest(
    async (url = "https://www.google.com.hk/", name = "New Tab") => {
      if (!windowLabel) return;

      const tabId: string = await invoke(CMD.TAB_ADD, {
        windowLabel,
        url,
        name,
      });
      setTabs((prev) => [
        ...prev,
        // TODO is_active属性后期维护
        { id: tabId, name, url, index: prev.length, is_active: true },
      ]);
      await invoke(CMD.TAB_SWITCH, { windowLabel, tabId });
      setActiveId(tabId);
    },
    { manual: true }
  );

  /** 关闭 Tab */
  const { run: removeTab } = useRequest(
    async (id: string) => {
      if (!windowLabel) return;

      await invoke(CMD.TAB_CLOSE, { windowLabel, tabId: id });

      setTabs((prevTabs) => {
        const newTabs = prevTabs.filter((t) => t.id !== id);
        const closedTab = prevTabs.find((t) => t.id === id);
        if (!closedTab) return newTabs;

        const closedIndex = closedTab.index;
        const updatedTabs = newTabs.map((t) => ({
          ...t,
          index: t.index >= closedIndex ? t.index - 1 : t.index,
        }));

        if (updatedTabs.length === 0) return updatedTabs;

        // 更新 activeId
        const newActiveId =
          closedIndex >= updatedTabs.length
            ? updatedTabs[updatedTabs.length - 1].id
            : updatedTabs[closedIndex].id;

        selectTab(newActiveId);
        return updatedTabs;
      });
    },
    { manual: true }
  );

  /** 切换 Tab */
  const { run: selectTab } = useRequest(
    async (id: string) => {
      if (!windowLabel) return;
      await invoke(CMD.TAB_SWITCH, { windowLabel, tabId: id });
      setActiveId(id);
    },
    { manual: true }
  );

  const reloadTab = useCallback(
    async (id: string) => {
      if (!windowLabel) return;
      console.log("重新加载 Tab，ID:", id);
      // await invoke(CMD.TAB_RELOAD, { windowLabel, tabId: id });
    },
    [windowLabel]
  );

  /** 获取 favicon URL */
  const getFaviconUrl = useCallback((url: string) => {
    try {
      const host = new URL(url).hostname;
      return `https://www.google.com/s2/favicons?domain=${host}&sz=64`;
    } catch {
      return `https://www.google.com/s2/favicons?domain=example.com&sz=64`;
    }
  }, []);

  return {
    tabs,
    activeId,
    addTab,
    removeTab,
    selectTab,
    reloadTab,
    getFaviconUrl,
  };
}
