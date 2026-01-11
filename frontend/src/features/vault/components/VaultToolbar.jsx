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
        paddingX: { xs: 2, sm: 3 },
        marginTop: { xs: 2, sm: 3 },
        marginBottom: { xs: 2, sm: 3 },
      }}
    >
      <Paper
        elevation={0}
        sx={{
          width: { xs: "100%", sm: "100%", md: "90%" },
          maxWidth: "1400px",
          padding: { xs: 1.5, sm: 2 },
          backgroundColor: "white",
          borderRadius: 1,
        }}
      >
        <Box
          sx={{
            display: "flex",
            flexDirection: { xs: "column", md: "row" },
            alignItems: { xs: "stretch", md: "center" },
            justifyContent: "space-between",
            gap: 2,
          }}
        >
          {/* SEARCH BAR (responsive width) */}
          <TextField
            placeholder="Search passwords..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            sx={{
              flex: { xs: 1, md: "0 1 400px" },
              minWidth: { xs: "100%", md: "300px" },
              maxWidth: { xs: "100%", md: "570px" },
            }}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon sx={{ color: "text.secondary" }} />
                </InputAdornment>
              ),
            }}
          />

          {/* RIGHT SIDE BUTTONS */}
          <Box 
            sx={{ 
              display: "flex", 
              flexDirection: { xs: "column", sm: "row" },
              alignItems: "stretch",
              gap: 2,
              flex: { xs: 1, md: "0 0 auto" },
              width: { xs: "100%", md: "auto" },
            }}
          >
            {/* CATEGORY DROPDOWN */}
            <Select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              sx={{
                flex: { xs: 1, sm: "0 0 180px" },
                minWidth: { xs: "100%", sm: "180px" },
                maxWidth: { xs: "100%", sm: "250px" },
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
                flex: { xs: 1, sm: "0 0 auto" },
                minWidth: { xs: "100%", sm: "180px" },
                maxWidth: { xs: "100%", sm: "250px" },
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
                flex: { xs: 1, sm: "0 0 auto" },
                minWidth: { xs: "100%", sm: "180px" },
                maxWidth: { xs: "100%", sm: "250px" },
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
