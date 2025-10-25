import Webview from "./Webview";

export default function WebviewContainer() {
  const computedProps = {
    x: 0,
    y: "var(--tab-manger)",
    width: "calc(100% - var(--tab-manger))",
    height: "calc(100% - var(--tab-manger) * 2)",
  } as const;

  return <Webview {...computedProps} />;
}
