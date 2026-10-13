"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { useCity } from "./city-context";
import { cities } from "./cities";
import { movies, moviesFor } from "./movies";
import { showsFor } from "./theatres";

// a bot message can carry a link button, e.g. "Book tickets →"
type Reply = { text: string; href?: string; label?: string };
type Message = Reply & { from: "bot" | "user" };

// scripted answers: if the user's message contains any keyword, reply with that answer
const replies = [
  {
    keywords: ["city", "location", "change", "move"],
    answer: "Click the city chip next to the logo (top-left) to pick a different city.",
  },
  {
    keywords: ["book", "ticket", "seat"],
    answer:
      "Click a movie's poster, then hit \"Book tickets\". You'll see the theatres in your city and their show times. Pick a time to continue. Or just tell me the movie's name!",
  },
  {
    keywords: ["green", "yellow", "red", "sold", "full", "housefull", "colour", "color", "available"],
    answer: "Show times are colour coded: green = seats available, yellow = almost full, red = sold out (can't be booked).",
  },
  {
    keywords: ["theatre", "theater", "cinema", "timing", "time", "show"],
    answer:
      "Each movie plays at 7 theatres in your city, each with its own show times. Open a movie's booking page to see them all.",
  },
  {
    keywords: ["search", "find", "movie", "film"],
    answer: "Use the search bar at the top. You can search by movie name or language. Tip: press / to jump straight to it.",
  },
  {
    keywords: ["price", "cost", "pay", "refund"],
    answer: "Prices depend on the theatre and show time. You'll see the exact price before you pay.",
  },
  {
    keywords: ["hi", "hello", "hey"],
    answer: "Hey there! 👋 What can I help you with?",
  },
  {
    keywords: ["thank", "thanks", "ok", "cool"],
    answer: "Happy to help! Anything else?",
  },
];

const suggestions = ["What's playing?", "How do I book?", "What do the colours mean?", "Change my city"];

// lowercase, punctuation → spaces ("Avatar: The Way of Water" → "avatar the way of water")
const normalize = (s: string) => s.toLowerCase().replace(/[^a-z0-9]+/g, " ").trim();

// the movie the user named (full name, or a distinctive first word like "kgf"), if any
const findMovie = (text: string, list: typeof movies) => {
  const t = ` ${normalize(text)} `;
  const words = t.trim().split(" ");
  const named = list.filter((m) => t.includes(` ${normalize(m.movie)} `));
  if (named.length) return named.sort((a, b) => b.movie.length - a.movie.length)[0]; // longest name wins
  return list.find((m) => {
    const first = normalize(m.movie).split(" ")[0];
    return first.length >= 3 && first !== "the" && words.includes(first);
  });
};

// what's on, theatre counts and how full the shows are, for a movie in a city
const movieReply = (text: string, cityHref: string | null, cityName: string | null): Reply | null => {
  const inCity = cityHref ? findMovie(text, moviesFor(cityHref)) : undefined;
  if (inCity && cityHref) {
    const shows = showsFor(cityHref, inCity.id);
    const times = shows.flatMap((s) => s.times);
    const open = times.filter((t) => t.status !== "sold").length;
    const filling = times.filter((t) => t.status === "filling").length;
    return {
      text: `${inCity.movie} (${inCity.certificate} · ${inCity.language}) is playing at ${shows.length} theatres in ${cityName}: ${times.length} shows today, ${open} still open${filling ? ` (${filling} almost full)` : ""}.`,
      href: `/movie/${inCity.id}?city=${cityHref.slice(1)}`,
      label: "Book tickets →",
    };
  }

  // not in this city (or no city picked yet): say where it is showing
  const anywhere = findMovie(text, movies);
  if (!anywhere) return null;
  const where = cities.filter((c) => moviesFor(c.href).some((m) => normalize(m.movie) === normalize(anywhere.movie)));
  if (!where.length) return { text: `${anywhere.movie} isn't showing anywhere right now.` };
  const names = where.map((c) => c.name).join(", ");
  return {
    text: cityName
      ? `${anywhere.movie} isn't showing in ${cityName}, but it's on in ${names}. Change your city to book it.`
      : `${anywhere.movie} is showing in ${names}. Pick your city to book it.`,
  };
};

const getReply = (text: string, cityHref: string | null, cityName: string | null): Reply => {
  const movie = movieReply(text, cityHref, cityName);
  if (movie) return movie;

  const words = text.toLowerCase().split(/\W+/);

  // "what's playing?" → list the city's movies
  if (words.some((w) => ["playing", "showing", "running", "list"].includes(w))) {
    if (!cityHref) return { text: "Pick your city first (top-left) and I'll tell you what's playing there." };
    const names = moviesFor(cityHref).map((m) => m.movie).join(", ");
    return { text: `Now showing in ${cityName}: ${names}. Ask me about any of them!` };
  }

  const match = replies.find((r) =>
    r.keywords.some((k) => words.some((w) => w.startsWith(k)))
  );
  return {
    text:
      match?.answer ??
      "Sorry, I didn't get that. Try a movie name, \"what's playing?\", or ask about booking, theatres or your city.",
  };
};

