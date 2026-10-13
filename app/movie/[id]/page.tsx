import { Suspense } from "react";
import { notFound } from "next/navigation";
import { movies } from "@/Components/movies";
import { BackLink, Shows } from "@/Components/movie-shows";
import { BackLinkSkeleton, ShowsSkeleton } from "@/Components/skeletons";

// pre-build one page per movie at build time (needed for the static GitHub Pages site)
export const generateStaticParams = () => movies.map((m) => ({ id: String(m.id) }));

// browser tab title: the movie's name
export const generateMetadata = async ({ params }: PageProps<"/movie/[id]">) => {
  const { id } = await params;
  const movie = movies.find((m) => m.id === Number(id));
  return { title: movie ? `${movie.movie} · Book tickets` : "Movie not found" };
};

// booking page for one movie: /movie/1?city=hyderabad, ... (the number is the movie's id)
const Page = async ({ params }: PageProps<"/movie/[id]">) => {
  const { id } = await params;
  const movie = movies.find((m) => m.id === Number(id));
  if (!movie) notFound(); // unknown id → 404 page

  return (
    <main className="flex-1 bg-[#0f0f0f] px-4 py-6 text-white sm:px-14">
      {/* the city comes from ?city=, which is only known in the browser */}
      <Suspense fallback={<BackLinkSkeleton />}>
        <BackLink movieId={movie.id} />
      </Suspense>

      <header className="flex items-start gap-4 sm:gap-8">
        {/* poster beside the title */}
        <img
          src={movie.poster}
          alt={movie.movie}
          className="skeleton aspect-3/4 w-28 shrink-0 rounded-xl object-cover ring-1 ring-white/10 sm:w-44"
        />
        <div className="min-w-0">
          <h1 className="text-3xl font-bold wrap-break-word sm:text-6xl">{movie.movie}</h1>
          <p className="mt-2 text-base text-neutral-400 sm:text-xl">
            {movie.certificate} · {movie.language}
          </p>
        </div>
      </header>

      <Suspense fallback={<ShowsSkeleton />}>
        <Shows movieId={movie.id} />
      </Suspense>
    </main>
  );
};

export default Page;
