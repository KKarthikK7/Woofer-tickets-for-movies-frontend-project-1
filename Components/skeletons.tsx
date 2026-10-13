// grey shimmering stand-ins shown while a page or part of a page is loading.
// they copy the real layout's sizes so nothing jumps when the content arrives

// thin blue bar along the very top of the screen, so it's obvious something is happening
export const LoadingBar = () => (
  <div className="fixed inset-x-0 top-0 z-50 h-0.5 overflow-hidden" role="progressbar" aria-label="Loading">
    <div className="animate-loading-bar h-full w-2/5 bg-linear-to-r from-transparent via-blue-500 to-transparent shadow-[0_0_8px_rgba(59,130,246,0.8)]" />
  </div>
);

// a city's "Now showing" page (matches movie-grid.tsx)
export const MovieGridSkeleton = () => (
  <main className="flex-1 bg-[#0f0f0f] px-4 py-6 text-white sm:px-14">
    <LoadingBar />
    <header className="mb-8 sm:mb-12">
      <div className="skeleton h-3 w-28 rounded" />
      <div className="skeleton mt-2 h-9 w-44 rounded-lg sm:h-10" />
    </header>

    <div className="grid grid-cols-2 gap-x-4 gap-y-8 sm:grid-cols-4 sm:gap-x-6 sm:gap-y-10 md:grid-cols-5 lg:grid-cols-6 xl:grid-cols-7">
      {Array.from({ length: 14 }, (_, i) => (
        <div key={i} className="overflow-hidden rounded-xl bg-white/5 ring-1 ring-white/10">
          <div className="skeleton aspect-3/4 w-full" />
          <div className="space-y-2 p-3">
            <div className="skeleton h-5 w-4/5 rounded" />
            <div className="skeleton h-4 w-1/2 rounded" />
          </div>
        </div>
      ))}
    </div>
  </main>
);

// the theatres list on a movie's booking page (matches movie-shows.tsx)
export const ShowsSkeleton = () => (
  <section className="mt-8 sm:mt-12">
    <div className="skeleton h-3 w-24 rounded" />
    <div className="skeleton mt-2 h-8 w-36 rounded-lg" />
    <div className="skeleton mt-4 h-5 w-64 max-w-full rounded" />

    <ul className="mt-6 space-y-4">
      {Array.from({ length: 4 }, (_, i) => (
        <li key={i} className="rounded-xl bg-white/5 p-4 ring-1 ring-white/10 sm:p-5">
          <div className="skeleton h-6 w-56 max-w-full rounded" />
          <div className="mt-3 flex flex-wrap gap-3">
            {Array.from({ length: 5 }, (_, j) => (
              <div key={j} className="skeleton h-9 w-22 rounded-lg" />
            ))}
          </div>
        </li>
      ))}
    </ul>
  </section>
);

// the "← Back to <city>" link on a movie page
export const BackLinkSkeleton = () => <div className="skeleton mb-6 h-5 w-32 rounded" />;

// a whole movie booking page (matches app/movie/[id]/page.tsx)
export const MoviePageSkeleton = () => (
  <main className="flex-1 bg-[#0f0f0f] px-4 py-6 text-white sm:px-14">
    <LoadingBar />
    <BackLinkSkeleton />
    <header className="flex items-start gap-4 sm:gap-8">
      <div className="skeleton aspect-3/4 w-28 shrink-0 rounded-xl sm:w-44" />
      <div className="min-w-0 flex-1">
        <div className="skeleton h-9 w-3/4 max-w-md rounded-lg sm:h-14" />
        <div className="skeleton mt-3 h-5 w-28 rounded" />
      </div>
    </header>
    <ShowsSkeleton />
  </main>
);
