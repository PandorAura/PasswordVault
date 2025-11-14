import React from "react";
import { Box, Grid, Typography } from "@mui/material";
import { useSelector } from "react-redux";
import VaultItem from "./VaultItem";

export default function VaultList() {
  const items = useSelector((state) => state.vault.items);

  const hasItems = items && items.length > 0;

  return (
    <Box
      sx={{
        width: "100%",
        display: "flex",
        justifyContent: "center",
        marginTop: 3,
        paddingX: 3,
      }}
    >
      <Box sx={{ width: "100%", maxWidth: "1400px" }}>
        {!hasItems && (
          <Typography
            sx={{
              textAlign: "center",
              color: "text.secondary",
              fontStyle: "italic",
              marginTop: 5,
            }}
          >
            No passwords yet — add your first one!
          </Typography>
        )}

        <Grid container spacing={3}>
          {hasItems &&
            items.map((item) => (
              <Grid
                item
                xs={12}
                sm={6}
                md={4}
                key={item.id}
                sx={{ display: "flex" }}
              >
                <VaultItem item={item} />
              </Grid>
            ))}
        </Grid>
      </Box>
    </Box>
  );
}
