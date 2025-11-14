
import React from "react";
import LoginForm from "../features/auth/LoginForm.jsx";

export default function LoginPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-950 via-slate-900 to-slate-800">
      {/* Soft glowing blobs in the background */}
      <div className="absolute inset-0 pointer-events-none opacity-25">
        <div className="w-72 h-72 bg-emerald-500/30 rounded-full blur-3xl absolute -top-16 -left-10" />
        <div className="w-80 h-80 bg-cyan-500/25 rounded-full blur-3xl absolute bottom-0 right-0" />
      </div>

      <div className="relative z-10 flex flex-col items-center gap-6 px-4">
        <div className="text-center mb-2">
          <h1 className="text-3xl md:text-4xl font-bold text-slate-50">
            Password Vault
          </h1>
          <p className="text-sm text-slate-300 mt-1">
            Log in to access your secure vault.
          </p>
        </div>

        <LoginForm />
      </div>
    </div>
  );
}