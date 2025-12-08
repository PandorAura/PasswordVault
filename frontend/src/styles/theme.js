
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
    borderRadius: 12,
  },

  components: {
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

        outlined: {
          borderColor: "#E5E7EB",
          backgroundColor: "#FFFFFF",
          "&:hover": {
            borderColor: "#CBD5E1",
            backgroundColor: "#F9FAFB",
          },
        },
      },
    },

    MuiTextField: {
      styleOverrides: {
        root: {
          backgroundColor: "white",
          borderRadius: 10,
        },
      },
    },

    MuiPaper: {
      styleOverrides: {
        root: {
          borderRadius: 12,
          boxShadow: "0px 1px 4px rgba(0,0,0,0.08)",
        },
      },
    },

    MuiAppBar: {
      styleOverrides: {
        root: {
          backgroundColor: "#FFFFFF",
          color: "#000",
          boxShadow: "0px 1px 4px rgba(0,0,0,0.06)",
        },
      },
    },

    MuiTabs: {
      styleOverrides: {
        indicator: {
          backgroundColor: "#6366F1",
        },
      },
    },

    MuiTab: {
      styleOverrides: {
        root: {
          textTransform: "none",
          fontWeight: 500,
        },
      },
    },

    MuiMenuItem: {
      styleOverrides: {
        root: {
          fontFamily: "'Inter', sans-serif",
          fontSize: "0.95rem",
          paddingTop: 10,
          paddingBottom: 10,
          borderRadius: 6,
          transition: "background-color 0.15s ease",

          "&.Mui-selected": {
            backgroundColor: "#EEF2FF !important",
            color: "#6366F1",
          },

          "&.Mui-selected:hover": {
            backgroundColor: "#E0E7FF !important",
          },

          "&:hover": {
            backgroundColor: "#F3F4F6",
          },
        },
      },
    },
  },
});

export default theme;
