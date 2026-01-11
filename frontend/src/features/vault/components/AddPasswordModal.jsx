import React, { useState } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  Tabs,
  Tab,
  Stack,
  Switch,
  Slider,
  Typography,
  CircularProgress,
  Alert,
  Snackbar,
} from "@mui/material";
import VisibilityIcon from "@mui/icons-material/Visibility";
import VisibilityOffIcon from "@mui/icons-material/VisibilityOff";
import { useDispatch } from "react-redux";
import { addPassword } from "../vaultSlice";

export default function AddPasswordModal({ open, onClose }) {
  const dispatch = useDispatch();

  const [activeTab, setActiveTab] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [snackbar, setSnackbar] = useState({ open: false, message: "", type: "success" });

  const [form, setForm] = useState({
    title: "",
    username: "",
    password: "",
    url: "",
    category: "GENERAL",
    notes: "",
  });

  const handleChange = (field) => (e) =>
    setForm({ ...form, [field]: e.target.value });

  const [length, setLength] = useState(16);
  const [includeUpper, setIncludeUpper] = useState(true);
  const [includeLower, setIncludeLower] = useState(true);
  const [includeNums, setIncludeNums] = useState(true);
  const [includeSymbols, setIncludeSymbols] = useState(false);

  const generatePassword = () => {
    let chars = "";
    if (includeUpper) chars += "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
    if (includeLower) chars += "abcdefghijklmnopqrstuvwxyz";
    if (includeNums) chars += "0123456789";
    if (includeSymbols) chars += "!@#$%^&*()_+-=[]{};:,.<>/?";

    if (!chars) return;

    let pwd = "";
    for (let i = 0; i < length; i++) {
      pwd += chars[Math.floor(Math.random() * chars.length)];
    }

    setForm({ ...form, password: pwd });
  };

  const handleSubmit = async () => {
    if (!form.title || !form.password) {
      setError("Title and Password are required.");
      return;
    }

    setLoading(true);
    try {
      await dispatch(addPassword(form)).unwrap();

      setSnackbar({ open: true, message: "Password added successfully!", type: "success" });
      setForm({ title: "", username: "", password: "", url: "", category: "GENERAL", notes: "" });
      
      onClose();
    } catch (err) {
      setError(err.message || "Failed to save password");
      setSnackbar({ open: true, message: err.message || "Failed to save password", type: "error" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
    <Dialog
      open={open}
      onClose={loading ? null : onClose}
      fullWidth
      maxWidth="sm"
    >
      <DialogTitle>Add password</DialogTitle>

      <Tabs value={activeTab} onChange={(e, v) => setActiveTab(v)} sx={{ px: 3 }}>
        <Tab label="Details" />
        <Tab label="Generator" />
      </Tabs>

      <DialogContent>
        <Stack spacing={2} sx={{ mt: 1 }}>
          {error && <Alert severity="error">{error}</Alert>}

          {activeTab === 0 && (
            <>
              <TextField
                fullWidth
                value={form.title}
                onChange={handleChange("title")}
                placeholder="Title"
                disabled={loading}
              />

              <TextField
                fullWidth
                value={form.username}
                onChange={handleChange("username")}
                placeholder="Username / Email"
                disabled={loading}
              />

              <TextField
                fullWidth
                type={showPassword ? "text" : "password"}
                value={form.password}
                onChange={handleChange("password")}
                placeholder="Password"
                disabled={loading}
                InputProps={{
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton
                        onClick={() => setShowPassword((v) => !v)}
                        edge="end"
                        aria-label="toggle password visibility"
                      >
                        {showPassword ? <VisibilityOffIcon /> : <VisibilityIcon />}
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
              />

              <TextField
                fullWidth
                value={form.url}
                onChange={handleChange("url")}
                placeholder="Website URL"
                disabled={loading}
              />

              <TextField
                select
                fullWidth
                SelectProps={{ native: true }}
                value={form.category}
                onChange={handleChange("category")}
                disabled={loading}
              >
                <option value="GENERAL">General</option>
                <option value="SOCIAL">Social</option>
                <option value="EMAIL">Email</option>
                <option value="BANKING">Banking</option>
                <option value="WORK">Work</option>
                <option value="ENTERTAINMENT">Entertainment</option>
                <option value="OTHER">Other</option>
              </TextField>

              <TextField
                fullWidth
                multiline
                rows={3}
                value={form.notes}
                onChange={handleChange("notes")}
                placeholder="Notes"
                disabled={loading}
              />
            </>
          )}

          {activeTab === 1 && (
            <>
              <TextField
                fullWidth
                value={form.password}
                type={showPassword ? "text" : "password"}
                placeholder="Generated password"
                InputProps={{
                  readOnly: true,
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton
                        onClick={() => setShowPassword((v) => !v)}
                        edge="end"
                        aria-label="toggle password visibility"
                      >
                        {showPassword ? <VisibilityOffIcon /> : <VisibilityIcon />}
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
              />

              <Typography>Length: {length}</Typography>
              <Slider
                min={8}
                max={32}
                value={length}
                onChange={(e, v) => setLength(v)}
              />

              <Toggle label="Uppercase" value={includeUpper} onChange={setIncludeUpper} />
              <Toggle label="Lowercase" value={includeLower} onChange={setIncludeLower} />
              <Toggle label="Numbers" value={includeNums} onChange={setIncludeNums} />
              <Toggle label="Symbols" value={includeSymbols} onChange={setIncludeSymbols} />

              <Button variant="contained" onClick={generatePassword}>
                Generate
              </Button>
            </>
          )}
        </Stack>
      </DialogContent>

      <DialogActions>
        <Button variant="outlined" onClick={onClose} disabled={loading}>
          Cancel
        </Button>
        <Button
          variant="contained"
          onClick={handleSubmit}
          disabled={loading || activeTab !== 0}
          startIcon={loading ? <CircularProgress size={16} /> : null}
        >
          {loading ? "Saving..." : "Add Password"}
        </Button>
      </DialogActions>
    </Dialog>

    {/* SNACKBAR NOTIFICATION */}
    <Snackbar
      open={snackbar.open}
      autoHideDuration={3000}
      onClose={() => setSnackbar({ ...snackbar, open: false })}
      anchorOrigin={{ vertical: "top", horizontal: "center" }}
      sx={{
        top: { xs: "16px", sm: "24px" },
        zIndex: 9999,
      }}
    >
      <Alert
        onClose={() => setSnackbar({ ...snackbar, open: false })}
        severity={snackbar.type}
        variant="filled"
        sx={{
          width: "100%",
          borderRadius: 3,
          fontFamily: "'Inter', sans-serif",
          fontWeight: 500,
          boxShadow: "0px 4px 12px rgba(0, 0, 0, 0.15)",
          "& .MuiAlert-icon": {
            fontSize: "1.25rem",
          },
          ...(snackbar.type === "success" && {
            backgroundColor: "#6366F1",
            "&:hover": {
              backgroundColor: "#5855eb",
            },
          }),
        }}
      >
        {snackbar.message}
      </Alert>
    </Snackbar>
    </>
  );
}

function Toggle({ label, value, onChange }) {
  return (
    <Stack direction="row" justifyContent="space-between" alignItems="center">
      <Typography>{label}</Typography>
      <Switch checked={value} onChange={(e) => onChange(e.target.checked)} />
    </Stack>
  );
}
