// src/hooks/useTabs.ts
import { useCallback, useState } from "react";
import { invoke } from "@tauri-apps/api/core";
import { window } from "@tauri-apps/api";
import { CMD } from "@/constants/cmd";
import { useAsyncEffect, useRequest } from "ahooks";
import { useWindowTabsStore } from "@/stores/windowTabsStore";
import { useShallow } from "zustand/react/shallow";

export function useTabs() {
  const [windowLabel, setWindowLabel] = useState<string | null>(null);

  const {
    ensureTab,
    setFocusTab,
    removeTab: removeTabFromStore,
    pushHistory,
  } = useWindowTabsStore.getState();

  // 初始化 windowLabel
  useAsyncEffect(async () => {
    const currentWindow = window.getCurrentWindow();
    setWindowLabel(currentWindow.label);
  }, []);

  const activeId = useWindowTabsStore((s) =>
    windowLabel ? s.getFocusTab(windowLabel) : null
  );

  const tabs = useWindowTabsStore(
    useShallow((s) => {
      if (!windowLabel) return [];
      const winTabsIds = s.windows[windowLabel]?.tabsIds ?? [];
      return winTabsIds.map((id) => s.tabs[id]).filter(Boolean);
    })
  );

  const { run: addTab } = useRequest(
    async (url = "https://www.google.com.hk/", name = null) => {
      if (!windowLabel) return;
      const tabId: string = await invoke(CMD.TAB_ADD, {
        windowLabel,
        url,
        name,
      });
      // 同步到 store
      ensureTab(windowLabel, tabId, { name, url, index: tabs?.length ?? 0 });
      await invoke(CMD.TAB_SWITCH, { windowLabel, tabId });
      pushHistory(tabId, url);
      setFocusTab(windowLabel, tabId);
    },
    { manual: true }
  );

  /** 关闭 Tab */
  const { run: removeTab } = useRequest(
    async (id: string) => {
      if (!windowLabel) return;
      await invoke(CMD.TAB_CLOSE, { windowLabel, tabId: id });
      // 同步到 store
      const newActiveId = removeTabFromStore(id);
      if (newActiveId) {
        selectTab(newActiveId);
      }
    },
    { manual: true }
  );

  /** 切换 Tab */
  const { run: selectTab } = useRequest(
    async (id: string) => {
      if (!windowLabel) return;
      await invoke(CMD.TAB_SWITCH, { windowLabel, tabId: id });
      setFocusTab(windowLabel, id);
    },
    { manual: true }
  );

  const switchTabHistoryPage = useCallback(
    (windowLabel: string, action: number, tabId?: string) => {
      if (![-1, 0, 1].includes(action)) {
        console.error("Invalid action. Must be -1, 0, or 1.");
        return;
      }

      const finalTabId =
        tabId ?? useWindowTabsStore.getState().getFocusTab(windowLabel);
      if (!finalTabId) return;
      invoke(CMD.TAB_SWITCH_HISTORY_PAGE, {
        windowLabel,
        tabId: finalTabId,
        action,
      });
    },
    []
  );

  const navigateTab = useCallback(
    async (url: string, id?: string) => {
      if (!windowLabel) return;
      const finalTabId =
        id ?? useWindowTabsStore.getState().getFocusTab(windowLabel);
      if (!finalTabId) return;
      invoke(CMD.TAB_NAVIGATE, {
        windowLabel,
        tabId: finalTabId,
        url: url,
      });
    },
    [windowLabel]
  );

  const reloadTab = useCallback(
    async (id?: string) => {
      if (!windowLabel) return;
      switchTabHistoryPage(windowLabel, 0, id);
    },
    [windowLabel, switchTabHistoryPage]
  );

  const backTab = useCallback(
    async (id?: string) => {
      if (!windowLabel) return;
      switchTabHistoryPage(windowLabel, -1, id);
    },
    [windowLabel, switchTabHistoryPage]
  );

  const forwardTab = useCallback(
    async (id?: string) => {
      if (!windowLabel) return;
      switchTabHistoryPage(windowLabel, 1, id);
    },
    [windowLabel, switchTabHistoryPage]
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
    navigateTab,
    backTab,
    forwardTab,
    getFaviconUrl,
  };
}
