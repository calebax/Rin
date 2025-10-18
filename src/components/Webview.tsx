export default function Webview({
  x = 0,
  y = 0,
  width = "100%",
  height = "100%",
}: {
  x?: number | string;
  y?: number | string;
  width?: number | string;
  height?: number | string;
}) {
  return (
    <div
      className="absolute  overflow-hidden w-full"
      style={{
        left: x,
        top: y,
        width,
        height,
        boxShadow: `
  0px -4px 8px rgba(0, 0, 0, 0.08), 
 -4px 0px 8px rgba(0, 0, 0, 0.08),  
  4px 0px 8px rgba(0, 0, 0, 0.08),  
  0px 4px 8px rgba(0, 0, 0, 0.08)
    `,
      }}
    />
  );
}
