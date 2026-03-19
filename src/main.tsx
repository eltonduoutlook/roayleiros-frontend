import React from "react";
import ReactDOM from "react-dom/client";
import App from "@/App";
import "@/index.css";
import { TooltipProvider } from "./components/ui/tooltip";


ReactDOM.createRoot(document.getElementById("root")!).render(
  <TooltipProvider>
    <React.StrictMode>
      <App />
    </React.StrictMode>,
  </TooltipProvider>
);