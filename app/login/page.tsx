"use client";

import { signIn } from "next-auth/react";

export default function LoginPage() {
  return (
    <div className="min-h-screen relative overflow-hidden bg-linear-to-br from-[#f7ecff] via-[#ead9fd] to-[#d9f0ff] px-6">
      <div className="pointer-events-none absolute -top-24 -left-20 h-64 w-64 rounded-full bg-purple-300/30 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-32 -right-16 h-72 w-72 rounded-full bg-blue-300/30 blur-3xl" />

      <div className="min-h-screen flex items-center justify-center">
        <div className="w-full max-w-md rounded-4xl bg-white/80 backdrop-blur-xl shadow-2xl p-8 border border-white/60">
          <div className="flex items-center gap-3 mb-6">
            <div className="h-12 w-12 rounded-2xl bg-purple-600 text-white flex items-center justify-center text-2xl shadow-lg">
              🐧
            </div>
            <div>
              <h1 className="text-2xl font-bold text-purple-900">Welcome back</h1>
              <p className="text-sm text-purple-700">Log in to continue</p>
            </div>
          </div>

          <button
            onClick={() => signIn("google", { callbackUrl: "/" })}
            className="w-full rounded-2xl bg-linear-to-r from-purple-600 to-indigo-600 py-3 text-white font-bold hover:from-purple-700 hover:to-indigo-700 transition-all active:scale-95 shadow-lg shadow-purple-200"
          >
            <span className="inline-flex items-center gap-3">
              <span className="flex h-7 w-7 items-center justify-center rounded-full bg-white text-purple-700 text-sm font-black">
                G
              </span>
              Continue with Google
            </span>
          </button>

          <div className="mt-6 rounded-2xl bg-white/70 p-4 text-sm text-purple-700 border border-purple-100">
            New user? Continue with Google to create your account in seconds.
          </div>

          <div className="mt-6 flex items-center gap-3 text-xs text-purple-500">
            <span className="h-px flex-1 bg-purple-100" />
            Safe & secure login
            <span className="h-px flex-1 bg-purple-100" />
          </div>
        </div>
      </div>
    </div>
  );
}
