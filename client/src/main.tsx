import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";

// Polyfill for chrome video time format
if (!HTMLTimeElement.prototype.hasOwnProperty("dateTime")) {
  Object.defineProperty(HTMLTimeElement.prototype, "dateTime", {
    get: function() {
      return this.getAttribute("datetime") || "";
    },
    set: function(val) {
      this.setAttribute("datetime", val);
    }
  });
}

createRoot(document.getElementById("root")!).render(<App />);
