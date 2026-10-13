"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { filterMovies, movies } from "./movies";
import { useSearch } from "./search-context";

// badge colour per censor rating; anything unknown falls back to neutral
const certificateStyles: Record<string, string> = {
  A: "bg-red-500/15 text-red-300 ring-red-400/30",
  UA: "bg-amber-500/15 text-amber-300 ring-amber-400/30",
  U: "bg-emerald-500/15 text-emerald-300 ring-emerald-400/30",
};

type Props = {
  city: string;
  list: typeof movies;
};

// a city's "Now showing" page: the movie cards, filtered by the navbar search
const MovieGrid = ({ city, list }: Props) => {
  const { query, setQuery } = useSearch();
  const shown = filterMovies(list, query);
  const router = useRouter();

  // the movie card that was clicked and is showing the "Book tickets" button
  const [selected, setSelected] = useState<number | null>(null);

  // clicking outside any card, or pressing Esc, hides the button again
  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      if (!(e.target as HTMLElement).closest("[data-movie-card]")) setSelected(null);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setSelected(null);
    };
    document.addEventListener("mousedown", onClick);
    window.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onClick);
      window.removeEventListener("keydown", onKey);
    };
  }, []);

  return (
    <main className="flex-1 bg-[#0f0f0f] px-4 py-6 text-white sm:px-14">
      <div>
        <header className="mb-8 sm:mb-12">
          <p className="text-xs font-medium uppercase tracking-widest text-neutral-400">
            Now showing in
          </p>
          <h1 className="text-3xl font-bold sm:text-4xl">{city}</h1>
        </header>

        {shown.length === 0 && (
          <div className="py-16 text-center">
            <p className="text-neutral-400">No movies found for &ldquo;{query.trim()}&rdquo;</p>
            <button
              onClick={() => setQuery("")}
              className="mt-4 rounded-full bg-white/10 px-4 py-2 text-sm font-semibold transition hover:bg-white/20"
            >
              Show all movies
            </button>
          </div>
        )}

        <div className="grid grid-cols-2 gap-x-4 gap-y-8 sm:grid-cols-4 sm:gap-x-6 sm:gap-y-10 md:grid-cols-5 lg:grid-cols-6 xl:grid-cols-7">
          {shown.map((block) => (
            <div
              key={block.id}
              id={`movie-${block.id}`}
              data-movie-card
              onClick={() => {
                setSelected(selected === block.id ? null : block.id);
              }}
              className="group relative cursor-pointer overflow-hidden rounded-xl bg-white/5 ring-1 ring-white/10 transition-all duration-300 hover:-translate-y-1 hover:bg-white/10 hover:shadow-[0_0_24px_rgba(59,130,246,0.45)]"
            >
              {/* hover border is revealed bottom -> top by animating the clip; follows the rounded corners */}
              <span className="pointer-events-none absolute inset-0 z-10 rounded-[inherit] border-2 border-blue-500 transition-[clip-path] duration-500 ease-out [clip-path:inset(100%_0_0_0)] group-hover:[clip-path:inset(0_0_0_0)]" />
              {/* soft glow rising from the bottom alongside the border */}
              <span className="pointer-events-none absolute inset-0 z-10 bg-linear-to-t from-blue-500/25 via-blue-500/5 to-transparent translate-y-full transition-transform duration-500 ease-out group-hover:translate-y-0" />

              {/* clicked card: dim it and pop up a "Book tickets" button */}
              {selected === block.id && (
                <div className="animate-chip-in absolute inset-0 z-20 flex flex-col items-center justify-center gap-3 bg-black/65 p-3 text-center backdrop-blur-[2px]">
                  <p className="text-sm font-bold">{block.movie}</p>
                  <button
                    onClick={(e) => {
                      e.stopPropagation(); // don't let the card's click close the overlay
                      router.push(`/movie/${block.id}?city=${city.toLowerCase()}`);
                    }}
                    className="rounded-full bg-blue-500 px-5 py-2 text-sm font-semibold shadow-lg shadow-blue-500/30 transition hover:scale-105 hover:bg-blue-400 active:scale-95"
                  >
                    Book tickets
                  </button>
                </div>
              )}

              <img
                src={block.poster}
                alt={block.movie}
                className="skeleton aspect-3/4 w-full object-cover" // shimmers until the poster arrives
              />

              <div className="space-y-2 p-3">
                <h2 className="truncate text-base font-bold">{block.movie}</h2>
                <div className="flex items-center gap-2">
                  <h3
                    className={`rounded-md px-1.5 py-0.5 text-[11px] font-bold ring-1 ${
                      certificateStyles[block.certificate] ?? "bg-white/10 text-neutral-300 ring-white/20"
                    }`}
                  >
                    {block.certificate}
                  </h3>
                  <h3 className="text-sm text-neutral-400">{block.language}</h3>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </main>
  );
};

export default MovieGrid;
