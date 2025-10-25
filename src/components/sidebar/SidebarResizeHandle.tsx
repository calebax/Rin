import { useRef, useState } from "react";
import type { RefObject } from "react";
import { useEventListener, useLongPress, useMemoizedFn } from "ahooks";

type Props = {
  containerRef?: RefObject<HTMLElement | null>;
  padding?: number;
  min?: number;
  max?: number;
  onWidthChange?: (width: number) => void;
};

export default function SidebarResizeHandle({
  containerRef,
  padding = 10,
  min = 160,
  max = 480,
  onWidthChange,
}: Props) {
  const handleRef = useRef<HTMLDivElement | null>(null);
  const draggingRef = useRef(false);
  const [isDragging, setIsDragging] = useState(false);

  const getSidebarEl = () => {
    return (
      containerRef?.current ??
      (handleRef.current?.parentElement as HTMLElement | null)
    );
  };

  const updateWidthRaw = (clientX: number) => {
    const sidebarEl = getSidebarEl();
    if (!sidebarEl) return;
    const rect = sidebarEl.getBoundingClientRect();
    const next = Math.min(max, Math.max(min, Math.round(clientX - rect.left)));
    console.log("nextWidth", next);
    document.documentElement.style.setProperty("--sidebar-width", `${next}px`);
    onWidthChange?.(next);
  };

  const updateWidth = useMemoizedFn(updateWidthRaw);

  const finishDrag = useMemoizedFn((e?: PointerEvent) => {
    if (draggingRef.current && e) updateWidth(e.clientX);
    draggingRef.current = false;
    setIsDragging(false);
    document.body.style.cursor = "";
  });

  const onPointerMove = useMemoizedFn((e: PointerEvent) => {
    if (!draggingRef.current) return;
    updateWidth(e.clientX);
  });

  useEventListener("pointermove", onPointerMove, { target: () => window });
  useEventListener("pointerup", (e: PointerEvent) => finishDrag(e), {
    target: () => window,
  });

  useLongPress(
    () => {
      // 开始拖拽
      draggingRef.current = true;
      setIsDragging(true);
      document.body.style.cursor = "col-resize";
    },
    handleRef,
    {
      delay: 120,
      moveThreshold: { x: 2, y: 2 },
    }
  );

  return (
    <div
      ref={handleRef}
      className="absolute right-0 z-20 select-none pointer-events-auto"
      style={{ top: padding, bottom: padding }}
    >
      <div
        className={`w-1 h-full rounded cursor-col-resize transition-all
          ${
            isDragging
              ? "bg-sky-400/40 opacity-100"
              : "opacity-0 hover:opacity-100 hover:bg-sky-400/30"
          }`}
      />
    </div>
  );
}
