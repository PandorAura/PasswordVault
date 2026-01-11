import { useEffect, useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchPasswords } from "../vaultSlice";
import {
  Box,
  Container,
  Pagination,
  Stack,
  Typography,
  CircularProgress,
  Grid,
} from "@mui/material";
import VaultItem from "./VaultItem";

export default function VaultList({ onEditItem, search = "", category = "all" }) {
  const dispatch = useDispatch();

  const { items, pageInfo, status } = useSelector((state) => state.vault);
  const itemsPerPage = 6;

  useEffect(() => {
    dispatch(fetchPasswords({ page: 0, size: itemsPerPage }));
  }, [dispatch]);

  const handleChangePage = (event, value) => {
    dispatch(fetchPasswords({ page: value - 1, size: itemsPerPage }));
  };

  // Filter items based on search and category
  const filteredItems = useMemo(() => {
    return items.filter((item) => {
      // Category filter
      if (category !== "all" && item.category !== category) {
        return false;
      }

      // Search filter - case insensitive
      const query = search.toLowerCase().trim();
      if (!query) return true;

      return (
        item.title?.toLowerCase().includes(query) ||
        item.websiteUrl?.toLowerCase().includes(query) ||
        item.usernameOrEmail?.toLowerCase().includes(query) ||
        item.notes?.toLowerCase().includes(query)
      );
    });
  }, [items, search, category]);

  const hasItems = filteredItems && filteredItems.length > 0;

  if (status === "loading") {
    return (
      <Box
        sx={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          minHeight: "400px",
        }}
      >
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      {/* Search results info */}
      {search && (
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          Found {filteredItems.length} {filteredItems.length === 1 ? "item" : "items"}
          {category !== "all" && ` in "${category}"`}
        </Typography>
      )}

      {/* Empty state */}
      {!hasItems ? (
        <Box
          sx={{
            textAlign: "center",
            py: 8,
            color: "text.secondary",
          }}
        >
          <Typography variant="h6">
            {search ? "No passwords found" : "No passwords yet"}
          </Typography>
          <Typography variant="body2" sx={{ mt: 1 }}>
            {search
              ? "Try a different search term or category"
              : "Click 'Add Password' to get started"}
          </Typography>
        </Box>
      ) : (
        <>
          {/* Password items in grid */}
          <Grid container spacing={2}>
            {filteredItems.map((item) => (
              <Grid item xs={12} sm={6} md={4} key={item.id}>
                <VaultItem
                  item={item}
                  onEdit={() => onEditItem(item)}
                />
              </Grid>
            ))}
          </Grid>

          {/* Pagination */}
          {pageInfo.totalPages > 1 && (
            <Box
              sx={{
                display: "flex",
                justifyContent: "center",
                mt: 4,
              }}
            >
              <Pagination
                count={pageInfo.totalPages}
                page={pageInfo.currentPage + 1}
                onChange={handleChangePage}
                color="primary"
              />
            </Box>
          )}
        </>
      )}
    </Container>
  );
}