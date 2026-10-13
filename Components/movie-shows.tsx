"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { moviesFor } from "./movies";
import { cities } from "./cities";
import { showsFor, type ShowStatus } from "./theatres";
import MovieCity from "./movie-city";

// show-time button colour by how full the show is
const statusStyles: Record<ShowStatus, string> = {
  available: "text-emerald-300 ring-emerald-400/40 hover:bg-emerald-500/15",
  filling: "text-amber-300 ring-amber-400/40 hover:bg-amber-500/15",
  sold: "cursor-not-allowed text-red-400/60 ring-red-500/30 line-through",
};

const statusLabels: Record<ShowStatus, string> = {
  available: "Available",
  filling: "Almost full",
  sold: "Sold out",
};

const dotStyles: Record<ShowStatus, string> = {
  available: "bg-emerald-400",
  filling: "bg-amber-400",
  sold: "bg-red-500",
};

// the city from ?city=..., or else the first city that's showing this movie.
// read in the browser because the site is pre-built (GitHub Pages has no server to read the URL)
const useMovieCity = (movieId: number) => {
  const cityParam = useSearchParams().get("city");
  return (
    cities.find((c) => c.href === `/${cityParam}`) ??
    cities.find((c) => moviesFor(c.href).some((m) => m.id === movieId)) ??
    cities[0]
  );
};

export const BackLink = ({ movieId }: { movieId: number }) => {
  const city = useMovieCity(movieId);
  return (
    <Link
      href={city.href}
      className="mb-6 inline-block text-sm text-neutral-400 transition hover:text-white"
    >
      ← Back to {city.name}
    </Link>
  );
};

// the city's theatres and show times for this movie
export const Shows = ({ movieId }: { movieId: number }) => {
  const city = useMovieCity(movieId);
  const shows = showsFor(city.href, movieId);

  return (
    <section className="mt-8 sm:mt-12">
      <MovieCity href={city.href} />

      <p className="text-xs font-medium uppercase tracking-widest text-neutral-400">
        Theatres in
      </p>
      <h2 className="text-2xl font-bold">{city.name}</h2>

      {/* what the show-time colours mean */}
      <div className="mt-4 flex flex-wrap gap-5 text-sm text-neutral-400">
        {(Object.keys(statusLabels) as ShowStatus[]).map((status) => (
          <span key={status} className="flex items-center gap-2">
            <span className={`h-2.5 w-2.5 rounded-full ${dotStyles[status]}`} />
            {statusLabels[status]}
          </span>
        ))}
      </div>

      <ul className="mt-6 space-y-4">
        {shows.map((show) => (
          <li
            key={show.theatre}
            className="rounded-xl bg-white/5 p-4 ring-1 ring-white/10 sm:p-5"
          >
            <h3 className="text-lg font-semibold">{show.theatre}</h3>
            <div className="mt-3 flex flex-wrap gap-3">
              {show.times.map(({ time, status }) => (
                <button
                  key={time}
                  disabled={status === "sold"}
                  title={statusLabels[status]}
                  // TODO: pick seats for this show
                  className={`rounded-lg px-4 py-2 text-sm font-semibold ring-1 transition ${statusStyles[status]}`}
                >
                  {time}
                </button>
              ))}
            </div>
          </li>
        ))}
      </ul>
    </section>
  );
};
