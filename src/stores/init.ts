import { invoke } from "@tauri-apps/api/core";
import { listen } from "@tauri-apps/api/event";
import { CMD } from "@/constants/cmd";
import { useWindowTabsStore, type TabData } from "@/stores/windowTabsStore";
import { getCurrentWindowLabel } from "@/utils/window";

let globalUnlisten: (() => void) | null = null;

export async function initTabStore() {
  try {
    const windowLabel = getCurrentWindowLabel();
    if (!windowLabel) return;

    const initialTabs: Array<TabData> = await invoke(CMD.TAB_GET_INFO_LIST, {
      windowLabel,
    });
    if (initialTabs && initialTabs.length > 0) {
      const sortedTabs = [...initialTabs].sort((a, b) => a.index - b.index);
      console.log(sortedTabs);
      const { tabsMap, tabsIds, tabToWindowMap, activeId } = sortedTabs.reduce(
        (acc, tab) => {
          acc.tabsMap[tab.id] = { ...tab, history: tab.url ? [tab.url] : [] };
          acc.tabsIds.push(tab.id);
          acc.tabToWindowMap[tab.id] = windowLabel;
          if (!acc.activeId && tab.isActive) acc.activeId = tab.id;
          return acc;
        },
        {
          tabsMap: {} as Record<string, TabData>,
          tabsIds: [] as string[],
          tabToWindowMap: {} as Record<string, string>,
          activeId: null as string | null,
        }
      );

      useWindowTabsStore.setState((state) => ({
        windows: {
          ...state.windows,
          [windowLabel]: { focusTabId: activeId, tabsIds },
        },
        tabs: { ...state.tabs, ...tabsMap },
        tabToWindow: { ...state.tabToWindow, ...tabToWindowMap },
      }));
    }

    if (globalUnlisten) {
      globalUnlisten();
      globalUnlisten = null;
    }

    const updateTabData = useWindowTabsStore.getState().updateTabData;
    // 监听 Tauri 后端 tab_update 事件，同步标题到 store
    const unlisten = await listen<{
      event: string;
      tabId: string;
      title: string;
      url: string;
    }>("tab_update", (event) => {
      const payload = event.payload;
      console.log("tab_update", payload);
      const updateInfo = {
        url: payload.url,
        ...(payload.event === "titleChanged" ? { name: payload.title } : {}),
      };
      updateTabData(payload.tabId, updateInfo);
    });

    globalUnlisten = unlisten;
    return unlisten;
  } catch (e) {
    console.warn("获取 Tab 列表失败:", e);
  }
}
