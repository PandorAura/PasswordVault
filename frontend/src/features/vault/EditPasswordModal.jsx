import React, { useState, useEffect } from "react";
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
} from "@mui/material";
import { useDispatch } from "react-redux";
import { editItem } from "./vaultSlice";
import { calculatePasswordStrength } from "../../utils/passwordStregthCalculator";

export default function EditPasswordModal({ open, onClose, item }) {
  const dispatch = useDispatch();

  // Tabs
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
    if (item) {
      setForm(item);
    }
  }, [item]);

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

  const handleSubmit = () => {
    const strength = calculatePasswordStrength(form.password);

    dispatch(
      editItem({
        ...form,
        strength,
        updatedAt: new Date().toLocaleDateString(),
      })
    );

    onClose();
  };

  return (
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
        {activeTab === 0 && (
          <Stack spacing={2}>
            <TextField
              label="Title"
              fullWidth
              value={form.title}
              onChange={handleChange("title")}
            />
            <TextField
              label="Username / Email"
              fullWidth
              value={form.username}
              onChange={handleChange("username")}
            />
            <TextField
              label="Password"
              fullWidth
              type="text"
              value={form.password}
              onChange={handleChange("password")}
            />
            <TextField
              label="Website URL"
              fullWidth
              value={form.url}
              onChange={handleChange("url")}
            />
            <TextField
              label="Category"
              fullWidth
              select
              SelectProps={{ native: true }}
              value={form.category}
              onChange={handleChange("category")}
            >
              <option>General</option>
              <option>Social Media</option>
              <option>Email</option>
              <option>Banking</option>
              <option>Work</option>
              <option>Entertainment</option>
              <option>Other</option>
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
        <Button variant="contained" onClick={handleSubmit}>
          Save Changes
        </Button>
      </DialogActions>
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
