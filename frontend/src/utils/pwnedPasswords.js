function bufferToHexUpper(buffer) {
  const bytes = new Uint8Array(buffer);
  let hex = "";
  for (const b of bytes) {
    hex += b.toString(16).padStart(2, "0");
  }
  return hex.toUpperCase();
}

export async function sha1HexUpper(text) {
  const data = new TextEncoder().encode(text);
  const digest = await window.crypto.subtle.digest("SHA-1", data);
  return bufferToHexUpper(digest);
}

export function parseRangeResponseToMap(bodyText) {
  const map = new Map();
  if (!bodyText) return map;

  const lines = bodyText.split(/\r?\n/);
  for (const line of lines) {
    if (!line) continue;
    const idx = line.indexOf(":");
    if (idx === -1) continue;
    const suffix = line.slice(0, idx).trim().toUpperCase();
    const countStr = line.slice(idx + 1).trim();
    const count = Number.parseInt(countStr, 10);
    if (suffix && Number.isFinite(count)) {
      map.set(suffix, count);
    }
  }
  return map;
}

export async function fetchPwnedRange(prefix) {
  const normalized = (prefix || "").trim().toUpperCase();
  if (!/^[0-9A-F]{5}$/.test(normalized)) {
    throw new Error("Invalid prefix (expected 5 hex chars).");
  }

  const res = await fetch(
    `http://localhost:8080/api/breaches/pwnedpasswords/range/${normalized}`,
    {
      method: "GET",
      headers: {
        Authorization: `Bearer ${localStorage.getItem("authToken")}`,
      },
    }
  );

  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(text || `Range request failed (HTTP ${res.status}).`);
  }

  return await res.text();
}


