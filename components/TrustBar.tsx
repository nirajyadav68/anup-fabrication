import { ShieldCheck, PenTool, Handshake, Clock3 } from "lucide-react";
import { trustPoints } from "@/lib/data/services";

const icons = [ShieldCheck, PenTool, Handshake, Clock3];

export default function TrustBar() {
  return (
    <section className="border-b border-steel-100 bg-white">
      <div className="mx-auto grid max-w-7xl grid-cols-2 gap-6 px-4 py-10 sm:px-6 md:grid-cols-4 lg:px-8">
        {trustPoints.map((point, i) => {
          const Icon = icons[i] ?? ShieldCheck;
          return (
            <div key={point.title} className="flex flex-col items-start gap-2">
              <Icon className="h-7 w-7 text-signal-500" aria-hidden="true" />
              <p className="font-display text-base font-semibold text-navy-900">{point.title}</p>
              <p className="text-sm text-steel-500">{point.description}</p>
            </div>
          );
        })}
      </div>
    </section>
  );
}
