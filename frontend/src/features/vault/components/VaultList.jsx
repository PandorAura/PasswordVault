import React, { useEffect, useState } from "react";
import {
  Box,
  Typography,
  Pagination,
  Stack,
  CircularProgress,
} from "@mui/material";
import { useSelector, useDispatch } from "react-redux";
import { fetchPasswords } from "../vaultSlice";
import VaultItem from "./VaultItem";
import { useNavigate } from "react-router-dom";
import { getStoredKey } from "../../../utils/cryptoUtils";

export default function VaultList({
  onEditItem,
  onDeleteSuccess,
  onDeleteError,
  search = "",
  category = "all",
}) {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const { items, pageInfo, status } = useSelector((state) => state.vault);
  const itemsPerPage = 6;

  // --- Debounce search to avoid spamming the API on every keystroke
  const [debouncedSearch, setDebouncedSearch] = useState(search);

  useEffect(() => {
    const t = setTimeout(() => setDebouncedSearch(search), 350);
    return () => clearTimeout(t);
  }, [search]);

  useEffect(() => {
    const key = getStoredKey();
    if (!key) {
      navigate("/check-master");
    }
  }, [navigate]);

  // Fetch page 0 whenever filters change
  useEffect(() => {
    dispatch(
      fetchPasswords({
        page: 0,
        size: itemsPerPage,
        search: debouncedSearch,
        category,
      })
    );
  }, [dispatch, debouncedSearch, category]);

  const handleChangePage = (event, value) => {
    dispatch(
      fetchPasswords({
        page: value - 1,
        size: itemsPerPage,
        search: debouncedSearch,
        category,
      })
    );
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const hasItems = items && items.length > 0;

  return (
    <Box
      sx={{
        width: "100%",
        display: "flex",
        justifyContent: "center",
        paddingX: { xs: 2, sm: 3 },
        paddingBottom: 5,
      }}
    >
      {/* INNER CONTAINER */}
      <Box
        sx={{
          width: { xs: "100%", sm: "100%", md: "90%" },
          maxWidth: "1400px",
        }}
      >
        {/* Loading */}
        {status === "loading" && (
          <Box sx={{ display: "flex", justifyContent: "center", mt: 6 }}>
            <CircularProgress />
          </Box>
        )}

        {/* Empty state */}
        {!hasItems && status === "succeeded" && (
          <Typography
            variant="h6"
            color="text.secondary"
            align="center"
            sx={{ mt: 4 }}
          >
            {debouncedSearch || category !== "all"
              ? "No passwords match your filters."
              : "Your vault is empty. Add a new item to get started."}
          </Typography>
        )}

        {/* Optional: result count when filtering */}
        {status === "succeeded" && (debouncedSearch || category !== "all") && (
          <Typography variant="body2" color="text.secondary" sx={{ mt: 2, mb: 1 }}>
            Results: {pageInfo?.totalElements ?? 0}
          </Typography>
        )}

        {/* Grid */}
        {status !== "loading" && hasItems && (
          <Box
            sx={{
              display: "grid",
              gridTemplateColumns: {
                xs: "1fr",
                sm: "repeat(2, minmax(0, 1fr))",
                md: "repeat(3, minmax(0, 1fr))",
              },
              gap: 3,
              alignItems: "stretch",
            }}
          >
            {items.map((item) => (
              <Box key={item.id} sx={{ display: "flex", minWidth: 0 }}>
                <VaultItem
                  item={item}
                  onEdit={onEditItem}
                  onDeleteSuccess={onDeleteSuccess}
                  onDeleteError={onDeleteError}
                />
              </Box>
            ))}
          </Box>
        )}

        {/* Pagination */}
        {pageInfo?.totalPages > 1 && (
          <Stack spacing={2} alignItems="center" sx={{ marginTop: 4 }}>
            <Pagination
              count={pageInfo.totalPages}
              page={pageInfo.currentPage + 1}
              onChange={handleChangePage}
              color="primary"
              showFirstButton
              showLastButton
            />
          </Stack>
        )}
      </Box>
    </Box>
  );
}
