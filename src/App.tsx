import { useEffect } from "react";
import TabList from "./components/TabList";
import BrowserView from "./components/BrowserView";

export default function App() {
  useEffect(() => {
    // document.documentElement.style.setProperty("--bg-start", `#0f172a`);
    // document.documentElement.style.setProperty("--bg-end", `#1e293b`);
    // document.documentElement.style.setProperty("--bg-angle", `135deg`);
  }, []);

  return (
    <div className="">
      <TabList />
      <BrowserView />
    </div>
  );
}
