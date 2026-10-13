"use client";

import { useEffect, useState } from "react";
import { useCity } from "./city-context";
import { useRouter } from "next/navigation";
import { cities } from "./cities";

// detailed silhouettes of each city's landmark, drawn on a 120x100 grid
// (shapes inside the same path are cut out as holes: arches, windows)
const icons: Record<string, React.ReactNode> = {
  // Charminar
  Hyderabad: (
    <>
      <path d="M30 100V34H38V100Z M82 100V34H90V100Z" />
      <path d="M28 34H40V37H28Z M28 52H40V55H28Z M28 72H40V75H28Z M80 34H92V37H80Z M80 52H92V55H80Z M80 72H92V75H80Z" />
      <path d="M29 34Q34 20 39 34Z M81 34Q86 20 91 34Z" />
      <path d="M33.5 28V16H34.5V28Z M85.5 28V16H86.5V28Z" />
      <path d="M38 41H82V44H38Z" />
      <path d="M40 44H80V56H40Z M44 54V49Q46 46 48 49V54Z M52 54V49Q54 46 56 49V54Z M64 54V49Q66 46 68 49V54Z M72 54V49Q74 46 76 49V54Z" />
      <path d="M38 100V56H82V100H70V80Q60 64 50 80V100Z M43 74V67Q46 62 49 67V74Z M71 74V67Q74 62 77 67V74Z" />
    </>
  ),
  // Vidhana Soudha
  Bangalore: (
    <>
      <path d="M14 100V62H106V100Z M19 74V68H23V74Z M26 74V68H30V74Z M33 74V68H37V74Z M40 74V68H44V74Z M76 74V68H80V74Z M83 74V68H87V74Z M90 74V68H94V74Z M97 74V68H101V74Z M19 88V82H23V88Z M26 88V82H30V88Z M33 88V82H37V88Z M40 88V82H44V88Z M76 88V82H80V88Z M83 88V82H87V88Z M90 88V82H94V88Z M97 88V82H101V88Z M47 100V74H50V100Z M52 100V74H55V100Z M57 100V74H63V100Z M65 100V74H68V100Z M70 100V74H73V100Z" />
      <path d="M44 62L60 52L76 62Z" />
      <path d="M18 62V56H26V62Z M94 62V56H102V62Z" />
      <path d="M18 56Q22 49 26 56Z M94 56Q98 49 102 56Z" />
      <path d="M50 53V42H70V53Z M53 50V45H56V50Z M58.5 50V45H61.5V50Z M64 50V45H67V50Z" />
      <path d="M48 42Q60 18 72 42Z" />
      <path d="M59.3 31V21H60.7V31Z" />
      <circle cx="60" cy="20" r="1.8" />
    </>
  ),
  // Temple gopuram
  Chennai: (
    <>
      <path d="M8 100V92H30V100Z M90 100V92H112V100Z" />
      <path d="M28 100L31 86H89L92 100Z M53 100V92Q60 84 67 92V100Z" />
      <path d="M33 84L36 74H84L87 84Z M44 82V77H48V82Z M58 82V77H62V82Z M72 82V77H76V82Z" />
      <path d="M38 72L41 63H79L82 72Z M50 70V66H53V70Z M58.5 70V66H61.5V70Z M67 70V66H70V70Z" />
      <path d="M43 61L46 53H74L77 61Z M54 59V55.5H57V59Z M63 59V55.5H66V59Z" />
      <path d="M48 51L50.5 44H69.5L72 51Z M58.5 49.5V46H61.5V49.5Z" />
      <path d="M47 43Q60 30 73 43Z" />
      <path d="M51.5 41V33H52.5V41Z M55.5 39V30H56.5V39Z M59.5 38V28H60.5V38Z M63.5 39V30H64.5V39Z M67.5 41V33H68.5V41Z" />
    </>
  ),
  // Gateway of India
  Mumbai: (
    <>
      <path d="M22 100V48H98V100H74V72Q60 50 46 72V100Z M28 76V64Q32 58 36 64V76Z M84 76V64Q88 58 92 64V76Z M29 92V84H35V92Z M85 92V84H91V92Z" />
      <path d="M20 45H100V48H20Z" />
      <path d="M22 45V32H32V45Z M88 45V32H98V45Z" />
      <path d="M21 32Q27 22 33 32Z M87 32Q93 22 99 32Z" />
      <path d="M26.5 28V21H27.5V28Z M92.5 28V21H93.5V28Z" />
      <path d="M38 45V36H41V45Z M79 45V36H82V45Z" />
      <path d="M37.5 36Q39.5 31 41.5 36Z M78.5 36Q80.5 31 82.5 36Z" />
      <path d="M44 45V38H76V45Z M48 43V40H51V43Z M54.5 43V40H57.5V43Z M62.5 43V40H65.5V43Z M69 43V40H72V43Z" />
      <path d="M50 38Q60 20 70 38Z" />
      <path d="M59.4 30V21H60.6V30Z" />
    </>
  ),
};

