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
    <Box>
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
          paddingX: 3,
          marginTop: 3,
        }}
      >
        <Paper
          elevation={0}
          sx={{
            width: "100%",
            maxWidth: "1400px",
            padding: 2,
            backgroundColor: "white",
            borderRadius: 1,
          }}
        >
          <Stack
            direction="row"
            alignItems="center"
            justifyContent="space-between"
            gap={2}
          >
            <Stack direction="row" alignItems="center" gap={2}>
              <Box
                sx={{
                  width: 48,
                  height: 48,
                  backgroundColor: "rgba(99, 102, 241, 0.1)",
                  borderRadius: 2,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <ShieldOutlinedIcon sx={{ color: "#6366f1", fontSize: 28 }} />
              </Box>
              <Box>
                <Typography variant="h6" sx={{ fontWeight: 600 }}>
                  Breach Check
                </Typography>
                <Typography variant="body2" sx={{ color: "text.secondary" }}>
                  Checks each vault password against HIBP using k-anonymity (hash
                  prefix only).
                </Typography>
              </Box>
            </Stack>

            <Stack direction="row" spacing={2} alignItems="center">
              <FormControlLabel
                control={
                  <Switch
                    checked={onlyBreached}
                    onChange={(e) => setOnlyBreached(e.target.checked)}
                  />
                }
                label="Only breached"
              />

              <Button
                variant="outlined"
                startIcon={<ArrowBackIcon />}
                sx={{ borderRadius: "10px", textTransform: "none" }}
                onClick={() => navigate("/vault")}
              >
                Back to Vault
              </Button>

              <Button
                variant="contained"
                startIcon={status === "loading" ? <CircularProgress size={16} /> : <RefreshIcon />}
                sx={{
                  borderRadius: "10px",
                  textTransform: "none",
                  backgroundColor: "black",
                  color: "white",
                  "&:hover": { backgroundColor: "#222" },
                }}
                disabled={status === "loading"}
                onClick={runScan}
              >
                {status === "loading" ? "Scanning..." : "Run breach scan"}
              </Button>
            </Stack>
          </Stack>

          <Divider sx={{ my: 2 }} />

          <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
            <Chip label={`Total: ${stats.total}`} />
            <Chip label={`Breached: ${stats.pwned}`} color={stats.pwned ? "error" : "default"} />
            <Chip label={`Safe: ${stats.safe}`} color="success" />
            <Chip
              label={`Failed: ${stats.failed}`}
              color={stats.failed ? "warning" : "default"}
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
          marginTop: 3,
          paddingX: 3,
          paddingBottom: 5,
        }}
      >
        <Box sx={{ width: "100%", maxWidth: "1400px" }}>
          {status === "idle" && (
            <Paper
              elevation={0}
              sx={{
                padding: 3,
                borderRadius: "16px",
                border: "1px solid rgba(0,0,0,0.08)",
                backgroundColor: "white",
              }}
            >
              <Typography variant="body1" sx={{ color: "text.secondary" }}>
                Click <b>Run breach scan</b> to check all saved passwords.
              </Typography>
            </Paper>
          )}

          {status === "error" && (
            <Paper
              elevation={0}
              sx={{
                padding: 3,
                borderRadius: "16px",
                border: "1px solid rgba(0,0,0,0.08)",
                backgroundColor: "white",
              }}
            >
              <Stack direction="row" spacing={1} alignItems="center">
                <ErrorOutlineIcon color="error" />
                <Typography color="error">{error || "Scan failed."}</Typography>
              </Stack>
            </Paper>
          )}

          {status === "done" && filteredResults.length === 0 && (
            <Paper
              elevation={0}
              sx={{
                padding: 3,
                borderRadius: "16px",
                border: "1px solid rgba(0,0,0,0.08)",
                backgroundColor: "white",
              }}
            >
              <Typography variant="body1" sx={{ color: "text.secondary" }}>
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
                  padding: 2.5,
                  borderRadius: "16px",
                  border: "1px solid rgba(0,0,0,0.08)",
                  backgroundColor: "white",
                }}
              >
                <Stack
                  direction={{ xs: "column", sm: "row" }}
                  alignItems={{ xs: "flex-start", sm: "center" }}
                  justifyContent="space-between"
                  gap={2}
                >
                  <Box>
                    <Typography variant="h6" sx={{ fontWeight: 600 }}>
                      {r.title}
                    </Typography>
                    <Typography variant="body2" sx={{ color: "text.secondary" }}>
                      {r.username || "—"}
                      {r.url ? ` • ${r.url}` : ""}
                    </Typography>
                  </Box>

                  <Stack direction="row" spacing={1} alignItems="center">
                    {r.status === "pwned" && (
                      <Chip
                        color="error"
                        label={`Pwned ${r.count}×`}
                        sx={{ fontWeight: 600 }}
                      />
                    )}
                    {r.status === "safe" && (
                      <Chip
                        color="success"
                        label="Safe"
                        sx={{ fontWeight: 600 }}
                      />
                    )}
                    {r.status === "error" && (
                      <Chip
                        color="warning"
                        label={`Failed: ${r.message || "Unknown error"}`}
                        sx={{ fontWeight: 600, maxWidth: 520 }}
                      />
                    )}

                    {r.status === "pwned" && (
                      <Button
                        variant="outlined"
                        sx={{ borderRadius: "10px", textTransform: "none" }}
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


