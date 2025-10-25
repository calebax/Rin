export default function DragRegion() {
  return (
    <div
      className="drag-title-bar h-[var(--titlebar-height)] w-full flex-shrink-0 select-none"
      // 可选：用于 Tauri overlay titlebar 的可视区域占位
      data-tauri-drag-region
    />
  );
}
