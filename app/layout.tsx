import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Navbar from "@/Components/navbar";
import { CityProvider } from "@/Components/city-context";
import { SearchProvider } from "@/Components/search-context";
import Chatbot from "@/Components/chatbot";
import Pop from "@/Components/pop";


const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Movie Tickets",
  description: "Browse movies in your city, pick a theatre and show time, and book tickets.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <CityProvider>
          <SearchProvider>
            <Navbar/>
            <Pop/>
            {children}
            <Chatbot/>
          </SearchProvider>
        </CityProvider>
      </body>
    </html>
  );
}
