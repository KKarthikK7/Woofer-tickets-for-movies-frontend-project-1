"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { filterMovies, movies, moviesFor } from "./movies";
import { useSearch } from "./search-context";
import { useCity } from "./city-context";

const Search = () => {
  const { query, setQuery } = useSearch();
  const [open, setOpen] = useState(false);
  const [highlight, setHighlight] = useState(0);
  const boxRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const q = query.trim();
  const { cityHref } = useCity();
  const router = useRouter();
  const results = q ? filterMovies(moviesFor(cityHref ?? ""), q) : []; // only the current city's movies

  // close the dropdown when clicking anywhere outside the search box
  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      if (!boxRef.current?.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, []);

  // press "/" anywhere to jump to the search bar (but not while typing in another box, e.g. the chatbot)
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const el = document.activeElement as HTMLElement | null;
      const typing = el?.tagName === "INPUT" || el?.tagName === "TEXTAREA" || el?.isContentEditable;
      if (e.key === "/" && !typing) {
        e.preventDefault();
        inputRef.current?.focus();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  // on a city page: fill the box, then scroll to that movie's card and flash it so it's easy to spot.
  // anywhere else (e.g. a movie page): open that movie's booking page
  const choose = (m: (typeof movies)[number]) => {
    setOpen(false);
    inputRef.current?.blur();
    const card = document.getElementById(`movie-${m.id}`);
    if (!card) {
      setQuery("");
      router.push(`/movie/${m.id}${cityHref ? `?city=${cityHref.slice(1)}` : ""}`);
      return;
    }
    setQuery(m.movie);
    card.scrollIntoView({ behavior: "smooth", block: "center" });
    card.animate(
      [{ boxShadow: "0 0 0 3px rgb(59 130 246)" }, { boxShadow: "0 0 0 3px rgb(59 130 246 / 0)" }],
      { duration: 1500, easing: "ease-out" }
    );
  };

  // arrow keys move through results, Enter picks, Esc closes
  const onKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setHighlight((h) => Math.max(0, Math.min(h + 1, results.length - 1)));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setHighlight((h) => Math.max(h - 1, 0));
    } else if (e.key === "Enter" && results[highlight]) {
      choose(results[highlight]);
    } else if (e.key === "Escape") {
      setOpen(false);
      inputRef.current?.blur();
    }
  };

  return (
    <div ref={boxRef} className="relative w-full">
      <div className="flex h-11 items-center gap-3 rounded-full bg-white/5 px-4 ring-1 ring-white/10 transition focus-within:bg-white/10 focus-within:ring-white/30 hover:ring-white/20">
        <svg viewBox="0 0 20 20" fill="currentColor" className="h-4 w-4 shrink-0 text-neutral-400">
          <path d="M8.5 2a6.5 6.5 0 0 1 5.17 10.44l3.94 3.95a1 1 0 0 1-1.42 1.41l-3.94-3.94A6.5 6.5 0 1 1 8.5 2Zm0 2a4.5 4.5 0 1 0 0 9 4.5 4.5 0 0 0 0-9Z" />
        </svg>

        <input
          ref={inputRef}
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setOpen(true);
            setHighlight(0);
          }}
          onFocus={() => setOpen(true)}
          onKeyDown={onKeyDown}
          placeholder="Search for movies or languages"
          className="min-w-0 flex-1 bg-transparent text-base text-white sm:text-sm placeholder:text-neutral-500 focus:outline-none"
        />

        {query ? (
          <button
            onClick={() => {
              setQuery("");
              inputRef.current?.focus();
            }}
            aria-label="Clear search"
            className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-xs text-neutral-400 transition hover:bg-white/10 hover:text-white"
          >
            ✕
          </button>
        ) : (
          <kbd className="hidden shrink-0 rounded border border-white/15 px-1.5 text-[11px] text-neutral-500 sm:block">
            /
          </kbd>
        )}
      </div>

      {open && q && (
        <div className="animate-chip-in absolute inset-x-0 top-full mt-2 overflow-hidden rounded-2xl bg-[#1c1c1c] py-2 shadow-2xl ring-1 ring-white/10">
          {results.length > 0 ? (
            results.map((m, i) => (
              <button
                key={m.id}
                onMouseEnter={() => setHighlight(i)}
                onClick={() => choose(m)}
                className={`flex w-full items-center justify-between gap-4 px-4 py-2.5 text-left transition ${
                  i === highlight ? "bg-white/10" : ""
                }`}
              >
                <span className="truncate text-sm font-semibold text-white">{m.movie}</span>
                <span className="shrink-0 text-xs text-neutral-400">
                  {m.language} · {m.certificate}
                </span>
              </button>
            ))
          ) : (
            <p className="px-4 py-3 text-sm text-neutral-400">
              No movies found for &ldquo;{query.trim()}&rdquo;
            </p>
          )}
        </div>
      )}
    </div>
  );
};

export default Search;