const Chatbot = () => {
  const { city, cityHref } = useCity();
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState("");
  const [typing, setTyping] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    { from: "bot", text: "Hi! I'm your assistant. Ask me anything about the app." },
  ]);
  const listRef = useRef<HTMLDivElement>(null);

  // keep the latest message in view
  useEffect(() => {
    listRef.current?.scrollTo({ top: listRef.current.scrollHeight, behavior: "smooth" });
  }, [messages, typing]);

  // Esc closes the chat
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  const send = (text: string) => {
    if (!text.trim() || typing) return;
    setMessages((m) => [...m, { from: "user", text: text.trim() }]);
    setInput("");
    setTyping(true);

    // short pause so it feels like the bot is typing
    setTimeout(() => {
      const reply = getReply(text, cityHref, city);
      if (city && /city|location/i.test(text)) reply.text = `You're currently in ${city}. ${reply.text}`;
      setMessages((m) => [...m, { from: "bot", ...reply }]);
      setTyping(false);
    }, 700);
  };

  return (
    <div className="fixed bottom-5 right-5 z-40 flex flex-col items-end gap-3">
      {open && (
        <div className="animate-chip-in flex h-[min(28rem,calc(100dvh-7rem))] w-[calc(100vw-2.5rem)] max-w-sm flex-col overflow-hidden rounded-3xl bg-[#1c1c1c] shadow-2xl ring-1 ring-white/10">
          {/* header */}
          <div className="flex items-center gap-3 border-b border-white/10 px-4 py-3">
            <span className="relative flex h-9 w-9 items-center justify-center rounded-full bg-white/10 text-lg">
              🤖
              <span className="absolute bottom-0 right-0 h-2.5 w-2.5 rounded-full bg-green-500 ring-2 ring-[#1c1c1c]" />
            </span>
            <div className="flex-1 leading-tight">
              <p className="text-sm font-bold text-white">Assistant</p>
              <p className="text-xs text-neutral-400">Usually replies instantly</p>
            </div>
            <button
              onClick={() => setOpen(false)}
              aria-label="Close chat"
              className="flex h-8 w-8 items-center justify-center rounded-full text-neutral-400 transition hover:bg-white/10 hover:text-white"
            >
              ✕
            </button>
          </div>

          {/* messages */}
          <div ref={listRef} className="flex flex-1 flex-col gap-2 overflow-y-auto px-4 py-4">
            {messages.map((m, i) => (
              <div
                key={i}
                className={`max-w-[80%] rounded-2xl px-3.5 py-2 text-sm ${
                  m.from === "user"
                    ? "self-end rounded-br-md bg-white text-black"
                    : "self-start rounded-bl-md bg-white/10 text-neutral-100"
                }`}
              >
                <p>{m.text}</p>
                {m.href && (
                  <button
                    onClick={() => {
                      setOpen(false);
                      router.push(m.href!);
                    }}
                    className="mt-2 rounded-full bg-blue-500 px-3 py-1 text-xs font-semibold text-white transition hover:bg-blue-400"
                  >
                    {m.label ?? "Open →"}
                  </button>
                )}
              </div>
            ))}

            {typing && (
              <div className="flex gap-1 self-start rounded-2xl rounded-bl-md bg-white/10 px-3.5 py-3">
                <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-neutral-400" />
                <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-neutral-400 [animation-delay:150ms]" />
                <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-neutral-400 [animation-delay:300ms]" />
              </div>
            )}
          </div>

          {/* quick questions, shown until the user sends something */}
          {messages.length === 1 && (
            <div className="flex flex-wrap gap-2 px-4 pb-3">
              {suggestions.map((s) => (
                <button
                  key={s}
                  onClick={() => send(s)}
                  className="rounded-full px-3 py-1.5 text-xs text-neutral-200 ring-1 ring-white/15 transition hover:bg-white/10"
                >
                  {s}
                </button>
              ))}
            </div>
          )}

          {/* input */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              send(input);
            }}
            className="flex items-center gap-2 border-t border-white/10 p-3"
          >
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Type a message…"
              className="min-w-0 flex-1 rounded-full bg-white/5 px-4 py-2 text-base text-white sm:text-sm ring-1 ring-white/10 placeholder:text-neutral-500 focus:outline-none focus:ring-white/30"
            />
            <button
              type="submit"
              disabled={!input.trim() || typing}
              aria-label="Send"
              className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-white text-black transition hover:scale-105 disabled:opacity-30 disabled:hover:scale-100"
            >
              <svg viewBox="0 0 20 20" fill="currentColor" className="h-4 w-4">
                <path d="M3.1 2.3a1 1 0 0 1 1.1-.1l13 7a1 1 0 0 1 0 1.8l-13 7a1 1 0 0 1-1.4-1.2L5 10 2.8 3.4a1 1 0 0 1 .3-1.1ZM6.7 11l-1.5 4.4L14.9 10 5.2 4.6 6.7 9H11a1 1 0 1 1 0 2H6.7Z" />
              </svg>
            </button>
          </form>
        </div>
      )}

      {/* round launcher button: grows and glows on hover */}
      <button
        onClick={() => setOpen((o) => !o)}
        aria-label={open ? "Close chat" : "Open chat assistant"}
        className="flex h-14 w-14 items-center justify-center rounded-full bg-white text-black shadow-lg shadow-black/40 transition duration-300 hover:scale-110 hover:shadow-[0_0_24px_rgba(255,255,255,0.35)] active:scale-95"
      >
        {open ? (
          <span className="text-lg font-bold">✕</span>
        ) : (
          <svg viewBox="0 0 24 24" fill="currentColor" className="h-6 w-6">
            <path d="M12 3C6.5 3 2 6.9 2 11.7c0 2.4 1.1 4.6 3 6.2L4.2 21a.6.6 0 0 0 .9.7l3.6-2.2c1 .3 2.1.4 3.3.4 5.5 0 10-3.9 10-8.7S17.5 3 12 3Zm-4.5 10a1.3 1.3 0 1 1 0-2.6 1.3 1.3 0 0 1 0 2.6Zm4.5 0a1.3 1.3 0 1 1 0-2.6 1.3 1.3 0 0 1 0 2.6Zm4.5 0a1.3 1.3 0 1 1 0-2.6 1.3 1.3 0 0 1 0 2.6Z" />
          </svg>
        )}
      </button>
    </div>
  );
};

export default Chatbot;
