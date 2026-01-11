// utils/csvUtils.js
export const downloadCSV = (data) => {
  const headers = ["Title", "Username", "Password", "URL", "Category", "Notes"];
  const csvRows = [
    headers.join(","),
    ...data.map(row => 
      Object.values(row).map(val => `"${String(val).replace(/"/g, '""')}"`).join(",")
    )
  ].join("\n");

  const blob = new Blob([csvRows], { type: "text/csv;charset=utf-8;" });
  const url = window.URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.setAttribute("download", `vault_export_${new Date().toISOString().split('T')[0]}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

export const parseCSV = (csvText) => {
  const lines = csvText.split(/\r?\n/).filter(line => line.trim() !== "");
  if (lines.length < 2) throw new Error("File is empty or missing data.");

  // 1. Get and clean headers
  const rawHeaders = lines[0].split(",").map(h => h.replace(/"/g, "").trim().toLowerCase());
  
  const findIndex = (synonyms) => rawHeaders.findIndex(h => synonyms.includes(h));
  
  const indices = {
    title: findIndex(["title", "name", "entry"]),
    username: findIndex(["username", "email", "login_username", "user"]),
    password: findIndex(["password", "pwd", "login_password"]),
    url: findIndex(["url", "website", "link", "uri"]),
    category: findIndex(["category", "folder"]),
    notes: findIndex(["notes", "comments", "extra"])
  };

  if (indices.title === -1 || indices.password === -1) {
    throw new Error("CSV must contain at least 'Title' and 'Password' columns.");
  }

  // 4. Parse the data rows
  return lines.slice(1).map((line, lineIndex) => {
    // Robust CSV splitting: This handles empty fields and quotes correctly
    const values = [];
    let current = "";
    let inQuotes = false;

    for (let i = 0; i < line.length; i++) {
      const char = line[i];
      if (char === '"') {
        inQuotes = !inQuotes;
      } else if (char === "," && !inQuotes) {
        values.push(current);
        current = "";
      } else {
        current += char;
      }
    }
    values.push(current); // Push the last value

    const clean = (val) => (val ? val.replace(/^"|"$/g, "").trim() : "");

    // Safety check: ensure we actually have data for title and password
    const title = clean(values[indices.title]);
    const password = clean(values[indices.password]);

    if (!title || !password) {
      console.warn(`Line ${lineIndex + 2} skipped: Missing Title or Password.`);
      return null; // We will filter these out
    }

    return {
      title: title,
      username: indices.username !== -1 ? clean(values[indices.username]) : "",
      password: password,
      url: indices.url !== -1 ? clean(values[indices.url]) : "",
      category: indices.category !== -1 ? clean(values[indices.category]) : "GENERAL",
      notes: indices.notes !== -1 ? clean(values[indices.notes]) : ""
    };
  }).filter(item => item !== null); // Remove any skipped lines
};

