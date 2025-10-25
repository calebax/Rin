import { useRef } from "react";
import TitleBar from "@/components/sidebar/TitleBar";
import TabList from "@/components/sidebar/TabList";
import SidebarResizeHandle from "@/components/sidebar/SidebarResizeHandle";
import { useSidebarWidth } from "@/hooks/useLayout";

export default function Sidebar() {
  const ref = useRef<HTMLElement | null>(null);
  const { setSidebarWidth } = useSidebarWidth();

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
