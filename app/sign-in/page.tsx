import { Suspense } from "react";
import Link from "next/link";
import { safeNext } from "@/lib/safe-next";
import SignInForm from "./SignInForm";

type SignInPageProps = {
  searchParams: Promise<{
    next?: string | string[];
  }>;
};

async function SignInContent({
  searchParams,
}: SignInPageProps) {
  const params = await searchParams;
  const next = Array.isArray(params.next)
    ? undefined
    : params.next;

  const safeDestination = safeNext(next);

  return (
    <main className="flex min-h-screen items-center justify-center bg-stone-50 px-4 py-10">
      <section className="w-full max-w-md rounded-2xl border border-stone-200 bg-white p-6 shadow-sm sm:p-9">
        <Link
          href="/"
          className="text-sm font-semibold text-amber-800"
        >
          KirayLink
        </Link>

        <h1 className="mt-5 text-3xl font-bold text-slate-900">
          Welcome back
        </h1>

        <p className="mt-2 text-sm text-slate-600">
          Sign in to continue to KirayLink.
        </p>

        <SignInForm next={safeDestination} />

        <p className="mt-6 text-center text-sm text-slate-600">
          Don&apos;t have an account?{" "}
          <Link
            href="/sign-up"
            className="font-semibold text-amber-800 underline"
          >
            Create an account
          </Link>
        </p>
      </section>
    </main>
  );
}

export default function SignInPage({
  searchParams,
}: SignInPageProps) {
  return (
    <Suspense
      fallback={
        <main className="flex min-h-screen items-center justify-center bg-stone-50">
          <p className="text-slate-600">Loading sign-in page...</p>
        </main>
      }
    >
      <SignInContent searchParams={searchParams} />
    </Suspense>
  );
}

