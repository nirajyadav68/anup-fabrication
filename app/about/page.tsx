import type { Metadata } from "next";
import { ShieldCheck, PenTool, Handshake, Clock3 } from "lucide-react";
import { trustPoints } from "@/lib/data/services";
import { siteConfig } from "@/lib/site-config";


export const metadata: Metadata = {
  title: "About Us",
  description: `Learn about ${siteConfig.name} — our workshop, our approach to MS and SS fabrication, and why customers trust us with their projects.`,
  alternates: { canonical: "/about" },
};

const icons = [ShieldCheck, PenTool, Handshake, Clock3];

export default function AboutPage() {
  return (
    <>
      <section className="bg-navy-900">
        <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
          <p className="font-mono text-xs uppercase tracking-[0.25em] text-signal-400">
            About Us
          </p>
          <h1 className="mt-3 max-w-2xl font-display text-4xl font-bold text-white sm:text-5xl">
            A workshop built on precision, not shortcuts.
          </h1>
        </div>
      </section>

      <section className="mx-auto max-w-4xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="prose prose-slate max-w-none">
          <p className="text-lg leading-relaxed text-steel-700">
            {siteConfig.name} fabricates MS and SS work for homes, offices and industrial
            sites — gates, railings, doors, windows, grills, sheds and structural steel,
            along with one-off custom pieces that don&apos;t fit a catalogue.
          </p>
          <p className="mt-4 leading-relaxed text-steel-700">
            Every job starts with a measurement, not a guess. We size to your opening, weld
            to spec, and finish the piece before it ever leaves the shop — so what arrives
            on site fits the first time.
          </p>
        </div>

        <div className="mt-14 grid grid-cols-1 gap-6 sm:grid-cols-2">
          {trustPoints.map((point, i) => {
            const Icon = icons[i] ?? ShieldCheck;
            return (
              <div key={point.title} className="rounded-lg border border-steel-100 bg-white p-6">
                <Icon className="h-6 w-6 text-signal-500" aria-hidden="true" />
                <h2 className="mt-3 font-display text-lg font-semibold text-navy-900">
                  {point.title}
                </h2>
                <p className="mt-1.5 text-sm text-steel-500">{point.description}</p>
              </div>
            );
          })}
        </div>
      </section>
    </>
  );
}
