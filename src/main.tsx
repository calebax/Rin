import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { createBrowserRouter, RouterProvider } from "react-router";
import "./base.css";
import HomePage from "@/pages/home";
import OverlayPage from "@/pages/overlay";

const router = createBrowserRouter([
  { path: "/", element: <HomePage /> },
  { path: "/overlay", element: <OverlayPage /> },
]);

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <RouterProvider router={router} />
  </StrictMode>
);
