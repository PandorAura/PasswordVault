// src/features/auth/LoginForm.jsx
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";  

// Hardcoded credentials for this assignment
const VALID_EMAIL = "user@example.com";
const VALID_PASSWORD = "password123";

export default function LoginForm() {
  const navigate = useNavigate();         

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [message, setMessage] = useState("");       // success/error text
  const [isSuccess, setIsSuccess] = useState(null); // null | true | false

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!email || !password) {
      setIsSuccess(false);
      setMessage("Please fill in both fields.");
      return;
    }

    if (email === VALID_EMAIL && password === VALID_PASSWORD) {
      setIsSuccess(true);
      setMessage("Login successful! 🎉");

      // ✅ redirect to the route path defined in routes.jsx
      navigate("/vault");
    } else {
      setIsSuccess(false);
      setMessage("Incorrect email or password.");
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="w-full max-w-md bg-slate-800/90 px-8 py-6 rounded-2xl shadow-lg space-y-5"
    >
      <h2 className="text-2xl font-semibold text-slate-50 text-center mb-2">
        Login
      </h2>

      <div className="space-y-1">
        <label
          htmlFor="email"
          className="block text-sm font-medium text-slate-200"
        >
          Email
        </label>
        <input
          id="email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="user@example.com"
          className="w-full rounded-lg border border-slate-600 bg-slate-900 px-3 py-2 text-sm text-slate-100 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
          required
        />
      </div>

      <div className="space-y-1">
        <label
          htmlFor="password"
          className="block text-sm font-medium text-slate-200"
        >
          Password
        </label>
        <input
          id="password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="••••••••"
          className="w-full rounded-lg border border-slate-600 bg-slate-900 px-3 py-2 text-sm text-slate-100 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
          required
        />
      </div>

      <button
        type="submit"
        className="w-full mt-2 inline-flex justify-center items-center rounded-lg bg-emerald-500 px-4 py-2.5 text-sm font-semibold text-slate-900 hover:bg-emerald-400 transition"
      >
        Submit
      </button>

      {message && (
        <div
          className={`mt-3 text-sm px-3 py-2 rounded-lg ${
            isSuccess === true
              ? "bg-emerald-900/60 border border-emerald-500 text-emerald-100"
              : "bg-red-900/60 border border-red-500 text-red-100"
          }`}
        >
          {message}
        </div>
      )}

      <p className="text-xs text-slate-400 mt-2">
        For testing use: <br />
        <span className="font-mono">
          {VALID_EMAIL} / {VALID_PASSWORD}
        </span>
      </p>
    </form>
  );
}