import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import App from "./App";
import { ThemeProvider } from "./context/ThemeContext";
import { Web3Provider } from "./context/Web3Context";
import "./index.css";

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <BrowserRouter>
      <ThemeProvider>
        <Web3Provider>
          <App />
        </Web3Provider>
      </ThemeProvider>
    </BrowserRouter>
  </React.StrictMode>
);
