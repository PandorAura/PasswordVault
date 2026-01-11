import React, { useEffect } from "react";
import {
  Box,
  Typography,
  Pagination,
  Stack,
} from "@mui/material";
import { useSelector, useDispatch } from "react-redux";
import { fetchPasswords } from "../vaultSlice"; 
import VaultItem from "./VaultItem";
import { useNavigate } from "react-router-dom";
import { getStoredKey } from "../../../utils/cryptoUtils";

export default function VaultList({ onEditItem }) {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const { items, pageInfo, status } = useSelector((state) => state.vault);
  const itemsPerPage = 6;

  useEffect(() => {
    const key = getStoredKey();
    if (!key) {
      navigate("/check-master");
    }
  }, [navigate]);

  useEffect(() => {
    dispatch(fetchPasswords({ page: 0, size: itemsPerPage }));
  }, [dispatch]);

  const handleChangePage = (event, value) => {
    dispatch(fetchPasswords({ page: value - 1, size: itemsPerPage }));
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
      <Box sx={{ 
        width: { xs: "100%", sm: "100%", md: "90%" },
        maxWidth: "1400px",
      }}>
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

        {/* --- GRID CONTAINER START --- */}
        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: { xs: "1fr", md: "repeat(3, 1fr)" },
            gap: { xs: 2, sm: 3 },
            width: "100%",
          }}
        >
          {items.map((item) => (
            <VaultItem key={item.id} item={item} onEdit={onEditItem} />
          ))}
        </Box>
        {/* --- GRID CONTAINER END --- */}

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