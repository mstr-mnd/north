import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { OverlayProvider } from "@pikoloo/darwin-ui";
import "@pikoloo/darwin-ui/styles.css";
import "./index.css";
import App from "./App.jsx";

document.documentElement.setAttribute("data-theme", "light");
document.documentElement.classList.remove("dark");

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <OverlayProvider>
      <App />
    </OverlayProvider>
  </StrictMode>,
);
