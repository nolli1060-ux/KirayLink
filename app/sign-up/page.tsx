"use client";

import { useState, type FormEvent } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { authClient } from "@/lib/auth-client";

type AccountType = "tenant" | "landlord";

export default function SignUpForm() {
  const router = useRouter();

  const [accountType, setAccountType] =useState<AccountType>("tenant");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");

    if (!name.trim() || !email.trim()) {
      setError("Enter your name and email address.");
      return;
    }

    if (password.length < 8 || password.length > 128) {
      setError("Password must be between 8 and 128 characters.");
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setLoading(true);

    try {
      const { error: signUpError } = await authClient.signUp.email({
        name: name.trim(),
        email: email.trim(),
        password,
        accountType,
      });

      if (signUpError) {
        setError(signUpError.message || "Unable to create your account.");
        return;
      }

      router.push("/dashboard");
      router.refresh();
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-stone-50 px-4 py-10">
      <section className="w-full max-w-xl rounded-2xl border border-stone-200 bg-white p-6 shadow-sm sm:p-9">
        <Link href="/" className="text-sm font-semibold text-amber-800">
          KirayLink
        </Link>

        <h1 className="mt-5 text-3xl font-bold text-slate-900">
          Create your account
        </h1>
        <p className="mt-2 text-sm text-slate-600">
          Join KirayLink to find or manage rental properties.
        </p>

        <form onSubmit={handleSubmit} className="mt-7 space-y-5">
          <fieldset>
            <legend className="mb-2 text-sm font-semibold text-slate-800">
              Account type
            </legend>
            <div className="grid grid-cols-2 gap-3">
              {(["tenant", "landlord"] as const).map((type) => (
                <button
                  key={type}
                  type="button"
                  aria-pressed={accountType === type}
                  onClick={() => setAccountType(type)}
                  className={`rounded-lg border p-3 text-left text-sm ${
                    accountType === type
                      ? "border-slate-900 bg-slate-900 text-white"
                      : "border-stone-300 bg-white text-slate-700"
                  }`}
                >
                  <span className="block font-semibold capitalize">
                    {type}
                  </span>
                  <span className="mt-1 block text-xs">
                    {type === "tenant"
                      ? "Find a place to rent"
                      : "Manage rental properties"}
                  </span>
                </button>
              ))}
            </div>
          </fieldset>

          <div>
            <label htmlFor="name" className="mb-1 block text-sm font-medium">
              Full name
            </label>
            <input
              id="name"
              autoComplete="name"
              required
              maxLength={50}
              value={name}
              onChange={(event) => setName(event.target.value)}
              className="w-full rounded-lg border border-stone-300 px-3 py-2.5"
            />
          </div>

          <div>
            <label htmlFor="email" className="mb-1 block text-sm font-medium">
              Email address
            </label>
            <input
              id="email"
              type="email"
              autoComplete="email"
              required
              maxLength={254}
              value={email}
              pattern="[^@\s]+@[^@\s]+\.[^@\s]+"
              title="Enter a valid email address, such as name@example.com"
              onChange={(event) => setEmail(event.target.value)}
              className="w-full rounded-lg border border-stone-300 px-3 py-2.5"
            />
          </div>


          <div>
            <label htmlFor="password" className="mb-1 block text-sm font-medium">
              Password
            </label>
            <input
              id="password"
              type="password"
              autoComplete="new-password"
              required
              minLength={8}
              maxLength={128}
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              className="w-full rounded-lg border border-stone-300 px-3 py-2.5"
            />
          </div>

          <div>
            <label
              htmlFor="confirmPassword"
              className="mb-1 block text-sm font-medium"
            >
              Confirm password
            </label>
            <input
              id="confirmPassword"
              type="password"
              autoComplete="new-password"
              required
              value={confirmPassword}
              onChange={(event) => setConfirmPassword(event.target.value)}
              className="w-full rounded-lg border border-stone-300 px-3 py-2.5"
            />
          </div>

          {error && (
            <p role="alert" className="rounded-lg bg-red-50 p-3 text-sm text-red-700">
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-lg bg-slate-900 px-4 py-3 font-semibold text-white disabled:opacity-60"
          >
            {loading ? "Creating account..." : "Create account"}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-slate-600">
          Already registered?{" "}
          <Link href="/sign-in" className="font-semibold text-amber-800 underline">
            Sign in
          </Link>
        </p>
      </section>
    </main>
  );
}
