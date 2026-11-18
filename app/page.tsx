import { PrintBrief } from "@/components/PrintBrief";
import { RemoveOnMount } from "@/components/RemoveOnMount";
import { StaticProfile } from "@/components/StaticProfile";
import { Terminal } from "@/components/terminal/Terminal";

export default function HomePage() {
  return (
    <main id="main" className="relative">
      <div className="ambient screen-only" aria-hidden />
      <h1 className="sr-only">Yvan Maribbay — Developer &amp; AI Engineer</h1>

      <div className="screen-only relative z-10">
        <Terminal />
      </div>

      <noscript>
        {/* Without JavaScript the shell cannot respond; show the real content
            instead of an inert prompt. */}
        <style>{`.screen-only { display: none !important }`}</style>
        <div className="mx-auto max-w-3xl px-5 py-10">
          <StaticProfile />
        </div>
      </noscript>

      <div id="static-profile" className="sr-only">
        <StaticProfile />
        <RemoveOnMount id="static-profile" />
      </div>

      <div className="print-only print-brief">
        <PrintBrief />
      </div>
    </main>
  );
}
