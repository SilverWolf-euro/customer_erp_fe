import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";

// Styles
import './assets/index.css';

// Rồi mới import CSS từ thư viện
import "primereact/resources/themes/lara-light-indigo/theme.css";
import "primereact/resources/primereact.min.css";


// Components
import App from "./App";

// PrimeReact config (tương tự PrimeVue)
import "primereact/resources/themes/lara-light-indigo/theme.css";
import "primereact/resources/primereact.min.css";

// State management (tương tự Pinia + persistedstate)
import { StoreProvider } from "./store/StoreProvider.jsx";

// Render
ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
     <StoreProvider>
       <App />
     </StoreProvider>
  </React.StrictMode>
);
