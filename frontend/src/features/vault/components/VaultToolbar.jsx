import React from "react";
import {
  Box,
  TextField,
  Button,
  MenuItem,
  Select,
  InputAdornment,
  Paper,
} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import AddIcon from "@mui/icons-material/Add";
import SecurityIcon from "@mui/icons-material/Security";

export default function VaultToolbar({
  search,
  setSearch,
  category,
  setCategory,
  onOpenModal,
  onCheckBreaches,
}) {
  return (
    <Box
      sx={{
        width: "100%",
        display: "flex",
        justifyContent: "center",
        paddingX: 3,
        marginTop: 3,
      }}
    >
      <Paper
        elevation={0}
        sx={{
          width: "100%",
          maxWidth: "1400px",
          padding: 2,
          backgroundColor: "white",
          borderRadius: 1,
        }}
      >
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: 2,
          }}
        >
          {/* SEARCH BAR (fixed width) */}
          <TextField
            placeholder="Search passwords..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            sx={{
              width: "570px",
              height: "48px",
            }}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon sx={{ color: "text.secondary" }} />
                </InputAdornment>
              ),
              sx: {
                height: "48px",
              },
            }}
          />

          {/* RIGHT SIDE BUTTONS */}
          <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
            {/* CATEGORY DROPDOWN */}
            <Select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              sx={{
                width: "250px",
                height: "48px",
                backgroundColor: "white",
                borderRadius: 1,
              }}
            >
              <MenuItem value="all">All</MenuItem>
              <MenuItem value="general">General</MenuItem>
              <MenuItem value="work">Work</MenuItem>
              <MenuItem value="banking">Banking</MenuItem>
              <MenuItem value="personal">Personal</MenuItem>
              <MenuItem value="other">Other</MenuItem>
            </Select>

            {/* CHECK BREACHES */}
            <Button
              variant="outlined"
              startIcon={<SecurityIcon />}
              onClick={onCheckBreaches}
              sx={{
                height: "48px",
                width: "250px",
                backgroundColor: "white",
                borderColor: "#E2E8F0",
                "&:hover": {
                  borderColor: "#c7cdd6",
                  backgroundColor: "#f9f9f9",
                },
              }}
            >
              Check All Breaches
            </Button>

            {/* ADD PASSWORD */}
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={onOpenModal}
              sx={{
                height: "48px",
                width: "250px",
                backgroundColor: "black",
                color: "white",
                borderRadius: "10px",
                "&:hover": {
                  backgroundColor: "#222",
                },
              }}
            >
              Add Password
            </Button>
          </Box>
        </Box>
      </Paper>
    </Box>
  );
}
