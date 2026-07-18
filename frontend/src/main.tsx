import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import { App } from "./App";
import { AuthProvider } from "./contexts/AuthContext";
import { LocationProvider } from "./contexts/LocationContext";
import { HealthProfileProvider } from "./contexts/HealthProfileContext";
import "./styles/index.css";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <BrowserRouter>
      <AuthProvider>
        <LocationProvider>
          <HealthProfileProvider>
            <App />
          </HealthProfileProvider>
        </LocationProvider>
      </AuthProvider>
    </BrowserRouter>
  </StrictMode>
);
