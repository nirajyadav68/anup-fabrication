import Link from "next/link";

export default function NotFound() {
  return (
    <section className="mx-auto flex max-w-2xl flex-col items-center px-4 py-24 text-center sm:px-6">
      <p className="font-mono text-sm uppercase tracking-[0.25em] text-signal-600">404</p>
      <h1 className="mt-3 font-display text-3xl font-bold text-navy-900 sm:text-4xl">
        Page not found
      </h1>
      <p className="mt-3 text-steel-500">
        The page you&apos;re looking for doesn&apos;t exist or may have moved.
      </p>
      <Link
        href="/"
        className="mt-6 rounded-md bg-signal-500 px-6 py-3 text-sm font-semibold text-white hover:bg-signal-600"
      >
        Back to Home
      </Link>
    </section>
  );
}
