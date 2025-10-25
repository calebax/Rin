import { useTabs } from "@/hooks/useTabs";
import { useWindowDragAndMaximize } from "@/hooks/useWindow";

export default function TitleBar() {
  useWindowDragAndMaximize("drag-title-bar");
  const { reloadTab, backTab, forwardTab } = useTabs();
  const handleReloadTab = () => reloadTab();
  const handleBackTab = () => backTab();
  const handleForwardTab = () => forwardTab();

  // TODO 按钮可点击控制变量（后续可从外部或状态管理传入）
  const canGoBack = true;
  const canGoForward = true;
  const canMore = true;

  // 仅在悬浮时才出现背景与模糊效果
  const btnClass = (enabled: boolean) =>
    `w-7 h-7 flex items-center justify-center rounded-xl bg-transparent text-slate-700 transition-colors ${
      enabled
        ? "hover:bg-gradient-to-b hover:from-transparent hover:to-black/10 hover:backdrop-blur-[2px]"
        : "opacity-40 cursor-default pointer-events-none"
    }`;

  return (
    <div
      id="titlebar"
      className="drag-title-bar h-[var(--titlebar-height)] w-full flex-shrink-0 flex items-center select-none cursor-default"
    >
      <div className="w-full flex items-center justify-end gap-0.5 px-1">
        {/* 后退 */}
        <button
          aria-label="Back"
          className={btnClass(canGoBack)}
          disabled={!canGoBack}
          onClick={() => {
            if (!canGoBack) return;
            handleBackTab();
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
            handleForwardTab();
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
            strokeLinecap="round"
            strokeLinejoin="round"
            className="w-3.5 h-3.5"
          >
            <path d="M21 12a9 9 0 1 1-3.5-7" />
            <polyline points="21 3 21 9 15 9" />
          </svg>
        </button>
      </div>
    </div>
  );
}
