// theatres in each city (keyed by the city's href, like cities.ts / movies.ts)
const cityTheatres: Record<string, string[]> = {
  "/hyderabad": [
    "AMB Cinemas: Gachibowli",
    "Prasads Multiplex: Necklace Road",
    "PVR: Nexus Mall, Kukatpally",
    "INOX: GVK One, Banjara Hills",
    "Asian Cinemas: Kukatpally",
    "Cinepolis: Lulu Mall, Kukatpally",
    "Sandhya 70mm: RTC X Roads",
    "Sudarshan 35mm: RTC X Roads",
    "PVR: Inorbit Mall, Madhapur",
  ],
  "/bangalore": [
    "PVR: Orion Mall, Rajajinagar",
    "INOX: Garuda Mall, Magrath Road",
    "Cinepolis: Nexus Shantiniketan, Whitefield",
    "PVR: Phoenix Marketcity, Whitefield",
    "Urvashi Theatre: Lalbagh Road",
    "Gopalan Cinemas: Mysore Road",
    "PVR: Forum Mall, Koramangala",
    "INOX: Mantri Square, Malleshwaram",
    "Cinepolis: Royal Meenakshi Mall, Bannerghatta Road",
  ],
  "/chennai": [
    "PVR Sathyam: Royapettah",
    "Escape Cinemas: Express Avenue",
    "INOX: Chennai Citi Centre",
    "AGS Cinemas: T. Nagar",
    "Rohini Silver Screens: Koyambedu",
    "Kasi Theatre: Ashok Nagar",
    "PVR: VR Mall, Anna Nagar",
    "INOX: Phoenix Marketcity, Velachery",
    "Kamala Cinemas: Vadapalani",
  ],
  "/mumbai": [
    "PVR: Phoenix Palladium, Lower Parel",
    "INOX: Nariman Point",
    "Maratha Mandir: Mumbai Central",
    "Gaiety Galaxy: Bandra West",
    "PVR Icon: Infiniti Mall, Andheri",
    "Cinepolis: Viviana Mall, Thane",
    "INOX: R City Mall, Ghatkopar",
    "PVR: Juhu",
    "Cinepolis: Fun Republic, Andheri",
  ],
};

// every show time a city runs, in order (each theatre picks a few of these)
const citySlots: Record<string, string[]> = {
  "/hyderabad": ["07:30 AM", "08:45 AM", "10:10 AM", "11:30 AM", "01:05 PM", "02:40 PM", "04:20 PM", "06:15 PM", "07:50 PM", "09:30 PM", "10:45 PM"],
  "/bangalore": ["08:00 AM", "09:15 AM", "10:40 AM", "12:00 PM", "01:35 PM", "03:20 PM", "05:10 PM", "06:45 PM", "08:30 PM", "09:50 PM", "11:15 PM"],
  "/chennai": ["08:30 AM", "10:00 AM", "11:20 AM", "01:15 PM", "02:50 PM", "04:30 PM", "05:55 PM", "07:00 PM", "08:20 PM", "09:00 PM", "11:00 PM"],
  "/mumbai": ["08:15 AM", "09:00 AM", "10:25 AM", "11:45 AM", "01:00 PM", "02:15 PM", "03:55 PM", "05:30 PM", "08:00 PM", "09:20 PM", "10:30 PM"],
};

// how full a show is: green = seats available, yellow = almost full, red = sold out
export type ShowStatus = "available" | "filling" | "sold";

const THEATRES_PER_MOVIE = 7;

// a "random" number in [0, 1) that's always the same for the same inputs,
// so a movie's theatres and times don't reshuffle on every reload
const rand = (...nums: number[]) => {
  let h = 2166136261;
  for (const n of nums) h = Math.imul(h ^ n, 16777619);
  h ^= h >>> 13;
  h = Math.imul(h, 0x5bd1e995);
  h ^= h >>> 15;
  return (h >>> 0) / 4294967296;
};

// 7 theatres showing this movie in this city, each with its own shows and how full they are
export const showsFor = (cityHref: string, movieId: number) => {
  const theatres = cityTheatres[cityHref] ?? [];
  const slots = citySlots[cityHref] ?? [];
  const c = Object.keys(cityTheatres).indexOf(cityHref); // so each city gets its own mix

  return theatres
    .map((theatre, t) => ({ theatre, t, order: rand(c, movieId, t) }))
    .sort((a, b) => a.order - b.order) // shuffle the city's theatres...
    .slice(0, THEATRES_PER_MOVIE) // ...and keep 7
    .map(({ theatre, t }) => {
      const count = 2 + Math.floor(rand(c, movieId, t, 1) * 5); // 2 to 6 shows
      const times = slots
        .map((time, s) => ({ time, s, order: rand(c, movieId, t, s, 2) }))
        .sort((a, b) => a.order - b.order)
        .slice(0, count)
        .sort((a, b) => a.s - b.s) // back into time order
        .map(({ time, s }) => {
          const r = rand(c, movieId, t, s, 3);
          const status: ShowStatus = r < 0.6 ? "available" : r < 0.82 ? "filling" : "sold";
          return { time, status };
        });
      return { theatre, times };
    });
};
