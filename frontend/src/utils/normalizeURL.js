export function normalizeUrl(url) {
  if (!url) return "";

  const trimmed = url.trim();

  // Already has http or https
  if (/^https?:\/\//i.test(trimmed)) {
    return trimmed;
  }

  // Add https by default
  return `https://${trimmed}`;
}
