import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.jsx";
import { createTheme, ThemeProvider } from "@mui/material";
import { AuthProvider } from "./AuthContext.jsx";
import TopBar from "./components/TopBar.jsx";
import ErrorPage from "./components/ErrorPage.jsx";
import { BrowserRouter } from "react-router-dom";

const theme = createTheme({
  palette: {
    mode: "dark"
  },
});

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <ThemeProvider theme={theme}>
      <AuthProvider>
        <BrowserRouter>
          <App />
        </BrowserRouter>
      </AuthProvider>
    </ThemeProvider>
  </StrictMode>
);
