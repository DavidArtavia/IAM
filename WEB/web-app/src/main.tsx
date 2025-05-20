// import React from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import "antd/dist/reset.css";
import { App } from "@/App";
import { NotificationProvider } from "./context/NotificationContext";

const rootElement = document.getElementById("root")!;
const root = createRoot(rootElement);
root.render(
  <NotificationProvider>
    <App />
  </NotificationProvider>
);
