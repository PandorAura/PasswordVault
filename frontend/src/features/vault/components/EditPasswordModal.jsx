import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  CircularProgress,
  Tabs,
  Tab,
  Box,
  Stack,
  Switch,
  Slider,
  Typography,
  Alert,
  Snackbar,
} from "@mui/material";
import { useDispatch } from "react-redux";
import { updatePassword } from "../vaultSlice";
import { calculatePasswordStrength } from "../../../utils/passwordStregthCalculator";
import { getStoredKey, decryptPassword } from "../../../utils/cryptoUtils";

export default function EditPasswordModal({ open, onClose, item }) {
  const dispatch = useDispatch();

  const [activeTab, setActiveTab] = useState(0);

  const emptyForm = {
    title: "",
    username: "",
    password: "",
    url: "",
    category: "General",
    notes: "",
  };

  const [form, setForm] = useState(item || emptyForm);

  useEffect(() => {
    if (item && open) {
      const initialForm = {
        id: item.id,
        title: item.title,
        username: item.username,
        url: item.url || "",
        category: item.category || "General",
        notes: item.notes || "",
        password: "", 
        encryptionIv: item.encryptionIv,
      };

      const ek = getStoredKey();
      if (ek && item.encryptedPassword) {
        decryptPassword(item.encryptedPassword, item.encryptionIv, ek)
          .then((decrypted) => {
            setForm({ ...initialForm, password: decrypted });
          })
          .catch((err) => {
            console.error("Failed to decrypt for edit:", err);
            setForm({ ...initialForm, password: "" }); 
          });
      } else {
        setForm(initialForm);
      }
    }
  }, [item, open]); 

  const handleChange = (field) => (e) =>
    setForm({ ...form, [field]: e.target.value });

  // Generator settings
  const [length, setLength] = useState(16);
  const [includeUpper, setIncludeUpper] = useState(true);
  const [includeLower, setIncludeLower] = useState(true);
  const [includeNums, setIncludeNums] = useState(true);
  const [includeSymbols, setIncludeSymbols] = useState(false);
  const [fieldErrors, setFieldErrors] = useState({});

  const [loading, setLoading] = useState(false); 
  const [error, setError] = useState(null);
  const [snackbar, setSnackbar] = useState({ open: false, message: "", type: "success" });

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
    const errors = {};

    // 1. Validation Logic
    if (!form.title.trim()) errors.title = "Title is required";
    if (!form.username.trim()) errors.username = "Username is required";
    if (!form.password.trim()) errors.password = "Password cannot be empty";

    const urlRegex = /^(https?:\/\/)?([\w\d-]+\.)+[\w\d]{2,}(\/.*)?$/;
    if (form.url && !urlRegex.test(form.url)) {
      errors.url = "Invalid URL format";
    }

    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
      return;
    }


    setError(null);
    const strength = calculatePasswordStrength(form.password);

    console.log("Attempting to send update for ID:", form.id); 

    try {
      setLoading(true);

      const resultAction = await dispatch(
        updatePassword({
          ...form,
          strength,
          updatedAt: new Date().toLocaleDateString(),
        })
      );

      if (updatePassword.fulfilled.match(resultAction)) {
        console.log("Update successful!");
        setSnackbar({ open: true, message: "Password updated successfully!", type: "success" });
        
        setTimeout(() => {
          onClose();
        }, 300);
      } else {
        console.error("Update failed:", resultAction.payload);
        const errorMsg = resultAction.payload || "Server error";
        setError(errorMsg);
        setSnackbar({ open: true, message: errorMsg, type: "error" });
      }
    } catch {
      const errorMsg = "An unexpected error occurred";
      setError(errorMsg);
      setSnackbar({ open: true, message: errorMsg, type: "error" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
    <Dialog
      open={open}
      onClose={onClose}
      fullWidth
      maxWidth="sm"
      slotProps={{
        paper: {
          sx: {
            borderRadius: 4,
            height: "95vh",
            maxHeight: "100vh",
            display: "flex",
            flexDirection: "column",
          },
        },
      }}
    >
      {/* HEADER */}
      <DialogTitle sx={{ fontWeight: 600, pb: 1 }}>
        Edit Password
        <Typography variant="body2" sx={{ color: "text.secondary", mt: 0.5 }}>
          Modify the existing vault entry
        </Typography>
      </DialogTitle>

      {/* TABS */}
      <Tabs
        value={activeTab}
        onChange={(e, v) => setActiveTab(v)}
        sx={{ px: 3 }}
      >
        <Tab label="Details" />
        <Tab label="Generator" />
      </Tabs>

      <DialogContent sx={{ pt: 2 }}>
        {/* GLOBAL ERROR ALERT */}
        {error && (
          <Alert
            severity="error"
            sx={{ mb: 2, borderRadius: 2 }}
            onClose={() => setError(null)} 
          >
            {error}
          </Alert>
        )}

        {activeTab === 0 && (
          <Stack spacing={2}>
            <TextField
              label="Title"
              fullWidth
              value={form.title}
              onChange={handleChange("title")}
              error={Boolean(fieldErrors.title)}
              helperText={fieldErrors.title}
            />
            <TextField
              label="Username / Email"
              fullWidth
              value={form.username}
              onChange={handleChange("username")}
              error={Boolean(fieldErrors.username)}
              helperText={fieldErrors.username}
            />
            <TextField
              label="Password"
              fullWidth
              type="text"
              value={form.password}
              onChange={handleChange("password")}
              error={Boolean(fieldErrors.password)}
              helperText={fieldErrors.password}
            />
            <TextField
              label="Website URL"
              fullWidth
              value={form.url}
              onChange={handleChange("url")}
              error={Boolean(fieldErrors.url)}
              helperText={fieldErrors.url}
            />
            <TextField
              label="Category"
              fullWidth
              select
              SelectProps={{ native: true }}
              value={form.category}
              onChange={handleChange("category")}
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
              label="Notes"
              fullWidth
              multiline
              rows={3}
              value={form.notes}
              onChange={handleChange("notes")}
            />
          </Stack>
        )}

        {activeTab === 1 && (
          <Stack spacing={3}>
            <TextField
              label="Generated password"
              fullWidth
              value={form.password}
              readOnly
            />

            <Box>
              <Typography sx={{ fontWeight: 500 }}>Length: {length}</Typography>
              <Slider
                value={length}
                onChange={(e, v) => setLength(v)}
                min={8}
                max={32}
              />
            </Box>

            <Box>
              <Toggle
                label="Uppercase (A–Z)"
                value={includeUpper}
                onChange={setIncludeUpper}
              />
              <Toggle
                label="Lowercase (a–z)"
                value={includeLower}
                onChange={setIncludeLower}
              />
              <Toggle
                label="Numbers (0–9)"
                value={includeNums}
                onChange={setIncludeNums}
              />
              <Toggle
                label="Symbols"
                value={includeSymbols}
                onChange={setIncludeSymbols}
              />
            </Box>

            <Button variant="contained" onClick={generatePassword}>
              Generate
            </Button>
          </Stack>
        )}
      </DialogContent>

      <DialogActions sx={{ px: 3, pb: 2 }}>
        <Button onClick={onClose} variant="outlined">
          Cancel
        </Button>
        <Button
          variant="contained"
          onClick={handleSubmit}
          disabled={loading}
          startIcon={
            loading ? <CircularProgress size={20} color="inherit" /> : null
          }
        >
          {loading ? "Saving..." : "Save Changes"}
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
    <Stack
      direction="row"
      justifyContent="space-between"
      alignItems="center"
      sx={{ py: 1 }}
    >
      <Typography>{label}</Typography>
      <Switch checked={value} onChange={(e) => onChange(e.target.checked)} />
    </Stack>
  );
}
