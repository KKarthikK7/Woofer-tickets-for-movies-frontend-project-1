import Link from "next/link";
import { notFound } from "next/navigation";
import { movies, moviesFor } from "@/Components/movies";
import { cities } from "@/Components/cities";
import { showsFor, type ShowStatus } from "@/Components/theatres";
import MovieCity from "@/Components/movie-city";

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

// this page depends on the URL (movie id + ?city=), so it's rendered per request instead of prerendered
export const instant = false;

// browser tab title: the movie's name
export const generateMetadata = async ({ params }: PageProps<"/movie/[id]">) => {
  const { id } = await params;
  const movie = movies.find((m) => m.id === Number(id));
  return { title: movie ? `${movie.movie} · Book tickets` : "Movie not found" };
};

// booking page for one movie: /movie/1?city=hyderabad, ... (the number is the movie's id)
const Page = async ({ params, searchParams }: PageProps<"/movie/[id]">) => {
  const { id } = await params;
  const { city: cityParam } = await searchParams;
  const movie = movies.find((m) => m.id === Number(id));
  if (!movie) notFound(); // unknown id → 404 page

  // the city from ?city=..., or else the first city that's showing this movie
  const city =
    cities.find((c) => c.href === `/${cityParam}`) ??
    cities.find((c) => moviesFor(c.href).some((m) => m.id === movie.id)) ??
    cities[0];
  const shows = showsFor(city.href, movie.id);

  return (
    <main className="flex-1 bg-[#0f0f0f] px-4 py-6 text-white sm:px-14">
      <MovieCity href={city.href} />

      <Link
        href={city.href}
        className="mb-6 inline-block text-sm text-neutral-400 transition hover:text-white"
      >
        ← Back to {city.name}
      </Link>

      <header className="flex items-start gap-4 sm:gap-8">
        {/* poster beside the title */}
        <img
          src={movie.poster}
          alt={movie.movie}
          className="aspect-3/4 w-28 shrink-0 rounded-xl object-cover ring-1 ring-white/10 sm:w-44"
        />
        <div className="min-w-0">
          <h1 className="text-3xl font-bold wrap-break-word sm:text-6xl">{movie.movie}</h1>
          <p className="mt-2 text-base text-neutral-400 sm:text-xl">
            {movie.certificate} · {movie.language}
          </p>
        </div>
      </header>

      <section className="mt-8 sm:mt-12">
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
    </main>
  );
};

export default Page;
