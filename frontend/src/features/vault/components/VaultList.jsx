import React, { useEffect } from "react";
import { Box, Grid, Typography, Pagination, Stack, CircularProgress } from "@mui/material";
import { useSelector, useDispatch } from "react-redux";
import { fetchPasswords } from "../vaultSlice"; // Ensure this is imported
import VaultItem from "./VaultItem";

export default function VaultList({ onEditItem }) {
    const dispatch = useDispatch();
    const { items, pageInfo, status } = useSelector((state) => state.vault);

    // Initial load
    useEffect(() => {
        dispatch(fetchPasswords({ page: 0, size: 6 }));
    }, [dispatch]);

    const handleChangePage = (event, value) => {
        // value is 1-based from MUI, Spring is 0-based
        dispatch(fetchPasswords({ page: value - 1, size: 6 }));
    };

    return (
        <Box>
            <Grid container spacing={3}>
                {items.map((item) => (
                    <Grid key={item.id} item xs={12} sm={6} md={4}>
                        <VaultItem item={item} onEdit={onEditItem} />
                    </Grid>
                ))}
            </Grid>

            {/* PAGINATION CONTROLS */}
            {pageInfo.totalPages > 1 && (
                <Stack alignItems="center" sx={{ mt: 4 }}>
                    <Pagination
                        count={pageInfo.totalPages}
                        page={pageInfo.currentPage + 1} // Sync back to 1-based for UI
                        onChange={handleChangePage}
                        color="primary"
                    />
                </Stack>
            )}
        </Box>
    );
}