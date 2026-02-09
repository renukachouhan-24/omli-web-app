"use client";

import Link from "next/link";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function SignupPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    const res = await fetch("/api/auth/signup", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, email, password }),
    });

    if (!res.ok) {
      const data = await res.json().catch(() => ({ error: "Signup failed" }));
      setError(data.error || "Signup failed");
      setIsLoading(false);
      return;
    }

    const result = await signIn("credentials", {
      email,
      password,
      redirect: false,
    });

    if (result?.error) {
      setError("Account created, but login failed. Please log in.");
      setIsLoading(false);
      return;
    }

    router.push("/");
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#ead9fd] px-6">
      <div className="w-full max-w-md rounded-3xl bg-white shadow-xl p-8">
        <h1 className="text-2xl font-bold text-purple-900 mb-2">Create account</h1>
        <p className="text-sm text-purple-700 mb-6">Start your journey with Omli</p>

        <form className="space-y-4" onSubmit={handleSubmit}>
          <div>
            <label className="block text-sm font-semibold text-purple-900 mb-1">Name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Your name"
              className="w-full rounded-xl border border-purple-100 px-4 py-3 text-purple-700 focus:outline-none focus:ring-2 focus:ring-purple-300"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-purple-900 mb-1">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              className="w-full rounded-xl border border-purple-100 px-4 py-3 text-purple-700 focus:outline-none focus:ring-2 focus:ring-purple-300"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-purple-900 mb-1">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full rounded-xl border border-purple-100 px-4 py-3 text-purple-700 focus:outline-none focus:ring-2 focus:ring-purple-300"
              required
            />
          </div>

          {error && (
            <p className="rounded-xl bg-red-50 px-4 py-2 text-sm text-red-600">
              {error}
            </p>
          )}

          <button
            type="submit"
            className="w-full rounded-2xl bg-purple-600 py-3 text-white font-bold hover:bg-purple-700 transition-all active:scale-95 disabled:opacity-60"
            disabled={isLoading}
          >
            {isLoading ? "Creating..." : "Sign up"}
          </button>
        </form>

        <p className="text-center text-sm text-purple-700 mt-6">
          Already have an account?{" "}
          <Link href="/login" className="font-semibold text-purple-900 hover:underline">
            Log in
          </Link>
        </p>
      </div>
    </div>
  );
}
