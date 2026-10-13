"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { cities } from "./cities";

type CityContextType = {
  city: string | null;
  cityHref: string | null;
  lastCityHref: string | null;
  pickerOpen: boolean;
  openPicker: () => void;
  closePicker: () => void;
  setMovieCityHref: (href: string | null) => void;
};

const CityContext = createContext<CityContextType | null>(null);

// the picked city is read from the URL (/hyderabad → "Hyderabad"), so it survives
// reloads and typed-in URLs; movie pages (/movie/8?city=hyderabad) report their city
// through setMovieCityHref. Also tracks whether the city popup is showing
export const CityProvider = ({ children }: { children: React.ReactNode }) => {
  const pathname = usePathname();
  const onMoviePage = pathname.startsWith("/movie/");
  const [movieCityHref, setMovieCityHref] = useState<string | null>(null);
  const picked =
    cities.find((c) => c.href === pathname) ??
    (onMoviePage ? cities.find((c) => c.href === movieCityHref) : undefined);
  const city = picked?.name ?? null;
  const cityHref = picked?.href ?? null;

  // ask for a city only if the URL has none (movie pages pick theirs themselves)
  const [pickerOpen, setPickerOpen] = useState(!city && !onMoviePage);

  // remember the last city visited (also across reloads) so the logo can link back to it
  const [lastCityHref, setLastCityHref] = useState<string | null>(null);
  useEffect(() => {
    if (cityHref) {
      setLastCityHref(cityHref);
      try {
        localStorage.setItem("lastCityHref", cityHref);
      } catch {}
    } else {
      try {
        const saved = localStorage.getItem("lastCityHref");
        if (cities.some((c) => c.href === saved)) setLastCityHref(saved);
      } catch {}
    }
  }, [cityHref]);

  return (
    <CityContext.Provider
      value={{
        city,
        cityHref,
        lastCityHref,
        pickerOpen,
        openPicker: () => setPickerOpen(true),
        closePicker: () => setPickerOpen(false),
        setMovieCityHref,
      }}
    >
      {children}
    </CityContext.Provider>
  );
};

export const useCity = () => {
  const ctx = useContext(CityContext);
  if (!ctx) throw new Error("useCity must be used inside CityProvider");
  return ctx;
};
