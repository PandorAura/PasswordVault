import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
  Box,
  Button,
  Chip,
  CircularProgress,
  Divider,
  FormControlLabel,
  Paper,
  Stack,
  Switch,
  Typography,
} from "@mui/material";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import RefreshIcon from "@mui/icons-material/Refresh";
import ShieldOutlinedIcon from "@mui/icons-material/ShieldOutlined";
import ErrorOutlineIcon from "@mui/icons-material/ErrorOutline";

import { useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import VaultHeader from "../features/vault/components/VaultHeader";
import { decryptPassword, getStoredKey } from "../utils/cryptoUtils";
import {
  fetchPwnedRange,
  parseRangeResponseToMap,
  sha1HexUpper,
} from "../utils/pwnedPasswords";
import { logout } from "../features/auth/authSlice";
import BreachDetailsModal from "../features/breaches/components/BreachDetailsModal";

async function fetchAllPasswordsFromBackend() {
  const token = localStorage.getItem("authToken");
  if (!token) throw new Error("Missing auth token. Please log in again.");

  const all = [];
  const size = 200;
  let page = 0;
  let totalPages = 1;

  while (page < totalPages) {
    const res = await fetch(
      `http://localhost:8080/api/passwords?page=${page}&size=${size}`,
      {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      }
    );

    if (!res.ok) {
      const text = await res.text().catch(() => "");
      throw new Error(text || `Failed to load passwords (HTTP ${res.status}).`);
    }

    const data = await res.json();
    totalPages = Number.isFinite(data.totalPages) ? data.totalPages : 1;

    const items = (data.content || []).map((item) => ({
      ...item,
      username: item.usernameOrEmail,
      url: item.websiteUrl,
    }));
    all.push(...items);
    page += 1;
  }

  return all;
}

export default function BreachesPage() {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const [onlyBreached, setOnlyBreached] = useState(true);
  const [status, setStatus] = useState("idle");
  const [error, setError] = useState(null);
  const [results, setResults] = useState([]);
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [detailsItem, setDetailsItem] = useState(null);

  const rangeCache = useMemo(() => new Map(), []);

  useEffect(() => {
    const key = getStoredKey();
    if (!key) navigate("/check-master");
  }, [navigate]);

  const runScan = useCallback(async () => {
    setStatus("loading");
    setError(null);
    setResults([]);
    rangeCache.clear();

    try {
      const key = getStoredKey();
      if (!key) throw new Error("Vault is locked. Please unlock first.");

      const items = await fetchAllPasswordsFromBackend();

      const enriched = [];
      for (const item of items) {
        try {
          const plain = await decryptPassword(item.encryptedPassword, item.encryptionIv);
          const sha1 = await sha1HexUpper(plain);
          const prefix = sha1.slice(0, 5);
          const suffix = sha1.slice(5);
          enriched.push({ item, prefix, suffix });
        } catch (e) {
          enriched.push({ item, decryptError: e?.message || "Decrypt/hash failed" });
        }
      }

      const prefixes = Array.from(
        new Set(enriched.filter((x) => x.prefix).map((x) => x.prefix))
      );

      for (const prefix of prefixes) {
        const body = await fetchPwnedRange(prefix);
        rangeCache.set(prefix, parseRangeResponseToMap(body));
      }

      const computed = enriched.map((x) => {
        if (x.decryptError) {
          return {
            id: x.item.id,
            title: x.item.title,
            username: x.item.username,
            url: x.item.url,
            encryptedPassword: x.item.encryptedPassword,
            encryptionIv: x.item.encryptionIv,
            count: null,
            status: "error",
            message: x.decryptError,
          };
        }

        const suffixMap = rangeCache.get(x.prefix);
        const count = suffixMap?.get(x.suffix.toUpperCase()) || 0;
        return {
          id: x.item.id,
          title: x.item.title,
          username: x.item.username,
          url: x.item.url,
          encryptedPassword: x.item.encryptedPassword,
          encryptionIv: x.item.encryptionIv,
          count,
          status: count > 0 ? "pwned" : "safe",
        };
      });

      computed.sort((a, b) => (b.count || 0) - (a.count || 0));
      setResults(computed);
      setStatus("done");
    } catch (e) {
      setError(e?.message || "Breach scan failed.");
      setStatus("error");
    }
  }, [navigate, rangeCache]);

  const filteredResults = useMemo(() => {
    if (!onlyBreached) return results;
    return results.filter((r) => r.status === "pwned");
  }, [onlyBreached, results]);

  const stats = useMemo(() => {
    const total = results.length;
    const pwned = results.filter((r) => r.status === "pwned").length;
    const safe = results.filter((r) => r.status === "safe").length;
    const failed = results.filter((r) => r.status === "error").length;
    return { total, pwned, safe, failed };
  }, [results]);

  return (
    <Box
      sx={{
        minHeight: "100vh",
        backgroundColor: "background.default",
      }}
    >
      <VaultHeader
        onLogout={() => {
          dispatch(logout());
          navigate("/login", { replace: true });
        }}
      />

      <Box
        sx={{
          width: "100%",
          display: "flex",
          justifyContent: "center",
          paddingX: { xs: 2, sm: 3 },
          marginTop: { xs: 2, sm: 3 },
        }}
      >
        <Paper
          elevation={0}
          sx={{
            width: "100%",
            maxWidth: "1400px",
            padding: { xs: 1.5, sm: 2 },
            backgroundColor: "white",
            borderRadius: 1,
          }}
        >
          <Stack
            direction={{ xs: "column", md: "row" }}
            alignItems={{ xs: "flex-start", md: "center" }}
            justifyContent="space-between"
            gap={2}
          >
            <Stack 
              direction={{ xs: "column", sm: "row" }} 
              alignItems={{ xs: "flex-start", sm: "center" }} 
              gap={{ xs: 1.5, sm: 2 }}
              sx={{ flex: 1, minWidth: 0 }}
            >
              <Box
                sx={{
                  width: { xs: 40, sm: 48 },
                  height: { xs: 40, sm: 48 },
                  backgroundColor: "rgba(99, 102, 241, 0.1)",
                  borderRadius: 2,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  flexShrink: 0,
                }}
              >
                <ShieldOutlinedIcon 
                  sx={{ 
                    color: "primary.main", 
                    fontSize: { xs: 24, sm: 28 } 
                  }} 
                />
              </Box>
              <Box sx={{ minWidth: 0, flex: 1 }}>
                <Typography 
                  variant="h6" 
                  sx={{ 
                    fontWeight: 600,
                    fontSize: { xs: "1rem", sm: "1.25rem" },
                  }}
                >
                  Breach Check
                </Typography>
                <Typography 
                  variant="body2" 
                  sx={{ 
                    color: "text.secondary",
                    fontSize: { xs: "0.75rem", sm: "0.875rem" },
                  }}
                >
                  Checks each vault password against HIBP using k-anonymity (hash
                  prefix only).
                </Typography>
              </Box>
            </Stack>

            <Stack 
              direction={{ xs: "column", sm: "row" }} 
              spacing={{ xs: 1.5, sm: 2 }} 
              alignItems="stretch"
              sx={{ 
                width: { xs: "100%", md: "auto" },
                flexShrink: 0,
              }}
            >
              <FormControlLabel
                control={
                  <Switch
                    checked={onlyBreached}
                    onChange={(e) => setOnlyBreached(e.target.checked)}
                    size="small"
                  />
                }
                label="Only breached"
                sx={{
                  margin: 0,
                  "& .MuiFormControlLabel-label": {
                    fontSize: { xs: "0.75rem", sm: "0.875rem" },
                  },
                }}
              />

              <Button
                variant="outlined"
                startIcon={<ArrowBackIcon />}
                sx={{ 
                  textTransform: "none",
                  width: { xs: "100%", sm: "auto" },
                  fontSize: { xs: "0.75rem", sm: "0.875rem" },
                }}
                onClick={() => navigate("/vault")}
              >
                Back to Vault
              </Button>

              <Button
                variant="contained"
                startIcon={status === "loading" ? <CircularProgress size={16} color="inherit" /> : <RefreshIcon />}
                sx={{
                  textTransform: "none",
                  width: { xs: "100%", sm: "auto" },
                  fontSize: { xs: "0.75rem", sm: "0.875rem" },
                }}
                disabled={status === "loading"}
                onClick={runScan}
              >
                {status === "loading" ? "Scanning..." : "Run breach scan"}
              </Button>
            </Stack>
          </Stack>

          <Divider sx={{ my: 2 }} />

          <Stack 
            direction="row" 
            spacing={1} 
            flexWrap="wrap" 
            useFlexGap
            sx={{ gap: { xs: 1, sm: 1 } }}
          >
            <Chip 
              label={`Total: ${stats.total}`}
              size="small"
              sx={{ fontSize: { xs: "0.7rem", sm: "0.875rem" } }}
            />
            <Chip 
              label={`Breached: ${stats.pwned}`} 
              color={stats.pwned ? "error" : "default"}
              size="small"
              sx={{ fontSize: { xs: "0.7rem", sm: "0.875rem" } }}
            />
            <Chip 
              label={`Safe: ${stats.safe}`} 
              color="success"
              size="small"
              sx={{ fontSize: { xs: "0.7rem", sm: "0.875rem" } }}
            />
            <Chip
              label={`Failed: ${stats.failed}`}
              color={stats.failed ? "warning" : "default"}
              size="small"
              sx={{ fontSize: { xs: "0.7rem", sm: "0.875rem" } }}
            />
          </Stack>
        </Paper>
      </Box>

      <Box
        sx={{
          width: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          marginTop: { xs: 2, sm: 3 },
          paddingX: { xs: 2, sm: 3 },
          paddingBottom: 5,
        }}
      >
        <Box sx={{ width: "100%", maxWidth: "1400px" }}>
          {status === "idle" && (
            <Paper
              elevation={0}
              sx={{
                padding: { xs: 2, sm: 3 },
                borderRadius: 3,
                border: "1px solid rgba(0,0,0,0.08)",
                backgroundColor: "white",
              }}
            >
              <Typography 
                variant="body1" 
                sx={{ 
                  color: "text.secondary",
                  fontSize: { xs: "0.875rem", sm: "1rem" },
                }}
              >
                Click <b>Run breach scan</b> to check all saved passwords.
              </Typography>
            </Paper>
          )}

          {status === "error" && (
            <Paper
              elevation={0}
              sx={{
                padding: { xs: 2, sm: 3 },
                borderRadius: 3,
                border: "1px solid rgba(0,0,0,0.08)",
                backgroundColor: "white",
              }}
            >
              <Stack direction="row" spacing={1} alignItems="center">
                <ErrorOutlineIcon color="error" sx={{ fontSize: { xs: 20, sm: 24 } }} />
                <Typography 
                  color="error"
                  sx={{ fontSize: { xs: "0.875rem", sm: "1rem" } }}
                >
                  {error || "Scan failed."}
                </Typography>
              </Stack>
            </Paper>
          )}

          {status === "done" && filteredResults.length === 0 && (
            <Paper
              elevation={0}
              sx={{
                padding: { xs: 2, sm: 3 },
                borderRadius: 3,
                border: "1px solid rgba(0,0,0,0.08)",
                backgroundColor: "white",
              }}
            >
              <Typography 
                variant="body1" 
                sx={{ 
                  color: "text.secondary",
                  fontSize: { xs: "0.875rem", sm: "1rem" },
                }}
              >
                No breached passwords found (with current filter).
              </Typography>
            </Paper>
          )}

          <Stack spacing={2} sx={{ mt: status === "done" ? 0 : 2 }}>
            {filteredResults.map((r) => (
              <Paper
                key={r.id}
                elevation={0}
                sx={{
                  padding: { xs: 2, sm: 2.5 },
                  borderRadius: 3,
                  border: "1px solid rgba(0,0,0,0.08)",
                  backgroundColor: "white",
                }}
              >
                <Stack
                  direction={{ xs: "column", sm: "row" }}
                  alignItems={{ xs: "flex-start", sm: "center" }}
                  justifyContent="space-between"
                  gap={{ xs: 1.5, sm: 2 }}
                >
                  <Box sx={{ minWidth: 0, flex: 1 }}>
                    <Typography 
                      variant="h6" 
                      sx={{ 
                        fontWeight: 600,
                        fontSize: { xs: "1rem", sm: "1.25rem" },
                      }}
                    >
                      {r.title}
                    </Typography>
                    <Typography 
                      variant="body2" 
                      sx={{ 
                        color: "text.secondary",
                        fontSize: { xs: "0.75rem", sm: "0.875rem" },
                        wordBreak: "break-word",
                      }}
                    >
                      {r.username || "—"}
                      {r.url ? ` • ${r.url}` : ""}
                    </Typography>
                  </Box>

                  <Stack 
                    direction={{ xs: "column", sm: "row" }} 
                    spacing={1} 
                    alignItems={{ xs: "stretch", sm: "center" }}
                    sx={{ 
                      width: { xs: "100%", sm: "auto" },
                      flexShrink: 0,
                    }}
                  >
                    {r.status === "pwned" && (
                      <Chip
                        color="error"
                        label={`Pwned ${r.count}×`}
                        size="small"
                        sx={{ 
                          fontWeight: 600,
                          fontSize: { xs: "0.7rem", sm: "0.875rem" },
                        }}
                      />
                    )}
                    {r.status === "safe" && (
                      <Chip
                        color="success"
                        label="Safe"
                        size="small"
                        sx={{ 
                          fontWeight: 600,
                          fontSize: { xs: "0.7rem", sm: "0.875rem" },
                        }}
                      />
                    )}
                    {r.status === "error" && (
                      <Chip
                        color="warning"
                        label={`Failed: ${r.message || "Unknown error"}`}
                        size="small"
                        sx={{ 
                          fontWeight: 600,
                          maxWidth: { xs: "100%", sm: 520 },
                          fontSize: { xs: "0.7rem", sm: "0.875rem" },
                        }}
                      />
                    )}

                    {r.status === "pwned" && (
                      <Button
                        variant="outlined"
                        sx={{ 
                          textTransform: "none",
                          width: { xs: "100%", sm: "auto" },
                          fontSize: { xs: "0.75rem", sm: "0.875rem" },
                        }}
                        onClick={() => {
                          setDetailsItem(r);
                          setDetailsOpen(true);
                        }}
                      >
                        View details
                      </Button>
                    )}
                  </Stack>
                </Stack>
              </Paper>
            ))}
          </Stack>
        </Box>
      </Box>

      <BreachDetailsModal
        open={detailsOpen}
        onClose={() => {
          setDetailsOpen(false);
          setDetailsItem(null);
        }}
        breachItem={detailsItem}
        decryptPassword={decryptPassword}
        getStoredKey={getStoredKey}
      />
    </Box>
  );
}