// only mount the picker while it's open, so its state starts fresh every time
const Pop = () => {
  const { pickerOpen } = useCity();
  return pickerOpen ? <Picker /> : null;
};

const Picker = () => {
  const { city: current, closePicker } = useCity();
  const router = useRouter();
  const [selected, setSelected] = useState<string | null>(null);
  const [closing, setClosing] = useState(false);

  // play the "picked" animation, fade the popup out, then go to the city's page
  const pick = (name: string, href: string) => {
    if (selected) return;
    setSelected(name);
    setTimeout(() => setClosing(true), 500);
    setTimeout(() => {
      closePicker();
      router.push(href); // the city comes from the URL, so the navbar updates on arrival
    }, 830);
  };

  // close without changing city (only allowed once a city has been picked)
  const dismiss = () => {
    if (!current || selected) return;
    setClosing(true);
    setTimeout(closePicker, 300);
  };

  // Esc closes the popup too
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && dismiss();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  });

  return (
    <div
      className={`fixed inset-0 z-50 flex overflow-y-auto bg-black/80 p-4 transition-opacity duration-300 ${
        closing ? "opacity-0" : "opacity-100"
      }`}
      onClick={dismiss}
    >
      <div
        onClick={(e) => e.stopPropagation()} // clicks inside the card shouldn't close it
        className={`relative m-auto w-full max-w-4xl rounded-3xl bg-[#141414] p-5 text-white shadow-2xl transition-transform duration-300 sm:p-8 ${
          closing ? "scale-95" : "scale-100"
        }`}
      >
        {current && (
          <button
            onClick={dismiss}
            aria-label="Close"
            className="absolute right-5 top-5 flex h-9 w-9 items-center justify-center rounded-full bg-white/10 text-neutral-300 transition hover:bg-white/20 hover:text-white"
          >
            ✕
          </button>
        )}

        <h2 className="pr-10 text-2xl font-extrabold tracking-tight sm:text-3xl">
          {current ? "Change your city" : "Pick your city"}
        </h2>
        <p className="mt-2 text-sm text-neutral-400">
          We&apos;ll show movies and theatres near you
        </p>

        <div className="mt-6 grid grid-cols-2 gap-3 sm:mt-8 sm:gap-4 md:grid-cols-4">
          {cities.map((city) => {
            const active = selected === city.name;
            const isCurrent = !selected && current === city.name;
            const dimmed = selected !== null && !active;

            return (
              <button
                key={city.name}
                onClick={() => pick(city.name, city.href)}
                style={{ backgroundColor: city.bg, color: city.fg }}
                className={`group relative flex aspect-4/5 flex-col overflow-hidden rounded-2xl p-4 text-left transition duration-300 focus:outline-none focus-visible:ring-4 focus-visible:ring-white/60 ${
                  active
                    ? "scale-105 ring-4 ring-white"
                    : dimmed
                      ? "scale-95 opacity-30"
                      : isCurrent
                        ? "ring-2 ring-white/70 hover:scale-[1.03]"
                        : "hover:scale-[1.03] active:scale-100"
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-lg font-bold text-white">{city.name}</span>

                  {/* arrow slides in on hover, turns into a tick when picked */}
                  <span
                    className={`flex h-7 w-7 items-center justify-center rounded-full text-sm font-bold transition duration-300 ${
                      active
                        ? "scale-100 bg-white opacity-100"
                        : "-translate-x-2 bg-white/20 text-white opacity-0 group-hover:translate-x-0 group-hover:opacity-100"
                    }`}
                    style={active ? { color: city.bg } : undefined}
                  >
                    {active ? "✓" : "→"}
                  </span>
                </div>

                <svg
                  viewBox="0 0 120 100"
                  fill="currentColor"
                  fillRule="evenodd"
                  className="absolute inset-x-0 bottom-0 w-full"
                >
                  {/* sun rises and brightens */}
                  <circle
                    cx="96"
                    cy="26"
                    r="11"
                    className={`transition duration-700 ease-out ${
                      active
                        ? "-translate-y-3.5 opacity-70"
                        : "opacity-25 group-hover:-translate-y-2 group-hover:opacity-45"
                    }`}
                  />
                  {/* distant skyline sinks a little, for depth */}
                  <path
                    d="M0 100V80H8V72H16V84H24V76H30V100Z M90 100V74H98V66H106V78H114V70H120V100Z"
                    className={`opacity-30 transition duration-500 ease-out ${
                      active ? "translate-y-1.5" : "group-hover:translate-y-0.75"
                    }`}
                  />
                  {/* landmark lifts up */}
                  <g
                    className={`transition duration-500 ease-out ${
                      active ? "-translate-y-1.5" : "group-hover:-translate-y-0.75"
                    }`}
                  >
                    {icons[city.name]}
                  </g>
                </svg>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default Pop;
