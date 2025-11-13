import { createTheme } from "@mui/material/styles";

const theme = createTheme({
  palette: {
    mode: "light",
    primary: {
      main: "#6366F1", 
    },
    background: {
      default: "#EEF2FF", 
      paper: "#FFFFFF",
    },
    text: {
      primary: "#000000",
      secondary: "rgba(0,0,0,0.6)",
    },
  },

  typography: {
    fontFamily: "'Inter', sans-serif",
    button: {
      textTransform: "none",
      fontWeight: 500,
    },
  },

  shape: {
    borderRadius: 12, // rounded corners everywhere
  },

  components: {
    // All Buttons
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 10,
          color: "#000",
          textTransform: "none",
          paddingLeft: 16,
          paddingRight: 16,
          fontWeight: 500,
        },
      },
    },

    // Input fields (Search bar, forms)
    MuiTextField: {
      styleOverrides: {
        root: {
          backgroundColor: "white",
          borderRadius: 10,
        },
      },
    },

    // Paper (cards)
    MuiPaper: {
      styleOverrides: {
        root: {
          borderRadius: 12,
          boxShadow: "0px 1px 4px rgba(0,0,0,0.08)",
        },
      },
    },

    // AppBar/Header styling
    MuiAppBar: {
      styleOverrides: {
        root: {
          backgroundColor: "#FFFFFF",
          color: "#000",
          boxShadow: "0px 1px 4px rgba(0,0,0,0.06)",
        },
      },
    },
  },
});

export default theme;
