import { create } from "zustand";

export type TabData = {
  id: string;
  spaceId: string;
  parentId: string | null;
  name: string | null;
  url: string;
  index: number;
  history: string[];
  currentUrlIndex: number;
  isActive: boolean;
};

export type WindowTabs = {
  focusTabId: string | null;
  tabsIds: string[];
};

interface WindowTabsState {
  tabs: Record<string, TabData>;
  tabToWindow: Record<string, string>;
  windows: Record<string, WindowTabs>;

  // === 基本操作 ===
  ensureWindow: (windowLabel: string) => void;
  ensureTab: (
    windowLabel: string,
    tabId: string,
    tabData?: Partial<TabData>
  ) => void;
  removeTab: (tabId: string) => string | null;
  updateTabData: (tabId: string, data: Partial<TabData>) => void;
  getWindowByTab: (tabId: string) => string | null;
  getWindowTabs: (windowLabel: string) => TabData[];

  // === 聚焦管理 ===
  setFocusTab: (windowLabel: string, tabId: string) => void;
  getFocusTab: (windowLabel: string) => string | null;

  // === 历史操作 ===
  pushHistory: (tabId: string, url: string) => void;
  goBack: (tabId: string) => string | null;
  goForward: (tabId: string) => string | null;
  getCurrentUrl: (tabId: string) => string | null;

  // === 跨窗口移动 ===
  moveTab: (
    tabId: string,
    targetWindowLabel: string,
    targetIndex?: number
  ) => void;
}

export const useWindowTabsStore = create<WindowTabsState>((set, get) => ({
  tabs: {},
  tabToWindow: {},
  windows: {},

  // === 基本操作 ===
  ensureWindow: (windowLabel) => {
    set((state) => {
      if (!state.windows[windowLabel]) {
        state.windows[windowLabel] = { focusTabId: null, tabsIds: [] };
      }
      return state;
    });
  },

  ensureTab: (windowLabel, tabId, tabData) => {
    get().ensureWindow(windowLabel);

    set((state) => {
      if (!state.tabs[tabId]) {
        const win = state.windows[windowLabel];
        const index = tabData?.index ?? win.tabsIds.length;

        state.tabs[tabId] = {
          id: tabId,
          spaceId: tabData?.spaceId || "",
          parentId: tabData?.parentId || null,
          name: tabData?.name || null,
          url: tabData?.url || "",
          index,
          history: tabData?.history || [],
          currentUrlIndex: tabData?.currentUrlIndex ?? -1,
          isActive: tabData?.isActive ?? false,
        };
        win.tabsIds.push(tabId);
        state.tabToWindow[tabId] = windowLabel;
      }
      return state;
    });
  },

  removeTab: (tabId) => {
    let newFocus: string | null = null;

    set((state) => {
      const windowLabel = state.tabToWindow[tabId];
      if (!windowLabel) return state;

      const win = state.windows[windowLabel];
      const oldFocusId = win.focusTabId;

      const closedIndex = win.tabsIds.findIndex((id) => id === tabId);
      if (closedIndex === -1) return state;

      // 从窗口列表移除该标签
      win.tabsIds.splice(closedIndex, 1);
      // 删除映射与数据
      delete state.tabs[tabId];
      delete state.tabToWindow[tabId];

      // 更新焦点
      if (win.tabsIds.length === 0) {
        win.focusTabId = null;
      } else if (oldFocusId === tabId) {
        // 如果关闭的是当前焦点 tab，则更新焦点
        const newFocusIndex =
          closedIndex >= win.tabsIds.length
            ? win.tabsIds.length - 1
            : closedIndex;
        const newFocusId = win.tabsIds[newFocusIndex];
        win.focusTabId = newFocusId;
        state.tabs[newFocusId].isActive = true;
      }

      win.tabsIds.forEach((id, idx) => {
        const tab = state.tabs[id];
        if (tab) tab.index = idx;
      });

      // 判断焦点是否变化
      newFocus = win.focusTabId === oldFocusId ? null : win.focusTabId;

      return state;
    });

    return newFocus;
  },

  getWindowByTab: (tabId) => {
    return get().tabToWindow[tabId] || null;
  },

  getWindowTabs: (windowLabel) => {
    const win = get().windows[windowLabel];
    if (!win) return [];
    return win.tabsIds.map((id) => get().tabs[id]).filter(Boolean);
  },

  // === 聚焦管理 ===
  setFocusTab: (windowLabel, tabId) => {
    set((state) => {
      const win = state.windows[windowLabel];
      if (!win || !state.tabs[tabId]) return state;
      state.windows[windowLabel] = { ...win, focusTabId: tabId };
      console.log("设置聚焦 Tab，ID:", windowLabel, tabId);
      return state;
    });
  },

  getFocusTab: (windowLabel) => {
    const win = get().windows[windowLabel];
    return win?.focusTabId || null;
  },

  // === 历史操作 ===
  pushHistory: (tabId, url) => {
    set((state) => {
      const tab = state.tabs[tabId];
      if (!tab) return state;

      if (tab.currentUrlIndex < tab.history.length - 1) {
        tab.history = tab.history.slice(0, tab.currentUrlIndex + 1);
      }

      tab.history.push(url);
      tab.currentUrlIndex = tab.history.length - 1;
      tab.url = url;

      return state;
    });
  },

  goBack: (tabId) => {
    const tab = get().tabs[tabId];
    if (!tab || tab.currentUrlIndex <= 0) return null;

    tab.currentUrlIndex -= 1;
    tab.url = tab.history[tab.currentUrlIndex];
    return tab.url;
  },

  goForward: (tabId) => {
    const tab = get().tabs[tabId];
    if (!tab || tab.currentUrlIndex >= tab.history.length - 1) return null;

    tab.currentUrlIndex += 1;
    tab.url = tab.history[tab.currentUrlIndex];
    return tab.url;
  },

  getCurrentUrl: (tabId) => {
    const tab = get().tabs[tabId];
    if (!tab || tab.currentUrlIndex === -1) return null;
    return tab.history[tab.currentUrlIndex];
  },

  // === Tab 数据更新 ===
  updateTabData: (tabId, data) => {
    set((state) => {
      const tab = state.tabs[tabId];
      if (!tab) return state;

      return {
        ...state,
        tabs: {
          ...state.tabs,
          [tabId]: { ...state.tabs[tabId], ...data },
        },
      };
    });
  },

  // === 跨窗口移动 ===
  moveTab: (tabId, targetWindowLabel, targetIndex) => {
    const { tabs, windows, tabToWindow } = get();
    const sourceWindowLabel = tabToWindow[tabId];
    if (!sourceWindowLabel) return;

    const sourceWin = windows[sourceWindowLabel];
    sourceWin.tabsIds = sourceWin.tabsIds.filter((id) => id !== tabId);
    if (sourceWin.focusTabId === tabId) {
      sourceWin.focusTabId = sourceWin.tabsIds[0] || null;
    }

    if (!windows[targetWindowLabel]) {
      windows[targetWindowLabel] = { focusTabId: null, tabsIds: [] };
    }
    const targetWin = windows[targetWindowLabel];

    if (targetIndex !== undefined && targetIndex >= 0) {
      targetWin.tabsIds.splice(targetIndex, 0, tabId);
    } else {
      targetWin.tabsIds.push(tabId);
    }

    tabToWindow[tabId] = targetWindowLabel;
    targetWin.focusTabId = tabId;

    set({ tabs, windows, tabToWindow });
  },
}));
