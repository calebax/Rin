import Sidebar from "@/components/sidebar/Sidebar";
import TopDragRegion from "@/components/sidebar/TopDragRegion";
import WebviewContainer from "@/components/webview/WebviewContainer";
import "./home.css";

const HomePage = () => {
  return (
    <div className="relative w-full h-full flex overflow-hidden shadow-lg select-none">
      <Sidebar />
      <div className="flex-1 flex flex-col relative">
        <TopDragRegion />
        <WebviewContainer />
      </div>
    </div>
  );
};

export default HomePage;
