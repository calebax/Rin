import { useState } from "react";
import { useRequest } from "ahooks";
import { useTabs } from "@/hooks/useTabs";
import { isValidURL, normalizeURL } from "@/utils/url";

export default function TabList() {
  const { tabs, activeId, addTab, removeTab, selectTab, reloadTab } = useTabs();

  // 地址栏内容
  const [address, setAddress] = useState("");

  /** 事件处理函数 */
  const handleSelectTab = (tabId: string) => selectTab(tabId);
  const handleRemoveTab = (tabId: string) => removeTab(tabId);
  const handleAddTab = () => addTab("https://www.google.com.hk/", "New Tab");
  const handleReloadTab = () => reloadTab("123");

  /** 回车打开地址 */
  const { run: openAddress } = useRequest(
    async () => {
      const trimmed = address.trim();
      if (!trimmed) return;

      let toURL: string | null = null;
      if (isValidURL(trimmed)) {
        const url = normalizeURL(trimmed);
        if (url) toURL = url;
      }
      if (!toURL) {
        const query = encodeURIComponent(trimmed);
        toURL = `https://www.phind.com/search?q=${query}`;
      }

      await addTab(toURL, toURL);
      setAddress("");
    },
    { manual: true }
  );

  /** 根据 URL 计算 favicon */
  const getFaviconUrl = (url: string) => {
    try {
      const host = new URL(url).hostname;
      return `https://www.google.com/s2/favicons?domain=${host}&sz=64`;
    } catch {
      return `https://www.google.com/s2/favicons?domain=example.com&sz=64`;
    }
  };

  return (
    <aside
      className="flex-1 flex flex-col w-full overflow-hidden"
    >
      {/* 固定地址栏 */}
      <div className="px-4 flex-shrink-0 ">
        <input
          value={address}
          onChange={(e) => setAddress(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") openAddress();
          }}
          placeholder="Search or enter URL"
          className="w-full h-9 rounded-xl px-3 bg-white/70 text-black text-xs placeholder:text-gray-400 placeholder:text-xs shadow-sm outline-none focus:ring-2 ring-blue-400"
        />
      </div>

      {/* 滚动区域 标签列表 */}
      <div className="flex-1 overflow-y-auto px-4 py-2 scrollbar-thin scrollbar-thumb-gray-500 scrollbar-track-transparent">
        {/* 新建标签 */}
        <div
          className="flex items-center gap-3 h-9 mb-3 px-3 rounded-xl bg-white/10 text-gray-400 hover:bg-white/20 cursor-pointer transition-colors"
          onClick={() => handleAddTab()}
        >
          <div className="w-5 h-5 flex items-center justify-center rounded-full bg-white/70 text-black">
            +
          </div>
          <span className="text-sm">New Tab</span>
        </div>

        {/* 标签列表 */}
        {tabs.map((t) => (
          <div
            key={t.id}
            className={`group flex items-center gap-3 h-9 px-3 mb-2 rounded-xl cursor-pointer transition-colors duration-200 ${
              activeId === t.id
                ? "bg-white text-slate-900 shadow-sm"
                : "bg-white/10 text-slate-900 hover:bg-black/10"
            }`}
            onClick={() => handleSelectTab(t.id)}
          >
            <img
              src={getFaviconUrl(t.url)}
              alt="favicon"
              className="w-5 h-5 rounded"
            />
            <span className="flex-1 text-sm truncate">{t.name}</span>

            <span className="hidden group-hover:inline-flex">
              <button
                className="w-5 h-5 flex items-center justify-center rounded-full text-xs transition hover:bg-white/30"
                onClick={(e) => {
                  e.stopPropagation();
                  handleRemoveTab(t.id);
                }}
              >
                ×
              </button>
            </span>
          </div>
        ))}
      </div>

      {/* 底部按钮栏 */}
      <div className="px-4 py-4 flex items-center justify-between border-t border-white/20 flex-shrink-0">
        {/* 刷新按钮 */}
        <button
          className="w-7 h-7 flex items-center justify-center rounded-full bg-gray-500 text-white hover:bg-gray-600 transition-colors"
          onClick={() => handleReloadTab()}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="w-3.5 h-3.5"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M4 4v6h6M20 20v-6h-6"
            />
          </svg>
        </button>

        {/* 新建标签按钮 */}
        <button
          className="w-7 h-7 flex items-center justify-center rounded-full bg-gray-500 text-white hover:bg-gray-600 transition-colors"
          onClick={() => handleAddTab()}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="w-3.5 h-3.5"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M12 4v16m8-8H4"
            />
          </svg>
        </button>

        {/* 设置按钮 */}
        <button
          className="w-7 h-7 flex items-center justify-center rounded-full bg-gray-500 text-white hover:bg-gray-600 transition-colors"
          onClick={() => console.log("Settings")}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="w-3.5 h-3.5"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
        </button>

        {/* 收藏按钮 */}
        <button
          className="w-7 h-7 flex items-center justify-center rounded-full bg-gray-500 text-white hover:bg-gray-600 transition-colors"
          onClick={() => console.log("Bookmark")}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="w-3.5 h-3.5"
            fill="currentColor"
            viewBox="0 0 24 24"
          >
            <path d="M5 3a2 2 0 00-2 2v16l9-5 9 5V5a2 2 0 00-2-2H5z" />
          </svg>
        </button>
      </div>
    </aside>
  );
}
