import React, { useState } from "react";
import { Box, Grid, Typography, Pagination, Stack } from "@mui/material";
import { useSelector } from "react-redux";
import VaultItem from "./VaultItem";

export default function VaultList({ onEditItem }) {
  // Get all items from Redux store
  const items = useSelector((state) => state.vault.items);

  // --- PAGINATION LOGIC START ---
  const [page, setPage] = useState(1);
  const itemsPerPage = 6; // Show 6 cards per page (fits well with the Grid layout)

  // Calculate total pages
  const pageCount = Math.ceil((items?.length || 0) / itemsPerPage);

  // Slice the data: Only take the items for the current page
  const startIndex = (page - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentItems = items ? items.slice(startIndex, endIndex) : [];

  const handleChangePage = (event, value) => {
    setPage(value);
    // Optional: Scroll to top of list when page changes
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };
  // --- PAGINATION LOGIC END ---

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
        paddingBottom: 5, // Add padding at bottom for the pagination controls
      }}
    >
      <Box sx={{ width: "100%", maxWidth: "1400px" }}>
        {/* Display message if there are no items */}
        {!hasItems && (
          <Typography variant="h6" color="text.secondary" align="center" sx={{ mt: 4 }}>
            Your vault is empty. Add a new item to get started.
          </Typography>
        )}

        <Grid container spacing={3}>
          {/* IMPORTANT: Map over currentItems for pagination, not the full items array */}
          {hasItems &&
            currentItems.map((item) => (
              <Grid
                key={item.id}
                item // This prop is essential for Grid to work as a container item
                xs={12}
                sm={6}
                md={4}
                sx={{ display: "flex" }}
              >
                <VaultItem item={item} onEdit={onEditItem} />
              </Grid>
            ))}
        </Grid>

        {/* --- PAGINATION CONTROLS --- */}
        {/* Only show pagination if there are items AND more than one page */}
        {hasItems && pageCount > 1 && (
          <Stack spacing={2} alignItems="center" sx={{ marginTop: 4 }}>
            <Pagination
              count={pageCount}
              page={page}
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