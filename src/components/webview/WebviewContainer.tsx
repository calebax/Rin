import Webview from "./Webview";

export default function WebviewContainer() {
  const computedProps = {
    x: "var(--sidebar-width)",
    y: "var(--tab-manger)",
    width: "calc(100% - var(--sidebar-width) - var(--tab-manger))",
    height: "calc(100% - var(--tab-manger) * 2)",
  } as const;

  return <Webview {...computedProps} />;
}
