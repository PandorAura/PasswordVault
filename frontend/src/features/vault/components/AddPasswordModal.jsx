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
  Box,
  Stack,
  Switch,
  Slider,
  Typography,
  CircularProgress, // For loading spinner
  Alert,            // For error messages
} from "@mui/material";
import { useDispatch } from "react-redux";
import { addItem } from "../vaultSlice";
import { calculatePasswordStrength } from "../../../utils/passwordStregthCalculator";

export default function AddPasswordModal({ open, onClose }) {
  const dispatch = useDispatch();

  const [activeTab, setActiveTab] = useState(0);

  // New UI states for API interaction
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const [form, setForm] = useState({
    title: "",
    username: "",
    password: "",
    url: "",
    category: "GENERAL", // Changed default to uppercase to match Backend Enum
    notes: "",
  });

  const handleChange = (field) => (e) =>
      setForm({ ...form, [field]: e.target.value });

  // Generator settings
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

  // --- UPDATED SUBMIT LOGIC ---
  const handleSubmit = async () => {
    // 1. Basic Validation
    if (!form.title || !form.password) {
      setError("Title and Password are required.");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // 2. Get Token
      const token = localStorage.getItem("authToken");
      if (!token) {
        throw new Error("You are not logged in.");
      }

      // 3. Send Request to Backend
      const response = await fetch("http://localhost:8080/api/passwords", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`, // <--- ATTACH JWT HERE
        },
        body: JSON.stringify(form),
      });

      if (!response.ok) {
        throw new Error(`Failed to save: ${response.statusText}`);
      }

      // 4. Get the real saved object from DB
    const savedData = await response.json();

    const strength = calculatePasswordStrength(form.password);

    dispatch(
      addItem({
        ...savedData,
        password: form.password, // keep only in memory
        strength,
      })
    );


      // 5. Update Redux with real DB data
      dispatch(
          addItem({
            ...savedData,
            strength, // Add strength for frontend UI
          })
      );

      // 6. Success: Close & Reset
      onClose();
      setForm({
        title: "",
        username: "",
        password: "",
        url: "",
        category: "GENERAL",
        notes: "",
      });

    } catch (err) {
      console.error(err);
      setError(err.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
      <Dialog
          open={open}
          onClose={loading ? null : onClose} // Prevent closing while loading
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
          Add New Password
          <Typography variant="body2" sx={{ color: "text.secondary", mt: 0.5 }}>
            Create a new entry for your vault
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
        <Box sx={{ height: 12 }} />

        {/* BODY */}
        <DialogContent sx={{ pt: 2 }}>

          {/* Error Alert */}
          {error && (
              <Alert severity="error" sx={{ mb: 2 }}>
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
                    disabled={loading}
                />
                <TextField
                    label="Username / Email"
                    fullWidth
                    value={form.username}
                    onChange={handleChange("username")}
                    disabled={loading}
                />
                <TextField
                    label="Password"
                    fullWidth
                    type="text" // Or "password" to hide it
                    value={form.password}
                    onChange={handleChange("password")}
                    disabled={loading}
                />
                <TextField
                    label="Website URL"
                    fullWidth
                    value={form.url}
                    onChange={handleChange("url")}
                    disabled={loading}
                />

                {/* Category Dropdown: Updated values to match Java ENUMS */}
                <TextField
                    label="Category"
                    fullWidth
                    select
                    SelectProps={{ native: true }}
                    value={form.category}
                    onChange={handleChange("category")}
                    disabled={loading}
                >
                  <option value="GENERAL">General</option>
                  <option value="SOCIAL">Social Media</option>
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
                    disabled={loading}
                />
              </Stack>
          )}

          {activeTab === 1 && (
              <Stack spacing={3} sx={{ height: "100%", flexGrow: 1 }}>
                <TextField
                    label="Generated password"
                    fullWidth
                    value={form.password}
                    readOnly
                />

                {/* Length slider */}
                <Box>
                  <Typography sx={{ fontWeight: 500 }}>Length: {length}</Typography>
                  <Slider
                      value={length}
                      onChange={(e, v) => setLength(v)}
                      min={8}
                      max={32}
                  />
                </Box>

                {/* Toggles */}
                <Box>
                  <Toggle label="Uppercase (A–Z)" value={includeUpper} onChange={setIncludeUpper} />
                  <Toggle label="Lowercase (a–z)" value={includeLower} onChange={setIncludeLower} />
                  <Toggle label="Numbers (0–9)" value={includeNums} onChange={setIncludeNums} />
                  <Toggle label="Symbols" value={includeSymbols} onChange={setIncludeSymbols} />
                </Box>

                <Box sx={{ height: 8 }} />

                <Button variant="contained" onClick={generatePassword}>
                  Generate
                </Button>
              </Stack>
          )}
        </DialogContent>

        {/* FOOTER */}
        {activeTab === 0 && (
            <DialogActions sx={{ px: 3, pb: 2 }}>
              <Button onClick={onClose} variant="outlined" disabled={loading}>
                Cancel
              </Button>
              <Button
                  variant="contained"
                  onClick={handleSubmit}
                  disabled={loading}
                  startIcon={loading ? <CircularProgress size={20} color="inherit" /> : null}
              >
                {loading ? "Saving..." : "Add Password"}
              </Button>
            </DialogActions>
        )}
      </Dialog>
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