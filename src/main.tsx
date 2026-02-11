import { createRoot } from "react-dom/client";
import App from "./app/App.tsx";
import "./styles/index.css";

const rootElement = document.getElementById("root")!;
try {
  createRoot(rootElement).render(<App />);
} catch (error) {
  console.error("Critical Render Error:", error);
  rootElement.innerHTML = `
      <div style="padding: 20px; color: red; font-family: sans-serif;">
        <h1>Critical App Error</h1>
        <p>Something went wrong during rendering. Please check the console.</p>
        <pre>${error instanceof Error ? error.message : String(error)}</pre>
      </div>
    `;
}
