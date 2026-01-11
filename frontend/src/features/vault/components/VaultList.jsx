import React, { useEffect, useMemo } from "react";
import {
  Box,
  Grid,
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

export default function VaultList({ onEditItem, search = "", category = "all" }) {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const { items, pageInfo, status } = useSelector((state) => state.vault);
  const itemsPerPage = 6;

  useEffect(() => {
    const key = getStoredKey();
    if (!key) navigate("/check-master");
  }, [navigate]);

  useEffect(() => {
    dispatch(fetchPasswords({ page: 0, size: itemsPerPage }));
  }, [dispatch]);

  const handleChangePage = (event, value) => {
    dispatch(fetchPasswords({ page: value - 1, size: itemsPerPage }));
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const filteredItems = useMemo(() => {
    return (items || []).filter((item) => {
      // category filter
      if (category !== "all" && item.category !== category) return false;

      // search filter
      const q = search.toLowerCase().trim();
      if (!q) return true;

      return (
        item.title?.toLowerCase().includes(q) ||
        item.websiteUrl?.toLowerCase().includes(q) ||
        item.usernameOrEmail?.toLowerCase().includes(q) ||
        item.notes?.toLowerCase().includes(q)
      );
    });
  }, [items, search, category]);

  const hasItems = filteredItems.length > 0;

  return (
    <Box
      sx={{
        width: "100%",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        paddingX: 3,
        paddingBottom: 5,
      }}
    >
      <Box sx={{ width: "100%", maxWidth: "1400px" }}>
        {/* Loading state */}
        {status === "loading" && (
          <Box sx={{ display: "flex", justifyContent: "center", mt: 6 }}>
            <CircularProgress />
          </Box>
        )}

        {/* Empty state */}
        {status === "succeeded" && !hasItems && (
          <Typography
            variant="h6"
            color="text.secondary"
            align="center"
            sx={{ mt: 4 }}
          >
            {search || category !== "all"
              ? "No passwords match your filters."
              : "Your vault is empty. Add a new item to get started."}
          </Typography>
        )}

        {/* Optional: show result count when filtering */}
        {status === "succeeded" && (search || category !== "all") && (
          <Typography
            variant="body2"
            color="text.secondary"
            sx={{ mt: 2, mb: 1 }}
          >
            Showing {filteredItems.length}{" "}
            {filteredItems.length === 1 ? "item" : "items"}
            {category !== "all" ? ` in "${category}"` : ""}
          </Typography>
        )}

        {/* Keep the exact grid layout that works */}
        {status !== "loading" && (
          <Grid container spacing={3}>
            {filteredItems.map((item) => (
              <Grid
                key={item.id}
                item
                xs={12}
                sm={6}
                md={4}
                sx={{ display: "flex" }}
              >
                <VaultItem item={item} onEdit={onEditItem} />
              </Grid>
            ))}
          </Grid>
        )}

        {/* Pagination unchanged */}
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