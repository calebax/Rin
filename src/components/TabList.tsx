import { useState } from "react";
import { useTabs } from "../hooks/useTabs";
import { isValidURL, normalizeURL } from "../utils/url";

export default function TabList() {
  const windowLabel = "main";
  const { tabs, activeId, addTab, removeTab, selectTab } = useTabs(windowLabel);

  // 地址栏内容
  const [address, setAddress] = useState("");

  /** 事件处理函数 */
  const handleSelectTab = (tabId: string) => selectTab(tabId);
  const handleRemoveTab = (tabId: string) => removeTab(tabId);
  const handleAddTab = () => addTab("https://www.google.com.hk/", "New Tab");

  /** 回车打开地址 */
  const openAddress = async () => {
    const trimmed = address.trim();
    if (!trimmed) return;

    // 检查是否为有效 URL
    let toURL: string | null = null;
    if (isValidURL(trimmed)) {
      console.log("isValidURL:", trimmed, isValidURL(trimmed));
      const url = normalizeURL(trimmed);
      if (url) {
        toURL = url;
      }
    }
    if (!toURL) {
      // 不是有效 URL，作为搜索词处理
      const query = encodeURIComponent(trimmed);
      toURL = `https://www.phind.com/search?q=${query}`;
    }
    await addTab(toURL, toURL);
    setAddress("");
  };

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
      className="absolute left-0 bottom-0 overflow-y-auto overflow-x-hidden flex-shrink-0"
      style={{ top: "var(--titlebar-height)", width: "var(--sidebar-width)" }}
    >
      <div className="px-4 py-4 min-h-full">
        {/* 地址栏 */}
        <div className="mb-3">
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

        {/* 新建标签：一行样式 */}
        <div
          className="flex items-center gap-3 h-9 px-3 mb-3 rounded-xl bg-white/10 text-gray-400 hover:bg-white/20 cursor-pointer transition-colors"
          onClick={() => handleAddTab()}
        >
          <div className="w-5 h-5 flex items-center justify-center rounded-full bg-white/70 text-black">
            +
          </div>
          <span className="text-sm">New Tab</span>
        </div>

        {/* 标签列表：带 favicon、选中态、悬停显示关闭 */}
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
            <button
              className="opacity-0 group-hover:opacity-100 w-5 h-5 flex items-center justify-center rounded-full text-xs transition-opacity hover:bg-white/30"
              onClick={(e) => {
                e.stopPropagation();
                handleRemoveTab(t.id);
              }}
            >
              ×
            </button>
          </div>
        ))}
      </div>
    </aside>
  );
}
