import { BrowserRouter } from "react-router-dom";
import AppRoutes from "./routes";
import { ThemeProvider, CssBaseline } from "@mui/material";
import theme from "../styles/theme";

export default function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <BrowserRouter>
        <AppRoutes />
      </BrowserRouter>
    </ThemeProvider>
  );
}
