import { useTabs } from "@/hooks/useTabs";
import { useWindowDragAndMaximize } from "@/hooks/layout";

export default function TitleBar() {
  const { reloadTab } = useTabs();
  useWindowDragAndMaximize("drag-title-bar");

  const handleReloadTab = () => reloadTab("123");

  // 按钮可点击控制变量（后续可从外部或状态管理传入）
  const canGoBack = true;
  const canGoForward = true;
  const canMore = true;

  // 仅在悬浮时才出现背景与模糊效果
  const btnClass = (enabled: boolean) =>
    `w-8 h-8 flex items-center justify-center rounded-xl bg-transparent text-slate-700 transition-colors ${
      enabled
        ? "hover:bg-gradient-to-b hover:from-transparent hover:to-black/10 hover:backdrop-blur-[2px]"
        : "opacity-40 cursor-default pointer-events-none"
    }`;

  return (
    <div
      id="titlebar"
      className="drag-title-bar h-[var(--titlebar-height)] w-full flex-shrink-0 flex items-center select-none cursor-default"
    >
      <div
        id="titlebar-controls"
        className="h-full flex items-center"
        style={{ width: "var(--sidebar-width)" }}
      >
        <div className="w-full flex items-center justify-end gap-2 px-2">
          {/* 后退 */}
          <button
            aria-label="Back"
            className={btnClass(canGoBack)}
            disabled={!canGoBack}
            onClick={() => {
              if (!canGoBack) return;
              console.log("Back");
            }}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              className="w-3.5 h-3.5"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M15 19l-7-7 7-7"
              />
            </svg>
          </button>

          {/* 前进 */}
          <button
            aria-label="Forward"
            className={btnClass(canGoForward)}
            disabled={!canGoForward}
            onClick={() => {
              if (!canGoForward) return;
              console.log("Forward");
            }}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              className="w-3.5 h-3.5"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M9 5l7 7-7 7"
              />
            </svg>
          </button>

          {/* 刷新 */}
          <button
            aria-label="Refresh"
            className={btnClass(canMore)}
            disabled={!canMore}
            onClick={() => handleReloadTab()}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              className="w-3.5 h-3.5"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
              />
            </svg>
          </button>
        </div>
      </div>

      <div className="flex-1 h-full select-none" />
    </div>
  );
}
