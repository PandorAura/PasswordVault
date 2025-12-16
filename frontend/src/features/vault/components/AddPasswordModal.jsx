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
  CircularProgress,
  Alert,
} from "@mui/material";
import { useDispatch } from "react-redux";
import { addItem } from "../vaultSlice";
import { calculatePasswordStrength } from "../../../utils/passwordStregthCalculator";

export default function AddPasswordModal({ open, onClose }) {
  const dispatch = useDispatch();

  const [activeTab, setActiveTab] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

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

  // Password generator settings
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

  // ---------------- SUBMIT ----------------
  const handleSubmit = async () => {
    if (!form.title || !form.password) {
      setError("Title and Password are required.");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const token = localStorage.getItem("authToken");
      if (!token) {
        throw new Error("You are not logged in.");
      }

      const response = await fetch("http://localhost:8080/api/passwords", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          title: form.title,
          username: form.username,
          password: form.password,
          url: form.url,
          category: form.category,
          notes: form.notes,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to save password");
      }

      const savedData = await response.json();

      const strength = calculatePasswordStrength(form.password);

      // ✅ SINGLE, CORRECT DISPATCH
      dispatch(
        addItem({
          id: savedData.id,                     // UUID from backend
          title: savedData.title,
          username: savedData.usernameOrEmail,
          password: form.password,              // frontend-only
          url: savedData.websiteUrl,
          category: form.category,
          notes: form.notes,
          strength,
          updatedAt: new Date().toLocaleDateString(),
        })
      );

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
      onClose={loading ? null : onClose}
      fullWidth
      maxWidth="sm"
    >
      <DialogTitle sx={{ fontWeight: 600 }}>
        Add New Password
        <Typography variant="body2" color="text.secondary">
          Create a new entry for your vault
        </Typography>
      </DialogTitle>

      <Tabs value={activeTab} onChange={(e, v) => setActiveTab(v)} sx={{ px: 3 }}>
        <Tab label="Details" />
        <Tab label="Generator" />
      </Tabs>

      <DialogContent>
        {error && <Alert severity="error">{error}</Alert>}

        {activeTab === 0 && (
          <Stack spacing={2} sx={{ mt: 2 }}>
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

            <TextField
              label="Category"
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
          <Stack spacing={3} sx={{ mt: 2 }}>
            <TextField
              label="Generated password"
              fullWidth
              value={form.password}
              readOnly
            />

            <Typography>Length: {length}</Typography>
            <Slider min={8} max={32} value={length} onChange={(e, v) => setLength(v)} />

            <Toggle label="Uppercase" value={includeUpper} onChange={setIncludeUpper} />
            <Toggle label="Lowercase" value={includeLower} onChange={setIncludeLower} />
            <Toggle label="Numbers" value={includeNums} onChange={setIncludeNums} />
            <Toggle label="Symbols" value={includeSymbols} onChange={setIncludeSymbols} />

            <Button variant="contained" onClick={generatePassword}>
              Generate
            </Button>
          </Stack>
        )}
      </DialogContent>

      {activeTab === 0 && (
        <DialogActions>
          <Button onClick={onClose} disabled={loading}>
            Cancel
          </Button>
          <Button
            variant="contained"
            onClick={handleSubmit}
            disabled={loading}
            startIcon={loading && <CircularProgress size={20} />}
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
    <Stack direction="row" justifyContent="space-between" alignItems="center">
      <Typography>{label}</Typography>
      <Switch checked={value} onChange={(e) => onChange(e.target.checked)} />
    </Stack>
  );
}
