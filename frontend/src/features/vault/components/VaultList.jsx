import React, { useEffect } from "react";
import {
  Box,
  Grid,
  Typography,
  Pagination,
  Stack,
  CircularProgress,
} from "@mui/material";
import { useSelector, useDispatch } from "react-redux";
import { fetchPasswords } from "../vaultSlice"; // Ensure this is imported
import VaultItem from "./VaultItem";

export default function VaultList({ onEditItem }) {
  const dispatch = useDispatch();
  const { items, pageInfo, status } = useSelector((state) => state.vault);
  const itemsPerPage = 6;

  useEffect(() => {
    dispatch(fetchPasswords({ page: 0, size: 6 }));
  }, [dispatch]);

  const handleChangePage = (event, value) => {
    dispatch(fetchPasswords({ page: value - 1, size: 6 }));

    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const hasItems = items && items.length > 0;

  return (
    <Box
      sx={{
        width: "100%",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        marginTop: 3,
        paddingX: 3,
        paddingBottom: 5,
      }}
    >
      {/* 2. INNER CONTAINER: */}
      <Box sx={{ width: "100%", maxWidth: "1400px" }}>
        {/* 3. EMPTY STATE: */}
        {!hasItems && status === "succeeded" && (
          <Typography
            variant="h6"
            color="text.secondary"
            align="center"
            sx={{ mt: 4 }}
          >
            Your vault is empty. Add a new item to get started.
          </Typography>
        )}

        <Grid container spacing={3}>
          {items.map((item) => (
            <Grid
              key={item.id}
              item
              xs={12}
              sm={6}
              md={4}
              // Added display: flex to ensure cards are equal height
              sx={{ display: "flex" }}
            >
              <VaultItem item={item} onEdit={onEditItem} />
            </Grid>
          ))}
        </Grid>

        {/* 4. PAGINATION: */}
        {pageInfo?.totalPages > 1 && (
          <Stack spacing={2} alignItems="center" sx={{ marginTop: 4 }}>
            <Pagination
              count={pageInfo.totalPages}
              page={pageInfo.currentPage + 1} // Sync back to 1-based for UI
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
