"use client";

import { useEffect } from "react";
import { useCity } from "./city-context";

// rendered by a movie page to tell the navbar, search and chatbot which city it's showing
const MovieCity = ({ href }: { href: string }) => {
  const { setMovieCityHref } = useCity();
  useEffect(() => {
    setMovieCityHref(href);
    return () => setMovieCityHref(null);
  }, [href, setMovieCityHref]);
  return null;
};

export default MovieCity;
