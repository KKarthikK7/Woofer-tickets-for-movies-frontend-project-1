"use client";

import Link from "next/link";
import { Bebas_Neue } from "next/font/google";
import { useCity } from "./city-context";
import { cities } from "./cities";
import Search from "./search";
import { useSearch } from "./search-context";



// tall condensed cinema-poster lettering, just for the logo
const wordmark = Bebas_Neue({ subsets: ["latin"], weight: "400" });

const Navbar = () => {
  const { city, lastCityHref, openPicker } = useCity();
  const { setQuery } = useSearch();
  const picked = cities.find((c) => c.name === city);

  return (
    <nav className="navbar sticky top-0 z-40 border-b border-white/10 bg-[#141414]/90 backdrop-blur-md">
      {/* on phones the search drops to its own row below the logo; from md up it all fits on one row */}
      <div className="flex flex-wrap items-center gap-x-5 gap-y-3 px-4 py-3 sm:px-6 md:h-16 md:flex-nowrap md:py-0">
        {/* left and right sides share the leftover space equally, so the search stays centred */}
        <div className="flex min-w-0 flex-1 basis-0 items-center gap-5">
          {/* logo takes you back to the last city you were browsing (or home if none yet) and clears the search */}
          <div className="logo shrink-0">
            {/* logo: a silver cinema ticket saying WOOFER */}
            <Link href={lastCityHref ?? "/"} onClick={() => setQuery("")} className="group flex items-center">
              <span
                className={`${wordmark.className} relative flex h-9 items-center rounded-[3px] bg-linear-to-b from-[#f2f2f2] via-[#c8c8c8] to-[#9c9c9c] pl-3 text-[#111] transition-transform duration-200 group-hover:-rotate-3`}
              >
                <span className="pt-0.5 text-[24px] leading-none tracking-[0.06em]">WOOFER</span>
                {/* tear-off stub, split off by a perforated line */}
                <span className="ml-2.5 flex h-full w-5 items-center justify-center border-l-2 border-dashed border-black/30 text-[11px]">
                  ★
                </span>
                {/* notches cut out of the ticket's sides */}
                <span className="absolute -left-1.5 top-1/2 h-3 w-3 -translate-y-1/2 rounded-full bg-[#141414]" />
                <span className="absolute -right-1.5 top-1/2 h-3 w-3 -translate-y-1/2 rounded-full bg-[#141414]" />
              </span>
            </Link>
          </div>

          {picked && (
            <>
              {/* thin divider between logo and city */}
              <span className="hidden h-8 w-px bg-white/15 sm:block" />

              {/* key makes the chip re-animate if the city changes; click it to change city */}
              <button
                key={picked.name}
                onClick={openPicker}
                title="Change city"
                className="animate-chip-in group flex shrink-0 items-center gap-2.5 rounded-full bg-white/5 p-1 text-left ring-1 ring-white/10 transition hover:bg-white/10 hover:ring-white/25 focus:outline-none focus-visible:ring-2 focus-visible:ring-white/60 pr-3"
              >
                <span
                  className="flex h-8 w-8 items-center justify-center rounded-full"
                  style={{ backgroundColor: picked.bg, color: picked.fg }}
                >
                  <svg viewBox="0 0 24 24" fill="currentColor" className="h-4 w-4">
                    <path d="M12 2a7 7 0 0 0-7 7c0 5.25 7 13 7 13s7-7.75 7-13a7 7 0 0 0-7-7Zm0 9.5A2.5 2.5 0 1 1 12 6.5a2.5 2.5 0 0 1 0 5Z" />
                  </svg>
                </span>

                <span className="flex flex-col leading-tight">
                  <span className="text-[10px] font-medium uppercase tracking-widest text-neutral-400">
                    Your city
                  </span>
                  <span className="text-sm font-bold text-white">{picked.name}</span>
                </span>

                {/* chevron nudges down on hover to hint it opens something */}
                <svg
                  viewBox="0 0 20 20"
                  fill="currentColor"
                  className="ml-1 h-4 w-4 text-neutral-400 transition group-hover:translate-y-0.5 group-hover:text-white"
                >
                  <path d="M5.3 7.3a1 1 0 0 1 1.4 0L10 10.6l3.3-3.3a1 1 0 1 1 1.4 1.4l-4 4a1 1 0 0 1-1.4 0l-4-4a1 1 0 0 1 0-1.4Z" />
                </svg>
              </button>
            </>
          )}
        </div>

        <div className="order-last w-full md:order-none md:max-w-xl">
          <Search />
        </div>

        <div className="hidden flex-1 basis-0 md:block" />
      </div>
    </nav>
  );
};

export default Navbar;
