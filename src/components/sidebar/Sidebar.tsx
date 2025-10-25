import { useRef, useEffect } from "react";
import TitleBar from "@/components/sidebar/TitleBar";
import TabList from "@/components/sidebar/TabList";
import SidebarResizeHandle from "@/components/sidebar/SidebarResizeHandle";
import { useSidebarWidth } from "@/hooks/useLayout";
import { initTabStore } from "@/stores/init";

export default function Sidebar() {
  const ref = useRef<HTMLElement | null>(null);
  const { setSidebarWidth } = useSidebarWidth();

  useEffect(() => {
    let isMounted = true;
    let unlisten: (() => void) | undefined;

    (async () => {
      const unlistenFn = await initTabStore();

      // 只在组件仍然挂载时保存 unlisten
      if (isMounted) {
        unlisten = unlistenFn;
      } else {
        // 如果组件已卸载，立即清理
        unlistenFn?.();
      }
    })();

    return () => {
      isMounted = false;
      unlisten?.();
    };
  }, []);

  return (
    <aside
      ref={ref}
      className="relative h-full flex flex-col flex-shrink-0"
      style={{ width: "var(--sidebar-width)" }}
    >
      <TitleBar />
      <TabList />
      <SidebarResizeHandle containerRef={ref} onWidthChange={setSidebarWidth} />
    </aside>
  );
}
