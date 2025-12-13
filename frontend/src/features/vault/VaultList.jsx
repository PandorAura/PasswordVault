import React, { useState } from "react";
import { Box, Grid, Typography, Pagination, Stack } from "@mui/material";
import { useSelector } from "react-redux";
import VaultItem from "./VaultItem";

export default function VaultList({ onEditItem }) {
  const items = useSelector((state) => state.vault.items);

  const [page, setPage] = useState(1);
  const itemsPerPage = 6; 

  const pageCount = Math.ceil((items?.length || 0) / itemsPerPage);

  const startIndex = (page - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentItems = items ? items.slice(startIndex, endIndex) : [];

  const handleChangePage = (event, value) => {
    setPage(value);
    window.scrollTo({ top: 0, behavior: 'smooth' });
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
      <Box sx={{ width: "100%", maxWidth: "1400px" }}>
        {/* Display message if there are no items */}
        {!hasItems && (
          <Typography variant="h6" color="text.secondary" align="center" sx={{ mt: 4 }}>
            Your vault is empty. Add a new item to get started.
          </Typography>
        )}

        <Grid container spacing={3}>
          {hasItems &&
            currentItems.map((item) => (
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